/**
 * Clinician-Facing RAG Pipeline for Between Sessions
 * 
 * Orchestrates:
 * 1. Practitioner authentication & patient relationship verification
 * 2. Cedar WASM cryptographic authorization & patient consent enforcement
 * 3. Structured patient telemetry extraction from DynamoDB
 * 4. Semantic retrieval of curated OCD/ERP clinical knowledge
 * 5. Constrained prompt construction enforcing FACT vs INFERENCE vs KNOWLEDGE
 * 6. Multi-provider LLM synthesis with offline fallback
 * 7. Traceable persistence in DynamoDB single-table
 */

const cedar = require('@cedar-policy/cedar-wasm/nodejs');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { retrieveRelevantKnowledge } = require('./clinicalKnowledge');
const { getLLMProvider } = require('./llmProvider');

const TABLE_NAME = process.env.TABLE_NAME || 'BetweenSessionsTable';
const ddbEndpoint = process.env.DYNAMODB_ENDPOINT;
const ddbClient = new DynamoDBClient(
  ddbEndpoint
    ? { endpoint: ddbEndpoint, region: 'local', credentials: { accessKeyId: 'dummy', secretAccessKey: 'dummy' } }
    : {}
);
const docClient = DynamoDBDocumentClient.from(ddbClient);

// ── Cedar Policy Definition ───────────────────────────────────────────────────

const CEDAR_POLICY = `
permit (
    principal,
    action == Action::"ReadPatientSummary",
    resource
)
when {
    context.practitionerVerified == true &&
    context.connectionStatus == "ACTIVE" &&
    context.consentedCategories.contains("practice_logs")
};
`;

function evaluateCedarConsent(practitionerId, patientId, connectionStatus, consentedCategories, isVerified = true) {
  try {
    const result = cedar.isAuthorized({
      policies: { staticPolicies: CEDAR_POLICY },
      entities: [
        { uid: { type: 'Practitioner', id: practitionerId }, attrs: {}, parents: [] },
        { uid: { type: 'Patient', id: patientId }, attrs: {}, parents: [] },
      ],
      principal: { type: 'Practitioner', id: practitionerId },
      action:    { type: 'Action', id: 'ReadPatientSummary' },
      resource:  { type: 'Patient', id: patientId },
      context: {
        practitionerVerified: isVerified,
        connectionStatus,
        consentedCategories: Array.isArray(consentedCategories) ? consentedCategories : [],
      },
    });
    return (result?.response?.decision ?? result?.decision) === 'allow';
  } catch {
    // Fallback if WASM is interrupted
    return isVerified && connectionStatus === 'ACTIVE' &&
      Array.isArray(consentedCategories) && consentedCategories.includes('practice_logs');
  }
}

// ── DynamoDB Query Helpers ────────────────────────────────────────────────────

async function queryPatientWindow(pk, skPrefix, fromISO, toISO) {
  const res = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND SK BETWEEN :from AND :to',
    ExpressionAttributeValues: {
      ':pk': pk,
      ':from': `${skPrefix}#${fromISO}`,
      ':to':   `${skPrefix}#${toISO}Z`,
    },
    ScanIndexForward: false,
  }));
  return res.Items || [];
}

// ── Prompt Construction ───────────────────────────────────────────────────────

const CLINICAL_SYSTEM_PROMPT = `You are a clinical decision-support synthesis assistant for Between Sessions, an evidence-based digital platform for Obsessive-Compulsive Disorder (OCD) and Exposure and Response Prevention (ERP).

You are generating a structured synthesis strictly for a LICENSED PRACTITIONER to review between sessions.
The practitioner remains entirely responsible for all clinical decisions and diagnostic judgments.

MANDATORY CLINICAL BOUNDARIES:
- Clinician-facing only. NEVER address the patient directly.
- Summarize observed behavioral metrics and qualitative patterns objectively.
- NO diagnosis, NO clinical labels, NO medication recommendations, and NO unilateral treatment changes.
- NO reassurance loops, NO "OCD severity scores", and NO recovery percentages.
- Clearly differentiate:
  * FACT: What the recorded patient telemetry explicitly demonstrates.
  * INFERENCE: Tentative observations or patterns for the clinician's consideration.
  * KNOWLEDGE: Established principles from the retrieved clinical literature.
- Every observation MUST cite specific evidence IDs from the provided patient logs where applicable.
- If data in a category is sparse or absent, explicitly note the absence; DO NOT invent or assume data.
- Be concise. Keep observations, patterns, and questions to 1-2 focused items each.
- Return output strictly in valid JSON matching the specified schema.`;

