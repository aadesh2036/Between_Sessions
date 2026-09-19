# Between Sessions — Project Audit (STAGE 0)

> **Document Type:** Principal Architecture & Codebase Audit  
> **Date:** 2026-09-18  
> **Author:** Antigravity Autonomous Engineering Agent  
> **Status:** Stage 0 Complete — Implementation Ready  

---

## 1. Executive Summary

Between Sessions is an OCD-focused behavioral-practice and care-continuity platform built on an editorial, calm design system (*Organic Strategic Editorial*). The core product thesis is: **software helps a person notice loops, practice response prevention, and make room for life outside OCD, while qualified clinicians review longitudinal consented evidence and provide human recommendations.**

This audit examines the current state of the codebase across the frontend (React + Tailwind v4), backend (Node.js AWS SAM + Express dev bridge), database (DynamoDB Local single-table design), security/authorization (JWT + AWS Cedar WASM policy engine), and seed datasets.

---

## 2. Current Architecture

### 2.1 Frontend Architecture
* **Framework:** React 19 + Vite 8.
* **Styling:** Tailwind CSS v4 using the authoritative `@theme` block in `frontend/src/index.css`.
* **Routing:** React Router v7 (`BrowserRouter`) with public routes (`/`, `/login`, `/practitioner/login`), user routes (`/onboarding`, `/app`, `/app/practice`, `/app/clinician`, `/app/settings`), and practitioner routes (`/practitioner/*`).
* **State & Auth Context:** `src/context/AuthContext.jsx` manages user session, tokens in `localStorage` (`bs_token`, `bs_user`), and handles profile updates and onboarding flags. Practitioner session is independently managed via `bs_prac_token` and `bs_prac_user`.
* **API Service Layer:** `src/services/api.js` exposes namespaced clients (`authApi`, `dashboardApi`, `checkinsApi`, `journalApi`, `practiceApi`, `progressApi`, `aiSummaryApi`, `consentsApi`, `connectionsApi`, `practitionerApi`).
* **Design System Reference:** `design-system/tokens.css` and `LANDING_PAGE_&_DESIGN_SYS/DESIGN.md` define the *Organic Strategic Editorial* tokens.

### 2.2 Backend Architecture
* **Runtime:** Node.js CommonJS Lambda handlers:
  * `auth.js`: User authentication, email verification, password reset, profile updates, practitioner login.
  * `checkins.js`: Daily SUDS (0–10) and urge score logging and time-window retrieval.
  * `journal.js`: Behavioral event logging with response types, urge, and tags.
  * `practice.js`: Quick behavioral event logging.
  * `dashboard.js`: Aggregated 7-day dashboard statistics.
  * `progress.js`: 7d/30d time-series data and SUDS trend timeline.
  * `aiSummary.js`: Metric-grounded deterministic weekly behavioral summary.
  * `consents.js`: Granular revocable consent grants (`checkins`, `journal_structured`, `practice_logs`, `ai_summary`).
  * `connections.js`: User-to-practitioner connection requests and status tracking.
  * `practitioner.js`: Practitioner profile, request inbox, active patient roster, patient summary, and recommendation authoring.
* **Server Bridge:** `src/express-dev-server.js` provides an Express wrapper simulating AWS API Gateway Lambda event payloads on port 3000.
* **SAM Infrastructure:** `template.yaml` defines 10 AWS Lambda functions and API Gateway routes.

### 2.3 Database Architecture
* **Engine:** Amazon DynamoDB (Single-Table Design: `BetweenSessionsTable`).
* **Key Design:** Hash Key `PK` (string), Range Key `SK` (string).
* **Item Collection Layout:**
  * `USER#<email>` / `PROFILE` — Authentication record
  * `USER#<userId>` / `PROFILE` — User profile & preferences
  * `USER#<userId>` / `CHECKIN#<iso>#<id>` — Distress & urge ratings
  * `USER#<userId>` / `JOURNAL#<iso>#<id>` — Behavioral events
  * `USER#<userId>` / `PRACTICE#<iso>#<id>` — Practice exercise logs
  * `USER#<userId>` / `AI#WEEK#<weekStart>` — Weekly pattern insight
  * `USER#<userId>` / `CONNECTION#<practitionerId>` — Connection state
  * `USER#<userId>` / `CONSENT#<purpose>#<recipientId>` — Granular consent
  * `USER#<userId>` / `RECOMMENDATION#<iso>#<id>` — Practitioner recommendation
  * `PRACTITIONER#<email>` / `PROFILE` — Practitioner credentials
  * `PRACTITIONER#<id>` / `PROFILE` — Public practitioner profile
  * `PRACTITIONER#<id>` / `REQUEST#<iso>#<userId>` — Connection request inbox
  * `LISTING#PRACTITIONERS` / `INDEX` — Public verified practitioner directory

