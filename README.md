# Between Sessions

> **Bridging the Clinical Gap in OCD Exposure & Response Prevention (ERP)**  
> An ethical, clinician-aligned behavioral practice companion and care-continuity system.

---

## 🌟 Executive Overview

**Between Sessions** solves the critical behavioral health disconnect in Obsessive-Compulsive Disorder (OCD) treatment: **95% of recovery happens between therapy sessions**, yet clinicians routinely have zero objective visibility into whether patients performed response prevention during exposure triggers, delayed urges, or succumbed to avoidance loops.

Between Sessions provides:
1. **Sanctuary for Patients:** Grounded micro-interventions (*Pause & Choose*), daily SUDS (Subjective Units of Distress Scale 0–10) logging, structured behavioral entries, and longitudinal progress tracking.
2. **Granular Privacy & Data Sovereign Consent:** Patients own 100% of their data and choose specifically which categories (`checkins`, `journal_structured`, `practice_logs`, `ai_summary`) are visible to their clinician.
3. **Care Continuity for Clinicians:** Verified practitioners review objective longitudinal logs through an **AWS Cedar WASM** policy engine and author *Curated Structured Practice* recommendations directly into the patient's portal.
4. **Clinical AI / RAG Practice Overview:** A secondary, evidence-grounded AI engine synthesizes patient logs into a 4-part clinical synthesis (`FACT`, `INFERENCE`, `KNOWLEDGE`, `CLINICAL PROBE`) grounded in peer-reviewed ERP literature.

---

## 🛡️ Clinical Boundaries & Ethical Tenets

| Directive | Architectural Implementation |
|---|---|
| **Anti-Gamification** | Strictly prohibits streaks, levels, confetti, and health scores. Progress is framed solely through objective longitudinal descriptions (e.g. *"Check-ins (7d)"*, *"Practice sessions: 6"*). |
| **Secondary AI Posture** | AI never diagnoses, prescribes, or acts as a therapist. Summaries are synthesized strictly for qualified clinicians and labeled: *"Synthesized from patient logs — not medical advice"*. |
| **Emergency Safety Net** | Persistent **Tele-MANAS** anchors (`14416` / `1800-891-4416` free, 24/7) remain permanently visible and accessible on all views and screen sizes. |
| **Cryptographic Policy Authorization** | Clinicians cannot access patient summaries without an **ACTIVE** connection and explicit **`practice_logs`** patient consent evaluated via AWS Cedar WASM. |
| **Synthetic Practitioner Validation** | Demo practitioner credentials adhere to strict synthetic formatting (`MCI-YYYY-XX-NNNN`) and are explicitly labeled *"Demo credential — not a real government ID"*. |

---

## 🧠 Clinical AI / RAG Synthesis Pipeline

Between Sessions integrates a dedicated Retrieval-Augmented Generation (RAG) pipeline designed exclusively for licensed clinicians reviewing between-session behavioral telemetry:

```
 Patient Telemetry (Consented)          Clinical Knowledge Base
 ┌───────────────────────────┐          ┌───────────────────────────┐
 │ • Check-in Logs (SUDS)    │          │ • ERP Protocol Chunks     │
 │ • ERP Practice Trials     │          │ • ACT Defusion Strategies │
 │ • Habit Delay Durations   │          │ • Peer-Reviewed Citations │
 └─────────────┬─────────────┘          └─────────────┬─────────────┘
               │                                      │
               └──────────────────┬───────────────────┘
                                  ▼
                     ┌────────────────────────┐
                     │ Context Builder & Rank │
                     └────────────┬───────────┘
                                  ▼
                     ┌────────────────────────┐
                     │ Qwen 2.5 7B Instruct   │
                     │ (Hugging Face API with │
                     │ Clinical Fallback)     │
                     └────────────┬───────────┘
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │             Structured Clinical Synthesis              │
      ├────────────────────────────────────────────────────────┤
      │ [FACT]           Observed practice data & evidence     │
      │ [INFERENCE]      Behavioral patterns & trend analysis  │
      │ [KNOWLEDGE]      Grounded literature chunk citations   │
      │ [CLINICAL PROBE] Inquiry prompts for next live session │
      └────────────────────────────────────────────────────────┘
```

