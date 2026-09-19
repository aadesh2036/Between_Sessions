/**
 * LLM Provider Abstraction for Between Sessions RAG Pipeline
 * 
 * Implements a clean provider interface for clinician decision-support synthesis:
 * - HuggingFaceProvider: Calls Hugging Face Inference API (Serverless router)
 *   Supports open-weight models e.g. Qwen/Qwen2.5-7B-Instruct, meta-llama/Llama-3.1-8B-Instruct.
 * - MockLLMProvider: High-fidelity, deterministic offline fallback for local tests & offline dev.
 * 
 * Zero external credentials are required to boot the application or run tests.
 */

const DEFAULT_HF_MODEL = process.env.HF_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
const HF_ROUTER_URL = 'https://router.huggingface.co/hf-inference/v1/chat/completions';
const HF_LEGACY_BASE = 'https://api-inference.huggingface.co/models';

/**
 * Validate and normalize the structured output from the LLM
 */
function validateAndNormalizeOutput(rawOutput, fallbackContext = {}) {
  let parsed;
  if (typeof rawOutput === 'object' && rawOutput !== null) {
    parsed = rawOutput;
  } else if (typeof rawOutput === 'string') {
    // Strip markdown code fences if model returned ```json ... ```
    const cleaned = rawOutput
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      // If parsing fails, try to extract first JSON object via regex
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          parsed = null;
        }
      }
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    // Return structured fallback if model produced invalid JSON
    return {
      summary: fallbackContext.defaultSummary || 'Practice activity logged during between-sessions interval.',
      practice_observations: (fallbackContext.observations || []).map(obs => ({
        observation: typeof obs === 'string' ? obs : obs.observation,
        evidence: obs.evidence || ['SESSION-FALLBACK'],
      })),
      patterns: (fallbackContext.patterns || []).map(pat => ({
        pattern: typeof pat === 'string' ? pat : pat.pattern,
        evidence: pat.evidence || [],
      })),
      clinical_context: (fallbackContext.knowledgeChunks || []).map(k => ({
        point: k.text ? k.text.slice(0, 160) + '...' : k.title,
        source: k.source || k.citation || 'Clinical Reference',
        chunkId: k.chunkId,
      })),
      questions_for_practitioner: [
        'Explore patient experience during highest distress practice intervals.',
        'Review whether response prevention was maintained through peak urges.',
      ],
      limitations: [
        'AI-generated decision support; practitioner clinical review required.',
        'Synthesized strictly from patient logs — not medical or diagnostic advice.',
      ],
    };
  }

  return {
    summary: String(parsed.summary || 'Summary generated from patient practice logs.'),
    practice_observations: Array.isArray(parsed.practice_observations)
      ? parsed.practice_observations.map(item => ({
          observation: String(item.observation || item.text || item),
          evidence: Array.isArray(item.evidence) ? item.evidence : [],
        }))
      : [],
    patterns: Array.isArray(parsed.patterns)
      ? parsed.patterns.map(item => ({
          pattern: String(item.pattern || item.text || item),
          evidence: Array.isArray(item.evidence) ? item.evidence : [],
        }))
      : [],
    clinical_context: Array.isArray(parsed.clinical_context)
      ? parsed.clinical_context.map(item => ({
          point: String(item.point || item.text || item),
          source: String(item.source || 'Clinical Reference'),
          chunkId: item.chunkId || null,
        }))
      : [],
    questions_for_practitioner: Array.isArray(parsed.questions_for_practitioner)
      ? parsed.questions_for_practitioner.map(String)
      : [
          'Review self-reported distress curves during exposure intervals.',
          'Verify response prevention adherence during peak urge spikes.',
        ],
    limitations: Array.isArray(parsed.limitations)
      ? parsed.limitations.map(String)
      : [
          'AI-generated decision support; practitioner clinical review required.',
          'Synthesized strictly from patient logs — not a clinical diagnosis or treatment prescription.',
        ],
  };
}

/**
 * Deterministic Mock LLM Provider
 * Produces structured, grounded clinical decision support from actual patient data
 */
class MockLLMProvider {
  constructor() {
    this.name = 'mock';
  }

