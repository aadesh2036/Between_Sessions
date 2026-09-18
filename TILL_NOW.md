# TILL_NOW.md

> **Current Status**: Full MVP end-to-end application complete (except real Bedrock AI and AWS deployment). Both user and practitioner paths are functional.
> **Date**: 2026-09-18

---

## ✅ What's Done

### Phase 1: Foundation & Landing Page
- [x] Vite + React + Tailwind CSS v4 template initialized.
- [x] v4 `@theme` block in `src/index.css` (source of truth for runtime tokens).
- [x] **Landing Page** (`/`):
  - Floating navbar, editorial hero, marquee safety strip.
  - 3D scroll-peel StackedFeatureCards component.
  - Dual pathway CTAs: **For You → `/login`**, **Clinician Access → `/practitioner/login`**.
  - Feature claims are accurate only (no HIPAA, no EHR, no biomarkers).
  - Persistent Tele-MANAS (14416 / 1800-891-4416) safety anchor.
- [x] Global `Logo.jsx` component.
- [x] Design system tokens: `design-system/tokens.css` + `tailwind.config.js`.

### Phase 2: Authentication & Onboarding
- [x] `AuthContext.jsx` — JWT session persistence, register, login, logout, updateUser (JWT-protected), forgotPassword, resetPassword, completeOnboarding.
- [x] `ProtectedRoute.jsx` — guards `/app/*` routes and onboarding gate.
- [x] **Login Page** (`/login`) — sliding-panel design, email/password form, verify/resend flow.
- [x] **Login Page supports `practitionerMode` prop** — when `<LoginPage practitionerMode />` is rendered, form switches to clinician mode, calls `practitionerApi.login()`, stores `bs_prac_token` + `bs_prac_user` in localStorage, navigates to `/practitioner`.
- [x] **Onboarding Flow** (`/onboarding`) — 4-step wizard: goal selection, values, privacy notice, safety acknowledgement.

### Phase 3: User Dashboard & Features
- [x] **Dashboard** (`/app`) — fully wired to real API:
  - Stats row: practice this week, check-in streak, avg SUDS (7d), journal entries — all from `GET /dashboard`.
  - **SUDS Check-in Modal** — slider 0–10, urge score, saves to `POST /checkins`.
  - **Log Practice Modal** — response type picker, urge slider, trigger note.
  - **Pause & Choose** tool — 4-step urge intervention, logs response to `POST /practice`.
  - Recent patterns from live journal data.
  - AI Weekly Insight — generate (POST) / display existing (GET) with disclaimer.
  - Life outside OCD values section.
- [x] **Practice History** (`/app/practice`):
  - Journal tab: date-grouped behavioral log entries with responseType chips, urge, tags.
  - Check-ins tab: date-grouped SUDS + urge scores.
  - SUDS trend bar chart (7d/30d) from `GET /progress`.
  - Summary stats row (journal count, check-ins, practice, avg SUDS).
  - **New Entry Modal** — full journal entry form (trigger, urge, responseType, outcome, tags).
  - Range selector 7d/30d.
- [x] **Clinician Connect** (`/app/clinician`):
  - Real connections list grouped by status (active, pending, previous).
  - **ConsentManager** — per-category toggle switches (checkins, journal_structured, practice_logs, ai_summary), updates `PUT /consents`.
  - Send connection request modal.
  - Cedar Auth demo panel.
- [x] **Settings** (`/app/settings`):
  - Profile update (JWT-authenticated PUT /user/update).
  - Password change form.
  - Forgot password form → email reset link (Mailtrap sandbox).
  - Reset password via `?reset=<token>` URL param.
  - Email verification resend.
  - Sign out.

### Phase 4: Practitioner Dashboard & Features
- [x] **Practitioner Login** (`/practitioner/login`) — `<LoginPage practitionerMode />`.
- [x] **Practitioner Dashboard** (`/practitioner`) — `PractitionerDashboardPage.jsx`:
  - **Sidebar**: Logo, nav (Dashboard, Requests with badge, Patients), practitioner name + verified badge, logout.
  - **Dashboard view**: stats row (pending requests, active patients), pending requests panel with Accept/Decline buttons, active patients list (clickable → patient detail).
  - **Patient detail view**: back nav, header with consent chips, summary stats (check-ins, avgSuds, practice, journal), SUDS bar trend chart, practice log table, journal entries list, AI summary section, recommendations list.
  - **Recommendation form**: observation, nextStep (required), referral, noteToUser — saves to `POST /practitioner/patients/:userId/recommendations`.
  - Cedar consent enforcement: 403 shown with explanation when consent is missing.
  - Clinical boundary notice: "Data shown is limited to categories the patient has explicitly consented to share."
  - Safety footer on every view.

