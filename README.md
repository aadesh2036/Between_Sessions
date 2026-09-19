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

---

## 🛡️ Clinical Boundaries & Ethical Tenets

| Directive | Architectural Implementation |
|---|---|
| **Anti-Gamification** | Strictly prohibits streaks, levels, confetti, and health scores. Progress is framed solely through objective longitudinal descriptions (e.g. *"Check-ins (7d)"*, *"Practice sessions: 6"*). |
| **Secondary AI Posture** | AI never diagnoses, prescribes, or acts as a therapist. Weekly summaries are strictly grounded in user logs and labeled: *"Synthesized from your logs — not medical advice"*. |
| **Emergency Safety Net** | Persistent **Tele-MANAS** anchors (`14416` / `1800-891-4416` free, 24/7) remain permanently visible and accessible on all views. |
| **Cryptographic Policy Authorization** | Clinicians cannot access patient summaries without an **ACTIVE** connection and explicit **`practice_logs`** patient consent evaluated via AWS Cedar WASM. |
| **Synthetic Practitioner Validation** | Demo practitioner credentials adhere to strict synthetic formatting (`MCI-YYYY-XX-NNNN`) and are explicitly labeled *"Demo credential — not a real government ID"*. |

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

## 🚀 Quick Start (Root Startup Scripts)

### Prerequisites
* **Node.js:** v20+ (tested on Node v24.18.1)
* **npm:** v10+
* **Java:** JDK 11+ (tested on OpenJDK 25) for DynamoDB Local
* **AWS SAM CLI & Container Runtime (Podman/Docker):** Required for native SAM Serverless mode (`start_sam.sh`).

---

### 1. Launch Modes

| Script | Purpose | Stack |
|---|---|---|
| **`./start_sam.sh`** | **AWS Hackathon & Cloud-Parity** | Native AWS SAM CLI (`sam local start-api`), 13 Lambda functions, warm container caching, DynamoDB Local, Vite frontend. |
| **`./start_express.sh`** | **Fast Local Dev Loop** | Node Express dev server bridging Lambda handlers, in-memory DynamoDB Local, Vite frontend. |
| **`./start.sh`** | **Master Launcher** | Defaults to `./start_sam.sh`. Accepts `--express` for fast dev and `--build`/`--seed` flags. |

#### AWS SAM Serverless Mode (Default for Hackathon):
```bash
./start_sam.sh          # Boots SAM local API on :3000 + DynamoDB on :8000 + Frontend on :5173
./start_sam.sh --build  # Rebuilds SAM Lambda functions prior to launch
./start_sam.sh --seed   # Re-seeds DynamoDB Local with fresh clinical demo datasets
```

#### Express Development Mode:
```bash
./start_express.sh      # Boots lightweight Express server on :3000 + DynamoDB on :8000 + Frontend on :5173
./start_express.sh --seed
```

Open **`http://localhost:5173`** in your browser.

---

### 2. Run Automated Verification Suites
All three verification suites run against either SAM Local API or Express on port 3000:
* **AI & Clinical RAG Integration Suite (23 / 23 checks passed):**
  ```bash
  cd backend/between-sessions-backend
  node test_ai_rag.js
  ```
* **Backend & Security E2E Suite (25 / 25 checks passed):**
  ```bash
  cd backend/between-sessions-backend
  node test_backend_e2e.js
  ```
* **Full Care Journey E2E Suite (35 / 35 checks passed):**
  ```bash
  cd backend/between-sessions-backend
  node test_e2e_journey.js
  ```
* **Total Automated Test Verification:** **83 / 83 passing checks** with zero regressions.

---