- **Open-Weights AI Engine**: Powered by `Qwen/Qwen2.5-7B-Instruct` via the Hugging Face Serverless Inference API.
- **Deterministic Clinical Fallback**: In offline or zero-credential environments, automatically falls back to an internal deterministic generator, ensuring 100% demo reliability.
- **Cedar Enforcement**: If the patient revokes consent for `practice_logs`, the AI summary endpoint immediately returns `403 CONSENT_REQUIRED`.

---

## 🎨 Design System: *Organic Strategic Editorial*

Frontend development adheres strictly to the `.stitch/DESIGN.md` specification and runtime tokens in `frontend/src/index.css`:

* **Headlines & Prompts:** `Newsreader` (`font-editorial` / `font-serif`) — Warm, dignified, editorial tone.
* **Body & Navigation:** `Plus Jakarta Sans` (`font-sans`) — Crisp, clinical, accessible.
* **Telemetry & SUDS:** `JetBrains Mono` (`font-mono`) — Strictly for numeric telemetry, timestamps, and IDs.
* **Palette:**
  * `Primary`: `#176B67` (`brand-teal`)
  * `Ink`: `#17323A` (`brand-ink`)
  * `Distress / Urge`: `#E8856C` (`brand-coral`)
  * `Mindfulness / De-escalation`: `#8B7EC8` (`brand-lavender`)
  * `Observation / Pausing`: `#D4943A` (`brand-amber`)
  * `Clinical Confirmation`: `#2E7D62` (`clinical-success`)
* **Geometry:** `4px` corner radius for structured elements; pill radius reserved for status chips and actions.
* **Signature Clock Loader (`BetweenLoading.jsx`):** Embodies the core clinical thesis — the 1-hour session anchor at 12:00 vs. the 167-hour continuous sweep between sessions, rendered with an animated orbital hand and ambient radial glow.

---

## 📂 Project Architecture & Directory Structure

The repository is cleanly partitioned into deployment-oriented functional boundaries:

```
Between_Sessions/
├── frontend/                   # Client application (React 19, Vite, Tailwind CSS v4)
│   ├── src/                    # Pages, components, contexts, and api.js
│   ├── public/                 # Static assets and icons
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite build configuration
│
├── backend/                    # Serverless backend & Lambda business logic
│   ├── src/                    # 13 Lambda functions, Express dev server, Cedar WASM, seed
│   ├── .dynamodb-local/        # Local DynamoDB binaries and libraries
│   ├── package.json            # Backend Node.js dependencies
│   └── README.md               # Backend documentation
│
├── infrastructure/             # AWS Serverless Application Model (SAM) configuration
│   ├── template.yaml           # SAM template (13 Lambdas, DynamoDB Single-Table, API Gateway)
│   ├── samconfig.toml          # CloudFormation deployment settings
│   ├── local-env.json          # Container networking environment overrides
│   └── events/                 # Synthetic API Gateway invocation events
│
├── scripts/                    # Developer setup, launchers, and seeding utilities
│   ├── start_local.sh          # Master local stack launcher (SAM Local or Express)
│   ├── start_sam.sh            # Native AWS SAM Serverless CLI runner (:3000)
│   ├── start_express.sh        # Lightweight Express dev server runner (:3000)
│   ├── seed.sh                 # Database seeder utility
│   └── run_tests.sh            # Complete automated test suite runner
│
├── tests/                      # Automated end-to-end and AI test suites
│   ├── test_backend_e2e.js     # Backend logic, auth, password reset, Cedar WASM (36 tests)
│   ├── test_ai_rag.js          # Clinical RAG retrieval, LLM fallback, isolation (23 tests)
│   └── test_e2e_journey.js     # Full clinical and patient journey lifecycle (35 tests)
│
├── docs/                       # Complete project documentation hub
│   ├── architecture/           # System architecture, AWS stack, and data models
│   ├── deployment/             # AWS Cloud deployment guide (AWS_DEPLOYMENT.md)
│   ├── product/                # Features, demo credentials, practitioner IDs
│   ├── ai/                     # AI setup, RAG mechanics, and knowledge base
│   ├── prds/                   # Recreated UX & Backend requirements specifications
│   ├── reports/                # Audit, polish, and verification reports
│   └── archive/                # Reference material and design notes
│
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── AGENTS.md                   # Agent system directives & clinical boundaries
├── GEMINI.md                   # Agent rules mirror
├── package.json                # Root NPM scripts (dev, build, test, seed)
├── start.sh                    # Convenience proxy to ./scripts/start_local.sh
└── README.md                   # Master Documentation Hub (This File)
```