### 2.4 Authorization & Security
* **Authentication Tokens:** Signed JWT with HS256 secret.
* **Role Separation:** Tokens strictly distinguish user tokens from practitioner tokens (`role: 'practitioner'`).
* **Cedar WASM Authorization:** `@cedar-policy/cedar-wasm` (v4 WASM) evaluates server-side authorization:
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

---

## 3. Working Features

| Feature | Surface | Verification Status |
|---|---|---|
| **Landing Page** | `/` | Operational. Editorial hero, 3D card peel, dual CTAs, Tele-MANAS anchor. |
| **User Auth** | `/login` | Operational. Login, register, verify email via Mailtrap, forgot/reset password. |
| **Practitioner Auth** | `/practitioner/login` | Operational. Login with email, password, and Government Practitioner ID. |
| **User Dashboard** | `/app` | Operational. SUDS modal, Log Practice modal, Pause & Choose intervention tool, weekly summary card. |
| **Practice History** | `/app/practice` | Operational. Journal timeline, check-in history, SUDS trend sparkline/bar chart, new entry modal. |
| **Settings** | `/app/settings` | Operational. Profile edits, password reset, token auth. |
| **Consent Center** | `/app/clinician` | Operational. Granular category toggles, revoke consent. |
| **Practitioner Requests** | `/practitioner` | Operational. Accept/decline incoming connection requests. |
| **Practitioner Patient View** | `/practitioner` | Operational. Consent-filtered metrics, SUDS timeline, recommendation writer. |
| **Deterministic Seed Data** | `seed.js` | Operational. Seeds Dr. Kavita Mehra, Priya Sharma (User A), Alex Chen (User B). |

---

## 4. Incomplete Features & Missing MVP Functionality

### 4.1 Practitioner Registration & Synthetic Demo Credentials (Section 18)
* **Gap:** Practitioner registration does not exist. The UI at `/practitioner/login` only has a sign-in form. There is no `POST /api/v1/auth/practitioner-register` endpoint in `auth.js`.
* **Requirement:** Must allow a practitioner to register with a deterministic synthetic credential ID that validates against clearly documented demo rules.
* **Deliverable Needed:** `DEMO_PRACTITIONER_IDS.md` documenting 5–6 synthetic identifiers (including `MCI-2024-KM-7741`), registration endpoint, and registration tab on the practitioner login page with the disclaimer `"Demo credential — not a real government ID"`.

### 4.2 User-Facing Recommendations View (Section 20, 27, 39)
* **Gap:** Practitioners can author recommendations via `POST /practitioner/patients/:userId/recommendations`, and `seed.js` seeds a recommendation for Priya from Dr. Mehra (`REC_MEHRA_001`). However, there is **no user-facing endpoint** (`GET /api/v1/recommendations`) and **no UI component** on the user dashboard or clinician page where the patient can read their clinician's recommendations!
* **Requirement:** The user must be able to view their clinician's human-authored recommendations, observation notes, and next useful steps.

### 4.3 Practitioner Discovery for Unconnected Users (Section 17)
* **Gap:** The backend has `GET /api/v1/practitioners` and seeds `LISTING#PRACTITIONERS / INDEX`, but `ClinicianConnectPage.jsx` has an unused `practitioners` state and forces users to manually type a raw `practitionerId` in an input box.
* **Requirement:** New users like Alex Chen (User B) should see a curated, verified practitioner discovery card on `ClinicianConnectPage` (and linked from the dashboard banner), view Dr. Mehra's profile, and send a connection request with pre-selected consent categories in 1 click.

### 4.4 Onboarding Data Persistence & Support Status (Section 10)
* **Gap 1:** `OnboardingFlow.jsx` lacks the **Support status** step required by Section 10 (*currently working with a professional, worked with one before, considering professional support, learning about OCD, unsure*).
* **Gap 2:** When completing onboarding, `handleFinish` calls `completeOnboarding()` with no payload. The selected values, focus categories, and privacy preferences are discarded and never saved to DynamoDB (`USER#<email>` and `USER#<userId>`).

### 4.5 Consent Synchronization Bug in `consents.js`
* **Gap:** When a user updates consent via `PUT /consents`, `consents.js` saves the `CONSENT#...` item, but only updates `CONNECTION#<recipientId>` when `status === 'revoked'`. When `status === 'active'`, `consentedCategories` is **not synced** to the connection record!
* **Consequence:** `practitioner.js` inspects `conn.consentedCategories` for Cedar evaluation. When a user grants consent in the UI, the Cedar check continues to see an empty list and returns 403 `CONSENT_REQUIRED`.

### 4.6 Cedar Auth Simulation on Clinician Connect Page
* **Gap:** The "Cedar Auth Demo" panel in `ClinicianConnectPage.jsx` executes an unauthenticated `fetch` to `http://localhost:3000/api/v1/practitioner/patients/usr_demo_001/summary` with hardcoded ID `usr_demo_001`, which returns 401 Unauthorized instead of demonstrating Cedar policy evaluation.

---