### Phase 5: Backend (Node.js, DynamoDB Local, Express wrapper)

#### Lambda Handlers
| Handler | Routes |
|---|---|
| `auth.js` | POST register, login, verify, resend, forgot-password, reset-password, PUT user/update (JWT), POST practitioner-login |
| `checkins.js` | POST /checkins, GET /checkins?from=&to= |
| `journal.js` | POST /journal, GET /journal?from=&to= |
| `practice.js` | POST /practice (legacy behavioral event) |
| `dashboard.js` | GET /dashboard (aggregated weekly stats) |
| `progress.js` | GET /progress?range=7d\|30d (time-series) |
| `aiSummary.js` | POST /ai/weekly-summary (generate), GET /ai/weekly-summary?week= |
| `consents.js` | GET /consents, PUT /consents/:consentId |
| `connections.js` | POST /connections, GET /connections, DELETE /connections/:id |
| `practitioner.js` | GET /practitioner/me, GET /practitioner/requests, POST accept/decline, GET /practitioner/patients, GET /practitioner/patients/:userId/summary (Cedar-gated), GET /practitioner/patients/:userId/consent, POST /practitioner/patients/:userId/recommendations |

#### Infrastructure
| File | Purpose |
|---|---|
| `express-dev-server.js` | All routes wired, Lambda event bridge |
| `template.yaml` | SAM template with all 10 Lambda functions |
| `seed.js` | Full deterministic demo dataset |
| `start-local.sh` | One-command local startup (downloads JAR, seeds, starts both services) |

#### Demo Dataset (seed.js)
- User: `demo@betweensessions.com` / `Demo1234!` — verified, onboarding complete
- Practitioner: `practitioner@betweensessions.com` / `Prac1234!` — verified
- 7 daily check-ins (SUDS 8→4 trend)
- 5 behavioral journal entries
- 4 practice logs (pre/post distress)
- Active connection (demo user ↔ practitioner) with `practice_logs` + `checkins` consent
- 1 AI weekly summary
- 1 pending request from `pending@betweensessions.com`

#### Authorization
- User JWT: `{ userId, email }` — access all `/api/v1/*` user routes
- Practitioner JWT: `{ practitionerId, email, role: 'practitioner' }` — access all `/practitioner/*` routes
- Cedar policy on patient summary: requires `connectionStatus == "ACTIVE"` AND `consentedCategories.contains("practice_logs")`
- `/user/update` requires valid user JWT (no unauthenticated updates)

### Phase 6: Frontend API Service Layer
- [x] `services/api.js`:
  - `apiFetch()` — attaches `bs_token` Bearer header automatically
  - `pracFetch()` — attaches `bs_prac_token` Bearer header for practitioner calls
  - Exports: `authApi`, `dashboardApi`, `checkinsApi`, `journalApi`, `practiceApi`, `progressApi`, `aiSummaryApi`, `consentsApi`, `connectionsApi`, `practitionerApi`
  - Normalised error handling: `{ message, code, status }`

---

## 🔲 What's NOT Done (Explicitly Out of Scope for Demo)

| Feature | Status |
|---|---|
| Real Bedrock/Strands AI | Mock in place (same API shape — swap `rule-based-v1-mvp` for Bedrock model ID) |
| AWS Cognito / Amplify auth | JWT mock in place; SAM template ready |
| AWS deployment | SAM template complete; need `samconfig.toml` + env vars |
| Production email | Mailtrap sandbox in use; swap for AWS SES |
| Password hashing | Plaintext in demo; production needs bcrypt |
| DynamoDB GSI for patient list | Practitioner patient list uses REQUEST# scan; production needs GSI |
| Video, EHR, real-time messaging | Explicitly out of MVP scope |
| Mobile native apps | Web only |
| Education hub pages | `/education` route not yet built |
| AI Insights dedicated page | `/app/insights` route not yet built (summary shown inline on dashboard) |

---

## 📁 Project Structure

