# Between Sessions — System Architecture & RAG Specification

> **Technical Master Document:** Full System Architecture, Data Flow, and Design Systems  
> **Last Synchronized:** 2026-09-19

---

## 1. System Topology

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT PORTALS                                │
│                                                                         │
│  React 19 + Vite + Tailwind CSS v4 (@theme tokens)                      │
│  - Individual Portal (/dashboard, /practice, /toolkit, /values, /learn) │
│  - Practitioner Dashboard (/practitioner)                               │
│  - Signature BetweenLoading animations & Pip mascot state machines      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS / REST (JWT Bearer)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      AMAZON API GATEWAY (REST API)                      │
│                                                                         │
│  CORS-enabled, Regional Endpoint, Strict Route Mapping                  │
│  - /api/v1/auth/* (Registration, Login, Password Reset, Verification)   │
│  - /api/v1/checkins, /practice, /toolkit, /values, /learn               │
│  - /api/v1/consents, /connections                                       │
│  - /api/v1/practitioner/* (Roster, Summary, Recommendations, AI-Summary)│
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    AWS SERVERLESS COMPUTE (LAMBDA)                      │
│                                                                         │
│  Node.js 22.x Microservices with warm container reuse:                  │
│  - AuthFunction, PractitionerFunction, ConnectionsFunction              │
│  - CheckinsFunction, PracticeFunction, JournalFunction                  │
│  - DashboardFunction, ProgressFunction, AiSummaryFunction               │
│  - ConsentsFunction, ToolkitFunction, ValuesFunction, LearningFunction  │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
                    ▼                                 ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────┐
│       AMAZON DYNAMODB (NO-SQL)       │  │    AWS CEDAR WASM ENGINE      │
│                                      │  │                               │
│  Single-Table Design:                │  │  Cryptographic authorization  │
│  TableName: "BetweenSessionsTable"   │  │  evaluating patient-granted   │
│  Partition Key: PK (String)          │  │  consents before querying or  │
│  Sort Key:      SK (String)          │  │  synthesizing telemetry.      │
│  Point-In-Time SSE Enabled           │  └───────────────────────────────┘
└───────────────────┬──────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     CLINICIAN AI & RAG SUBSYSTEM                        │
│                                                                         │
│  - Curated OCD/ERP Knowledge Base (Inhibitory Learning, Response Prev)  │
│  - Deterministic Aggregation Engine (SUDS deltas, Practice frequency)   │
│  - Multi-Provider LLM Abstraction (Hugging Face / Open-Weight / Mock)  │
│  - Traceable Audit Records (AI#SYNTHESIS#<practitionerId>#<timestamp>)  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Amazon DynamoDB Single-Table Schema

All domain entities reside in a single table (`BetweenSessionsTable`) with compound keys:

| Entity | PK | SK | Key Attributes |
|---|---|---|---|
| **User Profile** | `USER#<userId>` | `PROFILE` | `email`, `name`, `passwordHash`, `values`, `ageBand` |
| **Practitioner Profile** | `PRACTITIONER#<practitionerId>` | `PROFILE` | `name`, `email`, `govCertId`, `specialisation`, `isVerified` |
| **Practitioner Lookup** | `PRACTITIONER#<email>` | `PROFILE` | Secondary lookup for email-based login |
| **Public Directory Index**| `LISTING#PRACTITIONERS` | `INDEX` | Array of verified practitioner cards |
| **Check-in** | `USER#<userId>` | `CHECKIN#<ISO_TIMESTAMP>#<id>` | `sudsScore` (0-10), `urgeScore` (0-10), `category` |
| **ERP Practice Log** | `USER#<userId>` | `PRACTICE#<ISO_TIMESTAMP>#<id>` | `exerciseId`, `preDistress`, `postDistress`, `completed` |
| **Behavioral Journal** | `USER#<userId>` | `JOURNAL#<ISO_TIMESTAMP>#<id>` | `responseType`, `trigger`, `tags` |
| **Somatic Toolkit Log** | `USER#<userId>` | `TOOLKIT#<ISO_TIMESTAMP>#<id>` | `toolType` (grounding, breathing, urge_surf) |
| **Values Commitment** | `USER#<userId>` | `VALUE_ACTION#<ISO_TIMESTAMP>#<id>`| `valueDomain`, `actionTitle`, `completed` |
| **Educational Progress**| `USER#<userId>` | `LEARN_PROGRESS#<bookId>#<chapterId>`| `completed`, `completedAt` |
| **Practitioner Connection**| `USER#<userId>` | `CONNECTION#<practitionerId>` | `status` (`ACTIVE`/`PENDING`), `consentedCategories` |
| **Connection Request** | `PRACTITIONER#<pracId>` | `REQUEST#<userId>` | Incoming patient link requests |
| **Clinical Consent** | `USER#<userId>` | `CONSENT#professional_review#<pracId>` | Scope of authorized categories |
| **Clinical Recommendation**| `USER#<userId>` | `RECOMMENDATION#<ISO_TIMESTAMP>#<id>` | `practitionerId`, `observation`, `nextStep` |
| **AI Decision Synthesis**| `USER#<userId>` | `AI#SYNTHESIS#<pracId>#<ISO_TIMESTAMP>` | `provider`, `model`, `synthesis`, `citations`, `evidence` |

---

## 3. Cryptographic Cedar Policy

Access to patient records is governed by Cedar:
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

When evaluated in Node.js via `@cedar-policy/cedar-wasm/nodejs`, Cedar verifies that:
1. The practitioner holds verified status.
2. An active mutual connection exists in DynamoDB.
3. The patient's consent record explicitly contains `practice_logs`.

---

## 4. Design System Tokens (Organic Strategic Editorial)

* **Tailwind CSS v4 Configuration:** Authored in `frontend/src/index.css` via `@theme`.
* **Editorial Headlines:** `Newsreader` (`font-editorial`, `font-serif`).
* **UI Controls & Body:** `Plus Jakarta Sans` (`font-sans`).
* **Telemetry Data:** `JetBrains Mono` (`font-mono` — numbers and timestamps only).
* **Primary Teal:** `#176B67` (`brand-teal`) & `#195E5A` (`brand-tealDark`).
* **Background Canvas:** `#F7F8F7` (`brand-canvas`).
* **Elevated Surfaces:** `#FFFFFF` (`brand-paper`).
* **Distress Accents:** `#E8856C` (`brand-coral`) & `#FFF0EC` (`brand-coralSoft`).
* **Mindful Accents:** `#8B7EC8` (`brand-lavender`) & `#F0EDFB` (`brand-lavenderSoft`).