## 5. UI Inconsistencies & Anti-Gamification Violations

### 5.1 Gamified "Check-in Streak" (Section 11 & Project Directives)
* `DashboardPage.jsx` displays:
  ```html
  <div class="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 mb-1">Check-in streak</div>
  <div class="font-mono text-3xl font-medium text-brand-ink">{stats.checkinStreak ?? 0} days</div>
  ```
* **Violation:** The project directives strictly prohibit gamified streaks, level-ups, or behavioral health scores. Missing a day is not a failure in OCD care.
* **Fix:** Replace with an objective, longitudinal label: `"Check-ins (7d)"` or `"Active Practice Days (7d)"`.

### 5.2 Geometric Inconsistencies
* Modals in `DashboardPage.jsx` and `PracticeHistoryPage.jsx` use `rounded-3xl` and `rounded-2xl` for containers, whereas the design system standard specifies `rounded-md` / `rounded` (4–8px) for structural containers and inputs, reserving full pills (`rounded-full`) strictly for status chips, tags, and confirmed markers.

---

## 6. AI-Readiness Gaps (Future Clinician AI Architecture)

The future AI layer is **clinician-facing behavioral summary / longitudinal pattern synthesis**. To support this without premature AI generation:
1. **BehaviorEvent Model:** Must systematically capture `context` (study, work, home, social, travel, health), `pattern` (checking, reassurance, avoidance, rumination, mental ritual, physical ritual), `response` (compulsion, delayed, partially_resisted, resisted, returned_to_activity, unsure), `responsePrevented` (boolean), `delayDurationSeconds` (number), and `urgeLevel` (0–10).
2. **PracticeSession Model:** Must capture `exerciseId`, `assignedByPractitioner` (boolean), `preDistress`, `postDistress`, `durationSeconds`, `completionStatus`, and `responsePreventionStatus`.
3. **AIInsight Entity Schema:** Needs explicit storage format including `id`, `userId`, `generatedFor`, `periodStart`, `periodEnd`, `insightType`, `summary`, `evidenceReferences` (array of source item IDs), `modelProvider`, `modelName`, `modelVersion`, `clinicianReviewStatus`, `clinicianReviewedBy`, `clinicianReviewedAt`.

---

## 7. Task Breakdown & Execution Plan

### STAGE 1 — Design System Source of Truth (`.stitch/DESIGN.md`)
* Create `.stitch/DESIGN.md` based on `LANDING_PAGE_&_DESIGN_SYS/DESIGN.md` and runtime tokens in `index.css`.
* Resolve type, spacing, and radius tokens.

### STAGE 2 — Backend Data Contracts & Authorization
* Add `GET /api/v1/recommendations` for user-facing recommendation retrieval.
* Add `POST /api/v1/auth/practitioner-register` with deterministic validation of synthetic credentials.
* Fix `consents.js` to update `consentedCategories` on `CONNECTION#<recipientId>` upon active consent grants.
* Update `auth.js` (`/user/update`) to persist `values`, `focusPatterns`, `supportStatus`, and `privacyChoices`.
* Enhance `practice.js` and `journal.js` data entities with structured context, response-prevention flags, and future AI fields.
* Ensure Cedar policy engine tests cover positive and negative cases.

### STAGE 3 — Demo Data & Credentials
* Create `DEMO_PRACTITIONER_IDS.md` with 5–6 synthetic identifiers.
* Update `seed.js` to include User A (Priya — connected with recommendations and history) and User B (Alex — fresh with discovery path).

### STAGE 4 — User Frontend Enhancement
* Refactor `OnboardingFlow.jsx`: Add support status step, persist onboarding selections to backend.
* Refactor `DashboardPage.jsx`:
  * Remove gamified "streak" metric in favor of objective "Check-ins (7d)".
  * Add Clinician Recommendations banner/card showing active recommendations received from connected practitioner.
* Refactor `ClinicianConnectPage.jsx`:
  * Add Verified Practitioner Directory / Discovery section for User B.
  * Connect Cedar Auth Demo with live bearer token evaluation.

### STAGE 5 — Practitioner Frontend Enhancement
* Update `/practitioner/login` to include both "Sign In" and "Register as Practitioner" tabs.
* Add synthetic credential validation feedback with `"Demo credential — not a real government ID"` badge.
* Enhance patient summary view with full consent transparency.

### STAGE 6 & 7 — End-to-End Integration & Visual QA
* Start DynamoDB Local and Express API server.
* Run end-to-end user journeys in the browser: User A, User B, Practitioner.
* Verify Cedar negative authorization (revoked consent -> 403).

### STAGE 8 & 9 — Documentation & Release Check
* Update all `.md` files (`README.md`, `MVP.md`, `DATA_MODELS.md`, `API.md`, `DEMO_USERS.md`, `SECURITY.md`, `AI_READY.md`).
* Generate final execution artifact `AUTONOMOUS_RUN_REPORT.md`.