### 3. Master Documentation
* [`AI_SETUP.md`](AI_SETUP.md) — Where to add `HF_TOKEN`, model selection, and zero-credential fallback
* [`AI_ARCHITECTURE.md`](AI_ARCHITECTURE.md) — Clinician AI decision support architecture & Cedar boundaries
* [`RAG.md`](RAG.md) — Curated clinical knowledge base, scoring algorithm, and hybrid architecture
* [`FEATURES.md`](FEATURES.md) — Complete features guide for Individuals and Practitioners
* [`AWS_STACK.md`](AWS_STACK.md) — AWS SAM CLI specification, Lambda inventory, and DynamoDB schema


---

## ⏱️ Response Prevention: Delayed Ritual Timer

In Obsessive-Compulsive Disorder (OCD) and Exposure and Response Prevention (ERP), habit extinction occurs when a person tolerates distress without performing a neutralizing ritual. 

Between Sessions features an interactive **Delayed Ritual Timer**:
* **Access Points:** Directly within the ERP practice logging modal (`/app/practice` → *Record Exposure* → *Delay Compulsion*) and via the *Acute Urge Delay Protocol* launcher.
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
  * `/onboarding` — 6-step values, patterns, and granular consent intake.
  * `/app` — Patient Dashboard with Pause & Choose, anti-gamified stats, and Clinical Recommendations card.
  * `/app/practice` — Longitudinal SUDS and ERP history timeline.
  * `/app/clinician` — Clinician Connect, Verified Directory, granular consent switches, and Cedar WASM live policy evaluator.
  * `/practitioner/login` — Dual Sign-In and Practitioner Self-Registration portal.
  * `/practitioner` — Clinician Dashboard for patient review, pending requests, and recommendation authoring.

### Backend (`backend/between-sessions-backend/src/`)
* **`auth.js`** — Patient and Practitioner authentication and self-registration.
* **`dashboard.js`** — Objective longitudinal metrics (`checkinCountThisWeek`, `activeDaysThisWeek`, `avgSudsThisWeek`).
* **`consents.js`** — Patient granular consent management with real-time sync to active connections.
* **`connections.js`** — Connection lifecycle, patient recommendations, and Cedar authorization evaluation endpoint.
* **`practitioner.js`** — Clinician patient queries, request processing, recommendation authoring, and Cedar WASM policy gating.
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

## ☁️ AWS SAM CLI & Hackathon Cloud Deployment

Between Sessions is fully architected for native AWS Serverless deployment via **AWS SAM (Serverless Application Model)**:

* **SAM CLI Version:** `v1.166.2+`
* **Runtime:** Node.js 22 (`nodejs22.x` on AWS Lambda, x86_64)
* **Storage:** Amazon DynamoDB Single-Table (`BetweenSessionsTable` on Pay-Per-Request billing) with Server-Side Encryption
* **API Gateway:** HTTP / REST API with stage routing to 10 decoupled serverless Lambda functions
* **Configuration:** Pre-configured in `backend/between-sessions-backend/template.yaml` and `samconfig.toml`

### Validate & Build with SAM CLI
```bash
cd backend/between-sessions-backend

# 1. Validate template syntax and cfn-lint rules
sam validate

# 2. Build serverless artifacts into .aws-sam/build/
sam build
```

### Deploy to AWS Cloud
```bash
# Guided first-time deployment with IAM capability confirmation
sam deploy --guided

# Subsequent automated continuous deployment
sam deploy
```

### Local Development vs Cloud Deployment
| Feature | Local Hackathon Dev (`./start.sh`) | AWS Cloud Production (`sam deploy`) |
|---|---|---|
| **API Server** | Express dev server (`port 3000`) | AWS API Gateway HTTP/REST API |
| **Compute** | Direct Node.js handler calls | 10 Decoupled AWS Lambda functions |
| **Database** | DynamoDB Local in-memory (`port 8000`) | Amazon DynamoDB Single-Table (On-Demand) |
| **Access Control** | Local Cedar WASM evaluation | AWS Cedar WASM + AWS IAM execution roles |
| **Frontend** | Vite Dev Server (`port 5173`) | AWS S3 + CloudFront / Vercel edge distribution |
