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

---

## 🚀 Quick Start

### Prerequisites
* **Node.js:** v20+ (tested on Node v24.18.1)
* **Java:** JDK 11+ (tested on OpenJDK 25) for DynamoDB Local

### 1. Launch All Local Services (Backend + Database)
```bash
cd backend/between-sessions-backend
./start-local.sh --seed
```
This automatically:
1. Downloads and starts DynamoDB Local on `http://localhost:8000` (in-memory).
2. Runs `seed.js` to create tables and populate full deterministic datasets.
3. Launches the Express API server on `http://localhost:3000/api/v1`.

### 2. Launch the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Run Automated E2E Verification
```bash
node scratch/test_e2e_journey.js
```
Runs 26 automated integration tests covering auth, anti-gamification, Cedar authorization, consent revocation, practitioner review, recommendation authoring, and practitioner registration.

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
