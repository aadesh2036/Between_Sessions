# Between Sessions — AI & Clinician Decision Support Architecture

> **Audience:** System Architects, Clinical Advisors, and Security Engineers  
> **Last Synchronized:** 2026-09-19  
> **Core Principle:** Clinician Decision-Support Only — Zero Patient Chatbot / Zero Autonomous Therapy

---

## 1. Architectural Overview

```
                      ┌─────────────────────────────────┐
                      │    Practitioner Dashboard UI    │
                      │ (AI Practice Overview Component)│
                      └────────────────┬────────────────┘
                                       │ POST /api/v1/practitioner/patients/:userId/ai-summary
                                       ▼
                      ┌─────────────────────────────────┐
                      │     AWS SAM API Gateway         │
                      │  (Bearer JWT Verification)      │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │   Practitioner Lambda Handler   │
                      │      (practitioner.js)          │
                      └────────────────┬────────────────┘
                                       │
                         1. Cryptographic Authorization
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │    AWS Cedar WASM Engine        │
                      │  Action: "ReadPatientSummary"   │
                      │  Checks: ACTIVE & practice_logs │
                      └────────┬───────────────┬────────┘
                    ALLOW      │               │ DENY
            ┌──────────────────┘               └──────────────────┐
            ▼                                                     ▼
┌─────────────────────────────────┐                     ┌───────────────────┐
│     DynamoDB Single Table       │                     │ 403 Forbidden     │
│   (Patient Telemetry Query)     │                     │ CONSENT_REQUIRED  │
│  - CHECKIN (SUDS, Urge)         │                     └───────────────────┘
│  - PRACTICE (Pre/Post Distress) │
│  - JOURNAL (Response Type)      │
└───────────────┬─────────────────┘
                │
                │ 2. Quantitative Telemetry Aggregation
                ▼
┌─────────────────────────────────┐
│   Structured Telemetry Builder  │
│ - Check-in count & Avg SUDS     │
│ - Peak distress & delta curves  │
│ - Concrete Evidence SK mapping  │
└───────────────┬─────────────────┘
                │
                │ 3. Pattern-Triggered Semantic Query
                ▼
┌─────────────────────────────────┐
│  Curated Clinical Knowledge     │
│  Base & Retrieval (RAG Engine)  │
│ - Inhibitory Learning (Craske)  │
│ - Response Prevention (Abramowitz)
│ - Reassurance Cycles (Salkovskis)│
│ - Distress Tracking (Wolpe)     │
└───────────────┬─────────────────┘
                │
                │ 4. Constrained Clinical Context
                ▼
┌─────────────────────────────────┐
│     Prompt Assembly Engine      │
│ - Strict FACT vs INFERENCE      │
│ - Evidence ID requirements      │
│ - Anti-diagnosis constraints    │
└───────────────┬─────────────────┘
                │
                │ 5. Structured JSON Inference
                ▼
┌─────────────────────────────────┐
│     LLM Provider Abstraction    │
│ ┌─────────────────────────────┐ │
│ │ HuggingFaceProvider         │ │
│ │ (Qwen2.5-7B / Llama-3.1-8B) │ │
│ └──────────────┬──────────────┘ │
│                │ (Offline fallback)
│ ┌──────────────▼──────────────┐ │
│ │ MockLLMProvider             │ │
│ └─────────────────────────────┘ │
└───────────────┬─────────────────┘
                │
                │ 6. Audit Trail Storage
                ▼
┌─────────────────────────────────┐
│     DynamoDB Single Table       │
│  Item: AI#SYNTHESIS#<Prac>#<TS> │
│  Stores: model, citations, IDs  │
└───────────────┬─────────────────┘
                │
                │ 7. Validated Structured JSON
                ▼
┌─────────────────────────────────┐
│    Practitioner Dashboard UI    │
│  - Longitudinal Synthesis       │
│  - Factual Observations [FACT]  │
│  - Behavioral Patterns [INFER]  │
│  - Literature Grounding [KNOW]  │
│  - Session Prep Considerations  │
└─────────────────────────────────┘
```

---

## 2. Core Clinical Boundaries & Anti-Patterns

Between Sessions operates under non-negotiable behavioral health boundaries:

| Boundary | Architectural Enforcement |
|---|---|
| **Clinician-Facing Only** | The AI pipeline is mounted exclusively under `/api/v1/practitioner/...`. Individual user portals have no conversational AI endpoints and no generative text interfaces. |
| **No Diagnostic Claims** | Prompt directives and validation schemas strictly forbid generating clinical diagnoses, ICD/DSM codes, or prognostic certainty. |
| **No Reassurance Loops** | Reassurance-seeking is clinically recognized as an OCD safety maneuver that escalates anxiety long-term. The AI never provides reassuring statements about intrusive thoughts. |
| **No Autonomous Exposure Prescriptions** | The AI never prescribes an exposure exercise to a patient. Treatment steps remain 100% human-authored by licensed clinicians. |
| **No Gamification / Streaks** | No "ritual-free streaks", points, celebratory confetti, or "OCD-free percentages". Progress is measured objectively through voluntary engagement and distress tolerance. |

---

## 3. Strict Epistemological Separation: FACT vs. INFERENCE vs. KNOWLEDGE

The synthesis separates its findings into three distinct semantic tiers:

### 1. FACT (Patient Telemetry)
- Statements derived directly from recorded DynamoDB logs.
- Every observation **must cite verifiable DynamoDB sort keys** (`evidence: ["PRACTICE#2026-09-18T20:00:00.000Z#PR_PRIYA_6"]`).
- Example: *"Patient completed 6 planned exposure practices; baseline distress averaged 5.9/10."*

### 2. INFERENCE (Model Pattern Recognition)
- Tentative observations surfaced for the practitioner's evaluation.
- Never framed as definitive medical conclusions.
- Example: *"Observed distress peaks correlate with transition intervals; worth exploring whether ritual delay was maintained."*

### 3. KNOWLEDGE (Peer-Reviewed Literature)
- Principles retrieved from the curated clinical knowledge base.
- Includes formal academic citations (e.g. *Craske et al., 2014, Behaviour Research and Therapy*).
- Example: *"Expectancy violation theory emphasizes that non-zero post-exposure distress does not signify exposure failure if response prevention was sustained."*

---

## 4. Cryptographic Cedar Policy Enforcement

The AI endpoint does **not** bypass security because it is an "AI service". It evaluates the exact same Cedar WASM policy governing human clinical access:

```cedar
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
```

### Security Verifications
1. **Practitioner A vs. Practitioner B Isolation:** Practitioner B cannot generate or read an AI synthesis for Practitioner A's patient (returns `403 FORBIDDEN`).
2. **Patient Consent Revocation:** If a patient unchecks `practice_logs` in their privacy settings, the AI endpoint immediately rejects requests with `403 CONSENT_REQUIRED`.
3. **Audit Trail Persistence:** Every generated synthesis is persisted in DynamoDB under `PK: USER#<patientId>`, `SK: AI#SYNTHESIS#<practitionerId>#<ISO_TIMESTAMP>` documenting the model used, prompt version, retrieved citations, and exact source metric IDs.

---

## 5. Output JSON Contract

```json
{
  "synthesisId": "SYNTH_1789795800_a1b2c3",
  "patientId": "usr_priya_sharma_001",
  "practitionerId": "MCI-2024-KM-7741",
  "generatedAt": "2026-09-19T05:28:00.000Z",
  "provider": "huggingface",
  "model": "Qwen/Qwen2.5-7B-Instruct",
  "reportingPeriod": { "from": "2026-08-20T...", "to": "2026-09-19T..." },
  "metrics": {
    "avgSuds": 5.9,
    "peakSuds": 9,
    "checkinCount": 20,
    "practiceCount": 6,
    "journalCount": 0
  },
  "knowledgeRetrieved": [
    {
      "chunkId": "ERP-INH-LEARN-01",
      "title": "Inhibitory Learning Approach to Exposure and Response Prevention",
      "citation": "Craske, M. G., et al. (2014). Behaviour Research and Therapy, 58, 10-23."
    }
  ],
  "synthesis": {
    "summary": "Longitudinal telemetry synthesis for Priya Sharma across the 30-day reporting window...",
    "practice_observations": [
      {
        "observation": "Patient completed 6 planned exposure practice sessions in the reporting interval.",
        "evidence": ["PRACTICE#2026-09-18T20:00:00.000Z#PR_PRIYA_6"]
      }
    ],
    "patterns": [
      {
        "pattern": "Elevated distress threshold observed during logged check-ins; consistent with active exposure engagement.",
        "evidence": ["CHECKIN#2026-09-18T08:30:00.000Z#CI_PRIYA_20"]
      }
    ],
    "clinical_context": [
      {
        "point": "Expectancy violation emphasizes tolerating distress without engaging in compulsive safety behaviors.",
        "source": "Craske et al. (2014)"
      }
    ],
    "questions_for_practitioner": [
      "Did the patient maintain response prevention after concluding the exposure exercise?"
    ],
    "limitations": [
      "AI-generated clinical decision support for licensed practitioners — not a diagnosis or clinical directive."
    ]
  }
}
```