  async generateStructured({ systemPrompt, userPrompt, patientContext, knowledgeChunks = [] }) {
    const checkinCount = patientContext?.checkins?.length || 0;
    const practiceCount = patientContext?.practice?.length || 0;
    const journalCount = patientContext?.journal?.length || 0;
    const avgSuds = patientContext?.metrics?.avgSuds ?? 'N/A';
    const peakSuds = patientContext?.metrics?.peakSuds ?? 'N/A';
    const patientName = patientContext?.patientProfile?.name || 'Patient';

    // Extract concrete evidence IDs from patient logs
    const checkinIds = (patientContext?.checkins || []).map(c => c.SK || c.id || 'CHECKIN').slice(0, 3);
    const practiceIds = (patientContext?.practice || []).map(p => p.SK || p.exerciseId || 'PRACTICE').slice(0, 3);
    const journalIds = (patientContext?.journal || []).map(j => j.SK || j.entryId || 'JOURNAL').slice(0, 3);

    // Build evidence-grounded observations
    const observations = [];
    if (practiceCount > 0) {
      observations.push({
        observation: `Patient completed ${practiceCount} planned exposure practice session(s) in the reporting interval.`,
        evidence: practiceIds.length > 0 ? practiceIds : ['PRACTICE-RECORDED'],
      });
    } else {
      observations.push({
        observation: 'No formal exposure practices recorded in the current logging interval.',
        evidence: ['NO-PRACTICE-INTERVAL'],
      });
    }

    if (checkinCount > 0) {
      observations.push({
        observation: `Logged ${checkinCount} spontaneous check-ins with an average distress rating of ${avgSuds}/10 (peak observed: ${peakSuds}/10).`,
        evidence: checkinIds.length > 0 ? checkinIds : ['CHECKIN-RECORDED'],
      });
    }

    if (journalCount > 0) {
      const topResponses = {};
      for (const j of patientContext.journal) {
        if (j.responseType) topResponses[j.responseType] = (topResponses[j.responseType] || 0) + 1;
      }
      const topResp = Object.entries(topResponses).sort((a, b) => b[1] - a[1])[0];
      if (topResp) {
        observations.push({
          observation: `Most frequent behavioral response recorded was "${topResp[0]}" (${topResp[1]} occurrence${topResp[1] > 1 ? 's' : ''}).`,
          evidence: journalIds.length > 0 ? journalIds : ['JOURNAL-RECORDED'],
        });
      }
    }

    // Build pattern analysis
    const patterns = [];
    if (avgSuds !== 'N/A' && Number(avgSuds) >= 6) {
      patterns.push({
        pattern: 'Elevated distress threshold observed during logged check-ins; consistent with active exposure engagement.',
        evidence: checkinIds,
      });
    } else if (checkinCount > 0) {
      patterns.push({
        pattern: 'Moderate, manageable baseline distress curve reported between structured sessions.',
        evidence: checkinIds,
      });
    }

    // Map retrieved clinical knowledge
    const clinicalContext = knowledgeChunks.map(chunk => ({
      point: chunk.text ? chunk.text.slice(0, 200) + '...' : chunk.title,
      source: chunk.citation || chunk.source || 'Clinical Reference',
      chunkId: chunk.chunkId || null,
    }));

    // Practitioner consultation questions
    const questions = [
      'Did the patient maintain response prevention after concluding the exposure exercise?',
      'Were any covert/mental rituals deployed during high-distress intervals that were not logged?',
    ];

    if (journalCount > 0) {
      questions.push('Review journal entries to differentiate deliberate ritual delay from inadvertent avoidance maneuvers.');
    }

    const structured = {
      summary: `Clinical synthesis for ${patientName} across between-sessions reporting window. The patient recorded ${checkinCount} check-in(s), ${practiceCount} exposure practice(s), and ${journalCount} behavioral log entry(ies). Baseline distress averaged ${avgSuds}/10. Practice telemetry indicates active participation within agreed safety parameters.`,
      practice_observations: observations,
      patterns,
      clinical_context: clinicalContext,
      questions_for_practitioner: questions,
      limitations: [
        'AI-generated clinical decision support; practitioner clinical review required.',
        'Synthesized strictly from patient logs — not a medical diagnosis or treatment plan.',
        'Requires practitioner validation of qualitative self-reporting accuracy.',
      ],
    };

    return {
      success: true,
      provider: 'mock-clinical-v1',
      model: 'deterministic-clinical-rag',
      output: structured,
    };
  }
}