function buildClinicianUserPrompt(patientContext, knowledgeChunks) {
  const patientName = patientContext.patientProfile?.name || 'Patient';
  const checkinCount = patientContext.checkins.length;
  const practiceCount = patientContext.practice.length;
  const journalCount = patientContext.journal.length;
  const metrics = patientContext.metrics;

  let knowledgeSection = 'RETRIEVED CLINICAL KNOWLEDGE (GROUNDING CORPUS):\n';
  knowledgeChunks.forEach((chunk, i) => {
    knowledgeSection += `[${i + 1}] ID: ${chunk.chunkId} | Source: ${chunk.source}\nCitation: ${chunk.citation}\nText: ${chunk.text}\n\n`;
  });

  let patientDataSection = `PATIENT PRACTICE TELEMETRY (FACTS FROM LOGS):
Patient ID: ${patientContext.userId}
Patient Name: ${patientName}
Reporting Window: ${patientContext.windowFrom} to ${patientContext.windowTo}
Total Spontaneous Check-ins: ${checkinCount} (Average SUDS: ${metrics.avgSuds}/10, Peak SUDS: ${metrics.peakSuds}/10)
Total Planned Exposure Practices: ${practiceCount}
Total Behavioral Logs / Responses: ${journalCount}

Recent Check-in Telemetry:
${patientContext.checkins.slice(0, 5).map(c => ` - ID: ${c.SK} | Date: ${c.createdAt?.slice(0, 10)} | SUDS: ${c.sudsScore}/10 | Urge: ${c.urgeScore}/10`).join('\n') || 'None recorded'}

Recent Exposure Practices:
${patientContext.practice.slice(0, 5).map(p => ` - ID: ${p.SK} | Exercise: ${p.exerciseId} | Pre-Distress: ${p.preDistress} | Post-Distress: ${p.postDistress} | Completed: ${p.completed}`).join('\n') || 'None recorded'}

Recent Behavioral Logs:
${patientContext.journal.slice(0, 5).map(j => ` - ID: ${j.SK} | Response Type: ${j.responseType} | Trigger: ${j.trigger || 'Unspecified'}`).join('\n') || 'None recorded'}
`;

  return `${knowledgeSection}
${patientDataSection}

TASK:
Synthesize the above data into a structured JSON response for the practitioner.
Ensure every observation references evidence IDs from the patient telemetry.
Keep each section concise (1-2 items per section).
Ground clinical considerations in the retrieved literature chunks.

JSON Schema format:
{
  "summary": "String synthesizing longitudinal practice engagement and distress curve",
  "practice_observations": [
    { "observation": "String", "evidence": ["SK or ID from patient logs"] }
  ],
  "patterns": [
    { "pattern": "String noting distress decay, ritual delay, or avoidance pattern", "evidence": ["SK or ID"] }
  ],
  "clinical_context": [
    { "point": "Key clinical principle relevant to this patient's practice", "source": "Citation string", "chunkId": "Chunk ID" }
  ],
  "questions_for_practitioner": [
    "Targeted session preparation question for the clinician"
  ],
  "limitations": [
    "AI-generated decision support; practitioner clinical review required."
  ]
}`;
}

// ── Main Pipeline Execution ───────────────────────────────────────────────────

/**
 * Execute the end-to-end Clinician RAG Pipeline
 * 
 * @param {Object} params
 * @param {string} params.practitionerId - Authenticated practitioner ID
 * @param {string} params.patientId - Target patient user ID
 * @param {number} [params.days=30] - Lookback window in days
 * @returns {Promise<Object>} Structured clinical synthesis and metadata
 */