---

## 🚀 Quick Start & Local Execution

### Prerequisites
* **Node.js:** v20+ (tested on Node v24.18.1)
* **npm:** v10+
* **Java:** JDK 11+ (tested on OpenJDK 25) for DynamoDB Local
* **AWS SAM CLI & Container Runtime (Podman/Docker):** Required for native SAM Serverless mode (`start_sam.sh`).

---

### 1. Launch Modes

| Command | Purpose | Stack |
|---|---|---|
| **`npm run dev`** (or `./scripts/start_local.sh`) | **AWS Serverless Local (Default)** | Native AWS SAM CLI (`sam local start-api`), 13 Lambda functions, warm container caching, DynamoDB Local, Vite frontend. |
| **`npm run dev:express`** (or `./scripts/start_express.sh`) | **Fast Dev Loop** | Node Express dev server bridging Lambda handlers, in-memory DynamoDB Local, Vite frontend. |
| **`npm run build`** | **Production Build** | Builds React frontend and packages all 13 SAM Lambda functions. |
| **`npm test`** (or `./scripts/run_tests.sh`) | **Run All Tests** | Executes all 94 verification checks across 3 test suites. |
| **`npm run seed`** (or `./scripts/seed.sh`) | **Seed Demo Data** | Populates DynamoDB Local with complete deterministic clinical demo data. |

Open **`http://localhost:5173`** in your browser.

---

### 2. Run Automated Verification Suites

All three verification suites run against either SAM Local API or Express on port 3000:
* **Backend & Security E2E Suite (36 / 36 checks passed):**
  ```bash
  npm run test:backend
  # or: NODE_PATH=backend/src/node_modules node tests/test_backend_e2e.js
  ```
* **AI & Clinical RAG Integration Suite (23 / 23 checks passed):**
  ```bash
  npm run test:ai
  # or: NODE_PATH=backend/src/node_modules node tests/test_ai_rag.js
  ```
* **Full Care Journey E2E Suite (35 / 35 checks passed):**
  ```bash
  npm run test:e2e
  # or: NODE_PATH=backend/src/node_modules node tests/test_e2e_journey.js
  ```
* **Total Automated Test Verification:** **94 / 94 passing checks (100%)** with zero regressions.

---

## ⏱️ Response Prevention: Delayed Ritual Timer

In Obsessive-Compulsive Disorder (OCD) and Exposure and Response Prevention (ERP), habit extinction occurs when a person tolerates distress without performing a neutralizing ritual. 

Between Sessions features an interactive **Delayed Ritual Timer**:
* **Access Points:** Directly within the ERP practice logging modal (`/practice` → *Record Exposure* → *Delay Compulsion*) and via the *Acute Urge Delay Protocol* launcher.
* **Clinical Delay Presets:** `5m`, `10m`, `15m`, `20m`, `30m`, or custom minutes.
* **Active Controls:** Play / Pause / Reset, plus a **+1 Min** quick extension to gradually expand tolerance.
* **Web Audio Synthetic Chime:** Plays a gentle, calming harmonic bell (528 Hz / 660 Hz) upon timer completion with zero external network dependencies.
* **Post-Exposure Shift:** Prompts the patient to observe how anxiety crests and subsides before recording their post-SUDS rating.

---

## 👥 Demo Credentials & Test Personas

### 1. Veteran Patient — Priya Sharma (21 Days Longitudinal Data)
* **Email:** `priya@betweensessions.com` (or `demo@betweensessions.com`)
* **Password:** `Demo1234!`
* **State:** 21 days of SUDS reduction (9 → 3), 8 journal logs, active connection with Dr. Mehra, received clinical recommendation card.

### 2. New Patient — Alex Chen (Initial Baseline)
* **Email:** `alex@betweensessions.com`
* **Password:** `Demo1234!`
* **State:** 3 days baseline (SUDS 8 → 6), zero initial connections, sees discovery banner, can connect to Dr. Mehra from directory.

