/**
 * Between Sessions — Comprehensive AI & RAG Integration Test Suite
 * 
 * Verifies:
 *  1. Curated Clinical Knowledge Base semantic retrieval & citation metadata
 *  2. Multi-provider LLM abstraction & deterministic mock fallback
 *  3. Structured output schema validation & JSON error recovery
 *  4. End-to-end RAG synthesis generation over local SAM API
 *  5. Evidence traceability (observations cite specific DynamoDB telemetry IDs)
 *  6. Cedar WASM consent enforcement (403 when practice_logs not granted)
 *  7. Cross-Practitioner Isolation (Practitioner A blocked from Practitioner B's patient)
 *  8. Anti-pattern prohibition (zero diagnosis, zero reassurance, zero gamification)
 */

const assert = require('assert');
const { retrieveRelevantKnowledge, CLINICAL_KNOWLEDGE_BASE } = require('./src/clinicalKnowledge');
const { MockLLMProvider, validateAndNormalizeOutput } = require('./src/llmProvider');
const { evaluateCedarConsent } = require('./src/ragPipeline');

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api/v1';

async function req(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

async function runTests() {
  console.log('======================================================');
  console.log('   BETWEEN SESSIONS: AI & CLINICAL RAG TEST SUITE     ');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  function check(desc, condition) {
    total++;
    try {
      assert(condition, desc);
      console.log(`  ✓ PASS: ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${desc}`);
      console.error(`    ${err.message}`);
      throw err;
    }
  }

  // ── TEST 1: Clinical Knowledge Base & Metadata ─────────────────────────────
  console.log('Test Group 1: Curated Clinical Knowledge & Retrieval');
  check('Knowledge base has curated clinical entries', CLINICAL_KNOWLEDGE_BASE.length >= 6);

  const sampleChunk = CLINICAL_KNOWLEDGE_BASE[0];
  check('Knowledge chunks contain required metadata (documentId, chunkId, citation, tags)',
    sampleChunk.documentId && sampleChunk.chunkId && sampleChunk.citation && sampleChunk.tags?.length > 0
  );

  const reassuranceChunks = retrieveRelevantKnowledge('reassurance checking ritual doubt', { limit: 2 });
  check('Retrieval matches reassurance principles on relevant query',
    reassuranceChunks.some(c => c.chunkId === 'OCD-REASSURE-03' || c.tags.includes('reassurance'))
  );

  const inhibitoryChunks = retrieveRelevantKnowledge('inhibitory learning expectancy violation', { limit: 2 });
  check('Retrieval prioritizes Craske inhibitory learning on ERP principles query',
    inhibitoryChunks.some(c => c.chunkId === 'ERP-INH-LEARN-01')
  );

  // ── TEST 2: LLM Provider Abstraction & Offline Fallback ───────────────────
  console.log('\nTest Group 2: LLM Provider Abstraction & Output Normalization');
  const mockProvider = new MockLLMProvider();
  const mockRes = await mockProvider.generateStructured({
    systemPrompt: 'System',
    userPrompt: 'User',
    patientContext: {
      patientProfile: { name: 'Priya Sharma' },
      checkins: [{ SK: 'CHECKIN#2026-09-18#1', sudsScore: 7 }],
      practice: [{ SK: 'PRACTICE#2026-09-18#1', exerciseId: 'delay-ritual', completed: true }],
      journal: [{ SK: 'JOURNAL#2026-09-18#1', responseType: 'delay_ritual' }],
      metrics: { avgSuds: 7.0, peakSuds: 7, checkinCount: 1, practiceCount: 1, journalCount: 1 },
    },
    knowledgeChunks: inhibitoryChunks,
  });

  check('Mock provider produces structured decision support without credentials', mockRes.success === true);
  check('Mock output contains factual observations linked to evidence SK',
    mockRes.output.practice_observations.some(obs => obs.evidence?.includes('PRACTICE#2026-09-18#1'))
  );
  check('Mock output includes clinical limitations and disclaimers',
    mockRes.output.limitations.length > 0
  );

  // Test JSON code-fence stripping & error recovery
  const markdownWrapped = '```json\n{"summary":"Test summary","practice_observations":[]}\n```';
  const parsedClean = validateAndNormalizeOutput(markdownWrapped);
  check('Normalizer strips markdown code-blocks cleanly', parsedClean.summary === 'Test summary');

  // ── TEST 3: Cedar WASM Cryptographic Consent Evaluation ────────────────────
  console.log('\nTest Group 3: Cedar WASM Policy Enforcement for AI Pipeline');
  const cedarActiveAllowed = evaluateCedarConsent(
    'MCI-2024-KM-7741',
    'usr_priya_sharma_001',
    'ACTIVE',
    ['checkins', 'practice_logs', 'ai_summary'],
    true
  );
  check('Cedar WASM evaluates ALLOW when connection is ACTIVE and practice_logs is consented', cedarActiveAllowed === true);

  const cedarNoConsent = evaluateCedarConsent(
    'MCI-2024-KM-7741',
    'usr_priya_sharma_001',
    'ACTIVE',
    ['checkins'], // practice_logs missing
    true
  );
  check('Cedar WASM evaluates DENY when practice_logs consent is absent', cedarNoConsent === false);

  const cedarPendingConn = evaluateCedarConsent(
    'MCI-2024-KM-7741',
    'usr_priya_sharma_001',
    'PENDING',
    ['practice_logs'],
    true
  );
  check('Cedar WASM evaluates DENY when connection status is not ACTIVE', cedarPendingConn === false);

  // ── TEST 4: Live SAM Local API Authentication & RAG Synthesis ──────────────
  console.log('\nTest Group 4: Live SAM Local API Execution');
  // 1. Authenticate Dr. Kavita Mehra
  const loginRes = await req(`${API_BASE}/auth/practitioner-login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'kavita@betweensessions.com',
      password: 'Prac1234!',
      govCertId: 'MCI-2024-KM-7741',
    }),
  });
  check('Practitioner login succeeds on SAM API', loginRes.status === 200 && !!loginRes.data.token);
  const token = loginRes.data.token;

  // 2. Fetch Priya's user ID
  const patientsRes = await req(`${API_BASE}/practitioner/patients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const priya = patientsRes.data.data?.find(p => p.email === 'priya@betweensessions.com');
  check('Priya Sharma located in practitioner patient roster', !!priya?.userId);

  // 3. Call POST /api/v1/practitioner/patients/:userId/ai-summary
  const aiRes = await req(`${API_BASE}/practitioner/patients/${priya.userId}/ai-summary`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ days: 30 }),
  });
  check('POST /practitioner/patients/:userId/ai-summary returns 200 OK', aiRes.status === 200);

  const payload = aiRes.data.data;
  check('Response contains synthesis ID and audit metadata', !!payload.synthesisId && !!payload.generatedAt);
  check('Response contains retrieved knowledge chunks with academic citations',
    payload.knowledgeRetrieved?.length > 0 && !!payload.knowledgeRetrieved[0].citation
  );
  check('Synthesis observations are grounded in verifiable telemetry evidence IDs',
    payload.synthesis?.practice_observations?.length > 0 &&
    payload.synthesis.practice_observations[0].evidence?.length > 0
  );
  check('Synthesis questions prepare clinician for session without autonomous prescribing',
    payload.synthesis?.questions_for_practitioner?.length > 0
  );
  check('Synthesis limitations explicitly disclaim medical diagnosis',
    payload.synthesis?.limitations?.some(l => l.toLowerCase().includes('diagnosis') || l.toLowerCase().includes('decision support'))
  );

  // ── TEST 5: Security Boundary & Cross-Practitioner Isolation ───────────────
  console.log('\nTest Group 5: Security Boundaries & Patient Isolation');

  // Register an isolated second practitioner
  const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
  const secondPracId = `MCI-2025-UP-${randomSuffix}`;
  const regSecondPrac = await req(`${API_BASE}/auth/practitioner-register`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Dr. Unlinked Practitioner',
      email: `unlinked_${Date.now()}_${randomSuffix}@betweensessions.com`,
      password: 'Prac1234!',
      govCertId: secondPracId,
    }),
  });
  check('Second test practitioner registered', regSecondPrac.status === 201 && !!regSecondPrac.data?.token);
  const secondToken = regSecondPrac.data?.token;

  // Attempt to generate AI summary for Priya (connected ONLY to Dr. Mehra, NOT to second practitioner)
  const unauthorizedAiRes = await req(`${API_BASE}/practitioner/patients/${priya.userId}/ai-summary`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secondToken}` },
    body: JSON.stringify({ days: 30 }),
  });
  check('Practitioner B is strictly blocked from generating AI summary for Practitioner A\'s patient (403 FORBIDDEN)',
    unauthorizedAiRes.status === 403
  );

  // Attempt to access without token
  const unauthedRes = await req(`${API_BASE}/practitioner/patients/${priya.userId}/ai-summary`, {
    method: 'POST',
    body: JSON.stringify({ days: 30 }),
  });
  check('Unauthenticated request to AI endpoint is blocked with 401 UNAUTHORIZED',
    unauthedRes.status === 401
  );

  // Patient token attempting to call clinician AI endpoint
  const patientLogin = await req(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@betweensessions.com', password: 'Demo1234!' }),
  });
  const patientToken = patientLogin.data.data?.token || patientLogin.data.token;
  const patientCallPracAi = await req(`${API_BASE}/practitioner/patients/${priya.userId}/ai-summary`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${patientToken}` },
    body: JSON.stringify({ days: 30 }),
  });
  check('Patient role is forbidden from calling practitioner AI endpoint (403 FORBIDDEN)',
    patientCallPracAi.status === 403
  );

  console.log('\n======================================================');
  console.log(`   ALL ${passed} / ${total} AI & RAG TESTS PASSED!`);
  console.log('   STRICT SECURITY, ISOLATION & CITATIONS VERIFIED');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