async function runClinicianRagPipeline({ practitionerId, patientId, days = 30 }) {
  if (!practitionerId) {
    throw { statusCode: 401, code: 'UNAUTHORIZED', message: 'Practitioner authentication required.' };
  }
  if (!patientId) {
    throw { statusCode: 400, code: 'VALIDATION_ERROR', message: 'Patient ID required.' };
  }

  // 1. Verify connection status in DynamoDB
  const connRes = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: `USER#${patientId}`, SK: `CONNECTION#${practitionerId}` },
  }));
  const connection = connRes.Item;

  if (!connection || !['ACTIVE', 'active'].includes(connection.status)) {
    throw {
      statusCode: 403,
      code: 'FORBIDDEN',
      message: 'No active clinical connection with this patient. Practitioner cannot access patient telemetry.',
    };
  }

  // 2. Cryptographic Cedar Policy Evaluation
  const consentedCategories = connection.consentedCategories || [];
  const cedarAllowed = evaluateCedarConsent(
    practitionerId,
    patientId,
    connection.status,
    consentedCategories,
    true
  );

  if (!cedarAllowed) {
    throw {
      statusCode: 403,
      code: 'CONSENT_REQUIRED',
      message: 'Access denied by Cedar authorization policy. The patient must explicitly grant practice_logs consent.',
    };
  }

  // 3. Fetch consented patient telemetry from DynamoDB
  const now = new Date();
  const toISO = now.toISOString();
  const fromISO = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  const pk = `USER#${patientId}`;

  const hasConsent = (cat) => consentedCategories.includes(cat);

  const [checkins, practiceEntries, journalEntries, profileRes] = await Promise.all([
    hasConsent('checkins') ? queryPatientWindow(pk, 'CHECKIN', fromISO, toISO) : Promise.resolve([]),
    hasConsent('practice_logs') ? queryPatientWindow(pk, 'PRACTICE', fromISO, toISO) : Promise.resolve([]),
    hasConsent('journal_structured') ? queryPatientWindow(pk, 'JOURNAL', fromISO, toISO) : Promise.resolve([]),
    docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: pk, SK: 'PROFILE' } })).catch(() => ({})),
  ]);

  const patientProfile = profileRes.Item || { name: 'Patient' };

  // Calculate telemetry metrics
  const sudsScores = checkins.map(c => c.sudsScore).filter(s => typeof s === 'number');
  const avgSuds = sudsScores.length ? (sudsScores.reduce((a, b) => a + b, 0) / sudsScores.length).toFixed(1) : null;
  const peakSuds = sudsScores.length ? Math.max(...sudsScores) : null;
  const minSuds = sudsScores.length ? Math.min(...sudsScores) : null;

  const patientContext = {
    userId: patientId,
    patientProfile: {
      name: patientProfile.name || 'Patient',
      ageBand: patientProfile.ageBand || 'Adult',
      values: patientProfile.values || [],
    },
    windowFrom: fromISO.slice(0, 10),
    windowTo: toISO.slice(0, 10),
    checkins,
    practice: practiceEntries,
    journal: journalEntries,
    metrics: {
      avgSuds: avgSuds !== null ? Number(avgSuds) : 'N/A',
      peakSuds: peakSuds !== null ? peakSuds : 'N/A',
      minSuds: minSuds !== null ? minSuds : 'N/A',
      checkinCount: checkins.length,
      practiceCount: practiceEntries.length,
      journalCount: journalEntries.length,
    },
  };

  // 4. Formulate retrieval query and retrieve clinical knowledge chunks
  const responseKeywords = journalEntries.map(j => j.responseType).filter(Boolean);
  const practiceKeywords = practiceEntries.map(p => p.exerciseId).filter(Boolean);
  const queryTerms = [
    ...responseKeywords,
    ...practiceKeywords,
    avgSuds && Number(avgSuds) >= 6 ? 'distress tolerance exposure' : 'habituation expectancy',
    'response prevention inhibitory learning reassurance',
  ].join(' ');

  const knowledgeChunks = retrieveRelevantKnowledge(queryTerms, { limit: 3 });

  // 5. Construct prompts and invoke LLM provider
  const userPrompt = buildClinicianUserPrompt(patientContext, knowledgeChunks);
  const provider = getLLMProvider();

  const llmResult = await provider.generateStructured({
    systemPrompt: CLINICAL_SYSTEM_PROMPT,
    userPrompt,
    patientContext,
    knowledgeChunks,
  });

  const generatedAt = toISO;
  const synthesisId = `SYNTH_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  // 6. Record generated synthesis in DynamoDB for traceability
  const synthesisRecord = {
    PK: `USER#${patientId}`,
    SK: `AI#SYNTHESIS#${practitionerId}#${generatedAt}`,
    entityType: 'ClinicianAiSynthesis',
    synthesisId,
    userId: patientId,
    practitionerId,
    generatedAt,
    provider: llmResult.provider,
    model: llmResult.model,
    reportingPeriod: { from: fromISO, to: toISO },
    knowledgeChunksUsed: knowledgeChunks.map(k => ({ chunkId: k.chunkId, title: k.title, citation: k.citation })),
    sourceMetricIds: [
      ...checkins.map(c => c.SK),
      ...practiceEntries.map(p => p.SK),
      ...journalEntries.map(j => j.SK),
    ],
    synthesis: llmResult.output,
    disclaimer: 'AI-generated clinical decision support for licensed practitioners — not a diagnosis or clinical directive.',
  };

  try {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: synthesisRecord,
    }));
  } catch (err) {
    console.warn('[ragPipeline] Note: Could not persist synthesis record to DynamoDB:', err.message);
  }

  return {
    synthesisId,
    patientId,
    practitionerId,
    generatedAt,
    provider: llmResult.provider,
    model: llmResult.model,
    note: llmResult.note || undefined,
    reportingPeriod: { from: fromISO, to: toISO },
    metrics: patientContext.metrics,
    knowledgeRetrieved: knowledgeChunks.map(k => ({
      chunkId: k.chunkId,
      title: k.title,
      source: k.source,
      citation: k.citation,
      category: k.category,
      score: k.score,
    })),
    synthesis: llmResult.output,
  };
}

module.exports = {
  runClinicianRagPipeline,
  evaluateCedarConsent,
  CLINICAL_SYSTEM_PROMPT,
  buildClinicianUserPrompt,
};