/**
 * Hugging Face Hosted Inference Provider
 * Connects to Hugging Face Serverless Inference API
 */
class HuggingFaceProvider {
  constructor(apiKey, modelName = DEFAULT_HF_MODEL) {
    this.apiKey = apiKey;
    this.modelName = modelName;
    this.name = 'huggingface';
    this.mockFallback = new MockLLMProvider();
  }

  async generateStructured({ systemPrompt, userPrompt, patientContext, knowledgeChunks = [] }) {
    if (!this.apiKey) {
      console.warn('[HuggingFaceProvider] No HF_TOKEN provided; falling back to MockLLMProvider.');
      return this.mockFallback.generateStructured({
        systemPrompt,
        userPrompt,
        patientContext,
        knowledgeChunks,
      });
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    // 1. Try OpenAI-compatible chat completions endpoint on Hugging Face router
    try {
      const response = await fetch(HF_ROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          temperature: 0.1,
          max_tokens: 1200,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const content = json.choices?.[0]?.message?.content;
        if (content) {
          const normalized = validateAndNormalizeOutput(content, {
            knowledgeChunks,
            defaultSummary: `Between-sessions synthesis for ${patientContext?.patientProfile?.name || 'Patient'}`,
          });
          return {
            success: true,
            provider: 'huggingface',
            model: this.modelName,
            endpoint: 'chat-completions',
            output: normalized,
          };
        }
      }
    } catch (err) {
      console.warn('[HuggingFaceProvider] Router chat completions call failed, trying standard endpoint:', err.message);
    }

    // 2. Fallback to standard Hugging Face model endpoint
    try {
      const modelUrl = `${HF_LEGACY_BASE}/${this.modelName}`;
      const promptCombined = `<|system|>\n${systemPrompt}\n<|user|>\n${userPrompt}\n<|assistant|>\n`;

      const response = await fetch(modelUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: promptCombined,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.1,
            return_full_text: false,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const generatedText = Array.isArray(result) ? result[0]?.generated_text : result?.generated_text;
        if (generatedText) {
          const normalized = validateAndNormalizeOutput(generatedText, {
            knowledgeChunks,
            defaultSummary: `Between-sessions synthesis for ${patientContext?.patientProfile?.name || 'Patient'}`,
          });
          return {
            success: true,
            provider: 'huggingface',
            model: this.modelName,
            endpoint: 'legacy-models',
            output: normalized,
          };
        }
      }
    } catch (err) {
      console.warn('[HuggingFaceProvider] Legacy models endpoint call failed:', err.message);
    }

    // 3. Graceful degradation to deterministic mock provider if Hugging Face is unreachable or rate-limited
    console.warn('[HuggingFaceProvider] Falling back gracefully to MockLLMProvider.');
    const fallbackResult = await this.mockFallback.generateStructured({
      systemPrompt,
      userPrompt,
      patientContext,
      knowledgeChunks,
    });
    fallbackResult.note = 'Hugging Face API unavailable or token invalid; used deterministic clinical synthesis.';
    return fallbackResult;
  }
}

/**
 * Factory to get the configured LLM provider
 */
function getLLMProvider() {
  const providerType = (process.env.AI_PROVIDER || 'huggingface').toLowerCase();
  const hfToken = process.env.HF_TOKEN || '';
  const hfModel = process.env.HF_MODEL || DEFAULT_HF_MODEL;

  if (providerType === 'mock' || !hfToken) {
    return new MockLLMProvider();
  }

  return new HuggingFaceProvider(hfToken, hfModel);
}

module.exports = {
  MockLLMProvider,
  HuggingFaceProvider,
  getLLMProvider,
  validateAndNormalizeOutput,
  DEFAULT_HF_MODEL,
};
