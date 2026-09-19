# Between Sessions — Serverless Backend Engine

The backend for **Between Sessions** is an AWS-native, HIPAA-informed serverless architecture deployed via the **AWS Serverless Application Model (SAM)**, with dual-runner support for rapid local Express development.

It enforces **Cedar WASM cryptographic access control**, manages **DynamoDB single-table persistence**, and exposes an **evidence-grounded AI/RAG clinical synthesis pipeline** for verified healthcare practitioners.

---

## Architecture Overview

```
                          ┌───────────────────────────┐
                          │   Amazon API Gateway v1   │
                          │        (/api/v1/*)        │
                          └─────────────┬─────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             │ (13 Packaged Serverless AWS Lambda Functions)       │
             ▼                          ▼                          ▼
     ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
     │ AuthFunction  │          │ CheckinsFunc  │          │ AiSummaryFunc │
     │  (JWT+bcrypt) │          │  (0-10 SUDS)  │          │ (Qwen 2.5 7B) │
     └───────┬───────┘          └───────┬───────┘          └───────┬───────┘
             │                          │                          │
             │                          ▼                          │
             │                 ┌─────────────────┐                 │
             │                 │   Cedar WASM    │◄────────────────┘
             │                 │ Access Gate     │  Cryptographic Consent
             │                 └────────┬────────┘  (DENY / 403 fallback)
             │                          │
             ▼                          ▼
   ┌───────────────────────────────────────────────────────────────┐
   │             Amazon DynamoDB Single Table Store                │
   │               (PartitionKey `PK`, SortKey `SK`)               │
   │              GSI1 (Reverse Lookup) & GSI2 (Timeline)          │
   └───────────────────────────────────────────────────────────────┘
```

---

## Packaged Lambda Functions (13 Total)

| Lambda Function | Route Handler | Responsibility |
|---|---|---|
| `AuthFunction` | `/api/v1/auth/*` | Registration, credential login, JWT token issuance, profile retrieval |
| `CheckinsFunction` | `/api/v1/checkins/*` | 0–10 calibrated SUDS check-in logging and longitudinal history |
| `JournalFunction` | `/api/v1/journal/*` | Qualitative reflection logging and thought record retrieval |
| `PracticeFunction` | `/api/v1/practice/*` | Exposure and Response Prevention (ERP) trial tracking and Habit Delay logs |
| `DashboardFunction` | `/api/v1/dashboard/*` | Aggregated patient orientation summary and recent telemetry |
| `ProgressFunction` | `/api/v1/progress/*` | Diurnal distress splines, weekly averages, and longitudinal analytics |
| `AiSummaryFunction` | `/api/v1/ai/summary/*` | Clinician-facing RAG synthesis (FACT, INFERENCE, KNOWLEDGE, PROBE) |
| `ConsentsFunction` | `/api/v1/consents/*` | Cedar WASM consent policies and instant granular revocation |
| `ConnectionsFunction` | `/api/v1/connections/*` | Inbound/outbound patient-practitioner relationship pairing |
| `PractitionerFunction` | `/api/v1/practitioner/*` | Verified clinician directory, caseload roster, and recommendations |
| `ToolkitFunction` | `/api/v1/toolkit/*` | Somatic biofeedback exercise logging (Urge Surf, Vagus Sigh, Box) |
| `ValuesFunction` | `/api/v1/values/*` | Acceptance & Commitment (ACT) value definitions and action logs |
| `LearningFunction` | `/api/v1/learn/*` | Psychoeducational reading progress tracking |

---

## Core Security & Policy Enforcement

### 1. Cryptographic Cedar Policy Engine (`@cedar-policy/cedar-wasm`)
- Evaluates consent authorization at the database layer before unencrypting or transmitting any patient data to practitioners.
- Supports instant category revocation (`checkins`, `practice`, `journal`, `analytics`).
- Returns HTTP `403 CONSENT_REQUIRED` if a requested category is unshared.

### 2. JWT Authentication & HttpOnly Cookie Guard
- Encrypted HMAC-SHA256 JWT tokens with 7-day expiration.
- Password hashing using `bcryptjs` with salt work factor 10.
- SameSite lax cookie attributes and Bearer header token support.

---

## AI / RAG Clinical Synthesis Pipeline

Located in `src/services/aiSummaryService.js`:
1. **Context Retrieval**: Asynchronously fetches consented patient check-ins, ERP trials, and journal entries.
2. **Clinical Knowledge Grounding**: Retrieves evidence chunks from peer-reviewed OCD/ERP frameworks (`knowledge_chunks.json`).
3. **Structured Inference**: Queries HuggingFace Serverless Inference API (`Qwen/Qwen2.5-7B-Instruct`).
4. **Deterministic MockLLM Fallback**: If offline or unconfigured, falls back to a deterministic, clinically calibrated generator to ensure 100% test and demo reliability.
5. **Secondary AI Posture**: Always includes mandatory non-diagnostic disclaimer:
   > *"Synthesized from patient logs — not medical advice. Intended exclusively for licensed clinical review."*

---

## Local Development & Testing

### Prerequisites
- Node.js 18+ or 20+
- Java 11+ (for DynamoDB Local)
- AWS SAM CLI (for serverless emulation)

### Fast Express Dev Runner
```bash
./start_express.sh
```

### Serverless SAM Runner
```bash
./start_sam.sh
```

### Seeding DynamoDB
```bash
cd src && node seed.js
```

### Automated Verification Test Suites
```bash
# Test 1: AI / RAG pipeline (24 checks)
node backend/test_ai_rag.js

# Test 2: Backend REST endpoints (28 checks)
node backend/test_backend_e2e.js

# Test 3: End-to-end user & practitioner journey (31 checks)
node backend/test_e2e_journey.js
```
*(All 83 checks pass deterministically out of the box).*