### 3. Verified Clinician — Dr. Kavita Mehra
* **Email:** `kavita@betweensessions.com` (or `practitioner@betweensessions.com`)
* **Password:** `Prac1234!`
* **Practitioner ID:** `MCI-2024-KM-7741`
* **Credentials:** MD, MCI Registered Psychiatrist · ERP Specialist
* **Portal URL:** `http://localhost:5173/practitioner/login`

### 4. Practitioner Self-Registration
Practitioners can self-register at `/practitioner/login` using any synthetic ID following the regex `^MCI-(202[4-6])-[A-Z]{2}-\d{4}$` (e.g., `MCI-2025-RP-3312`).

---

## 🏛️ System Architecture & API Endpoints

### Frontend (`frontend/`)
* **Framework:** React 19, React Router v7, Tailwind CSS v4 `@theme`.
* **Key Routes:**
  * `/` — Editorial Landing Page with 3D stacked feature peel.
  * `/dashboard` — Patient Dashboard with Pause & Choose, anti-gamified stats, and Clinical Recommendations card.
  * `/practice` — Longitudinal SUDS and ERP history timeline with Habit Delay timer.
  * `/toolkit` — Somatic regulators: 90s Urge Surfing wave, Vagus Sigh pacing, Box breathing.
  * `/learn` — Psychoeducational ACT modules and Reassurance Trap deconstructors.
  * `/care` — Clinician Connect, Verified Directory, granular consent switches, and Cedar WASM live policy evaluator.
  * `/practitioner/login` — Dual Sign-In and Practitioner Self-Registration portal.
  * `/practitioner` — Clinician Dashboard for patient review, pending requests, AI overview, and recommendation authoring.
  * `/settings` — Profile management, session tokens, and 24/7 crisis access.

### Backend Lambda Handlers (`backend/src/`)
* **`auth.js`** — Patient and Practitioner authentication and self-registration.
* **`checkins.js`** — 0–10 calibrated SUDS check-in records.
* **`practice.js`** — ERP trial logging and Habit Delay recording.
* **`dashboard.js`** — Objective longitudinal metrics (`checkinCountThisWeek`, `activeDaysThisWeek`, `avgSudsThisWeek`).
* **`consents.js`** — Patient granular consent management with real-time sync to active connections.
* **`connections.js`** — Connection lifecycle, patient recommendations, and Cedar authorization evaluation endpoint.
* **`practitioner.js`** — Clinician patient queries, request processing, recommendation authoring, and Cedar WASM policy gating.
* **`aiSummary.js`** — Clinician RAG synthesis handler with Qwen 2.5 7B and deterministic fallback.
* **`express-dev-server.js`** — Unified Express dev server bridging Lambda handlers.

---

## ⚖️ AWS Cedar WASM Authorization Policy

Patient data is strictly protected by the following Cedar policy evaluated by `@cedar-policy/cedar-wasm`:

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

If the patient unchecks `practice_logs` or revokes the connection, the Cedar engine immediately evaluates `DENY`, and the clinician API returns `403 CONSENT_REQUIRED`.

---

## ☁️ AWS Cloud Production Deployment

See the comprehensive deployment runbook: **[`docs/deployment/AWS_DEPLOYMENT.md`](file:///run/media/aadesh/New%20Volume%20D/Between_Sessions/docs/deployment/AWS_DEPLOYMENT.md)**.

* **Target Stack:** AWS SAM (`infrastructure/template.yaml`, `infrastructure/samconfig.toml`).
* **Runtime:** Node.js 22 (`nodejs22.x` on AWS Lambda, x86_64).
* **Storage:** Amazon DynamoDB Single-Table (`BetweenSessionsTable` on Pay-Per-Request billing) with KMS Encryption.
* **API Gateway:** HTTP / REST API with stage routing to 13 decoupled serverless Lambda functions.
* **Hosting:** Amazon S3 + CloudFront CDN for frontend distribution.

### Quick Deployment Commands
```bash
# 1. Build serverless functions
cd infrastructure && sam build

# 2. Deploy to AWS Cloud (Guided first time)
sam deploy --guided
```
*(Do NOT deploy to AWS until completing local manual review).*