```
Between_Sessions/
├── AGENTS.md / GEMINI.md          # Project directives
├── TILL_NOW.md                    # This file
├── MVP_RECREATED.md               # MVP scope contract
├── PRD_FRONTEND_RECREATED.md      # Frontend PRD
├── PRD_BACKEND_RECREATED.md       # Backend PRD
├── DATA_MODELS.md                 # DynamoDB entity design
├── design-system/
│   ├── tokens.css
│   ├── tailwind.config.js
│   └── DESIGN_SYSTEM_GUIDE.md
├── backend/between-sessions-backend/
│   ├── start-local.sh             # ← one-command local startup
│   ├── template.yaml              # SAM/CloudFormation
│   ├── samconfig.toml
│   └── src/
│       ├── auth.js
│       ├── checkins.js
│       ├── journal.js
│       ├── practice.js
│       ├── dashboard.js
│       ├── progress.js
│       ├── aiSummary.js
│       ├── consents.js
│       ├── connections.js
│       ├── practitioner.js
│       ├── express-dev-server.js
│       ├── seed.js
│       └── package.json
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── index.css              # Tailwind v4 @theme (source of truth)
        ├── App.jsx                # Full route map
        ├── context/
        │   └── AuthContext.jsx
        ├── services/
        │   └── api.js             # apiFetch + pracFetch + all API namespaces
        ├── components/
        │   ├── Logo.jsx
        │   ├── ProtectedRoute.jsx
        │   └── StackedFeatureCards.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── LoginPage.jsx          # supports practitionerMode prop
            ├── OnboardingFlow.jsx
            ├── DashboardPage.jsx
            ├── PracticeHistoryPage.jsx
            ├── ClinicianConnectPage.jsx
            ├── SettingsPage.jsx
            └── PractitionerDashboardPage.jsx
```

---

## 🚀 How to Run

### Prerequisites
- Node.js 18+
- Java 11+ (for DynamoDB Local)

### Start backend + database

```bash
cd backend/between-sessions-backend
./start-local.sh          # downloads DynamoDB Local JAR if missing, seeds, starts API on :3000
# or to re-seed from scratch:
./start-local.sh --seed
```

Manual equivalent:
```bash
# Terminal 1 — DynamoDB Local (in-memory)
cd /tmp/dynamodb-local
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -inMemory -port 8000

# Terminal 2 — Express API + seed
cd backend/between-sessions-backend/src
node seed.js
node express-dev-server.js  # API on http://localhost:3000/api/v1
```

### Start frontend

```bash
cd frontend
npm install
npm run dev  # Vite on http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| User | `demo@betweensessions.com` | `Demo1234!` |
| Practitioner | `practitioner@betweensessions.com` | `Prac1234!` |

---

## 🎯 3-Minute Demo Path

| Time | Step |
|---|---|
| 0:00–0:20 | Landing page → dual pathway CTAs |
| 0:20–0:50 | Log in as demo user → dashboard with live stats |
| 0:50–1:20 | Submit check-in (SUDS modal) → log a behavioral response (Pause & Choose) |
| 1:20–1:45 | Visit Practice History → see journal timeline + SUDS trend chart |
| 1:45–2:00 | Clinician Connect → toggle consent categories ON |
| 2:00–2:20 | Log in as practitioner → see patient in list → open patient detail |
| 2:20–2:40 | View consent-filtered summary → write recommendation |
| 2:40–3:00 | Show Cedar auth (403 if consent revoked) → safety footer |

---

## 🎨 Design System Quick Reference

| Token | Hex | Tailwind | Role |
|---|---|---|---|
| `brand-ink` | `#17323A` | `text-brand-ink` | Headings, structural text |
| `brand-teal` | `#176B67` | `text-brand-teal` | CTAs, active states |
| `brand-coral` | `#E8856C` | `text-brand-coral` | Distress, urge indicators |
| `brand-lavender` | `#8B7EC8` | `text-brand-lavender` | AI, de-escalation |
| `brand-amber` | `#D4943A` | `text-brand-amber` | Prompts, pending |
| `brand-canvas` | `#F7F8F7` | `bg-brand-canvas` | Page background |
| `brand-paper` | `#FFFFFF` | `bg-white` | Card surfaces |

**Typography:** Newsreader (`font-editorial`) · Plus Jakarta Sans (`font-sans`) · JetBrains Mono (`font-mono` — numeric/timestamps only)

---

## ⚠️ Known Demo Limitations

1. **DynamoDB is in-memory** — data resets on DynamoDB Local restart. Run `node seed.js` again.
2. **Passwords plaintext** — demo only; production needs bcrypt + Cognito.
3. **No GSI** — practitioner patient list queries REQUEST# prefix; for production, add GSI on `PRACTITIONER#<id>` → active connections.
4. **Mailtrap sandbox** — forgot-password emails go to Mailtrap inbox, not real email.
5. **AI is mocked** — `aiSummary.js` builds the summary from user's own metrics deterministically; same API shape as a Bedrock call.

---

## 🔒 Clinical & Safety Invariants (never remove)

- Tele-MANAS `14416` / `1800-891-4416` persistent on every page.
- "Not a diagnosis / not medical advice" on every AI output.
- No HIPAA/SOC-2 claims.
- No AI-prescribed exposures (curated exercises only).
- No autonomous crisis detection.
- Consent revocation propagates immediately to backend authorization.
- Cedar policy is enforced server-side — frontend role checks are cosmetic only.
