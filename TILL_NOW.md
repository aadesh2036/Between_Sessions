# Between Sessions — Project Status

> **Read this file at the start of ANY session to understand project state and next steps.**
> Last updated: 2026-09-17 18:15 IST

---

## ✅ What's Done

### Phase 0: Design & Configuration Setup
- [x] Stitch MCP project linked: `projects/3467580472824619901` (`BS_FINAL`)
- [x] Design system: `Organic Strategic Editorial` (`assets/5b983aea382c4d5fbfdfe4f98f906e7e`)
- [x] Share token documented: `AQ.Ab8RN6Kqharpue_qBoqS37-tNRpOuH-uC17es4PHZMIV0hs4ig`
- [x] CSS tokens created: `design-system/tokens.css`
- [x] Tailwind config created: `design-system/tailwind.config.js`
- [x] Design system guide: `design-system/DESIGN_SYSTEM_GUIDE.md`
- [x] Stitch config: `stitch.config.json`
- [x] Project rules: `AGENTS.md` + `GEMINI.md`
- [x] Skills imported: `stitch-page-builder`, `between-sessions-design`, `generative-ui`, `gemini-api-dev`

### Phase 1: Frontend Scaffold
- [x] React + Vite project: `frontend/`
- [x] Tailwind CSS v4 configured with `@tailwindcss/vite`
- [x] React Router installed
- [x] Design system tokens & full mascot keyframe animations in `frontend/src/index.css`
- [x] Route structure defined in `frontend/src/App.jsx`
- [x] Landing page: `frontend/src/pages/LandingPage.jsx` (finalized)
- [x] 3D Stacked Cards: `frontend/src/components/StackedFeatureCards.jsx` (finalized)
- [x] Live Vite dev server running at `http://localhost:5173/`

### Phase 1.5: Landing Page Polish & Design Finalization ✅ COMPLETE
- [x] **Upgraded Pip Mascot**: Full 10-second SVG animation cycle (struggle → exhale → joyful relief), animated puzzle pieces, unified arms, dual face states, sweat drop, cheek blush, and celebration sparkles.
- [x] **Open Canvas Design**: Hero sits directly on breathable canvas (`#F7F8F7`), no artificial card containers.
- [x] **Full-Screen 3D Stacked Cards**:
  - Vertical 3D peel-off scroll (`perspective: 1600px`, `rotateX(15deg) translateZ(-500px)`) with interactive stepper tabs.
  - **Card 01 — Personal Sanctuary** (dark ink bg): 90-sec Urge Surfer, Digital Worry Stone, interactive SUDS 1–10, Habit Extinction Delay.
  - **Card 02 — Clinician Terminal** (teal bg): Diurnal Urge Surge spline, Consented Patient Radar, Cohort Stability triage, Practitioner Guidance.
  - **Card 03 — Consent & AI Governance** (cream bg): Interactive consent toggles, Auditable AI pattern card, Secondary AI Posture badge, Tele-MANAS safety banner.
- [x] **Card Viewport Calibration**: Sticky stage at `top-[84px]`, stage height `580px–600px`, animation triggers after full card visibility, smooth 1.5s bezier transitions.
- [x] **Full Mobile, Tablet & Desktop Responsiveness**:
  - Mobile hamburger drawer with section links + Tele-MANAS quick-dial.
  - Fluid typography (`text-3xl` → `text-6xl`), adaptive Pip SVG scaling.
  - Mobile cards use `overflow-y-auto custom-scrollbar`, desktop uses `overflow-hidden`.
  - Adaptive sticky clearance: `top-[68px]` (mobile) / `top-[84px]` (desktop).
- [x] **Design System Finalization**:
  - All color tokens synchronized across `index.css` `@theme`, `tokens.css`, `tailwind.config.js`.
  - `tealDark` hover color corrected to `#195E5A` across all three sources.
  - Typography rules enforced: `font-mono` restricted to numeric data only.
  - `DESIGN_SYSTEM_GUIDE.md` expanded with comprehensive responsive rules, animation conventions, component patterns, and clinical safety rules.
  - `AGENTS.md` and `GEMINI.md` updated with responsive breakpoints, animation conventions, and expanded clinical boundaries.
- [x] **Page Streamlining**: Removed ~800 lines of duplicate static sections. Clean flow: Navbar → Hero → Marquee → Stacked Cards → Dual CTAs → Safety → Footer.

### Copy Corrections Applied
- [x] Removed "continuous bio-behavioral bridge" → "Structured behavioral continuity"
- [x] Removed "live somatic biomarkers" → not present
- [x] Removed "sub-second EHR Webhook" → "Consent-based practitioner insights"
- [x] Removed HIPAA Tier-4 claim → "Privacy-first design"
- [x] Removed institutional partnerships (NOCD, McLean, Stanford, etc.) → evidence framework labels
- [x] Removed "Intelly™" branding → "Clinician Dashboard"
- [x] Removed "Dr. Olivia" persona → generic
- [x] Removed "Prescribed Micro-Exposures" → "Curated Structured Practice"
- [x] Removed streak/gamification language

---

## 🔲 What's Next

### Phase 2: Authentication & Onboarding (Next Priority)
- [ ] Cognito setup (or mock auth for hackathon)
- [ ] Login page (`/login`)
- [ ] Practitioner login (`/practitioner/login`)
- [ ] Demo-user fast path
- [ ] Onboarding flow: Goal → Language → Privacy → Data Controls → Safety Ack → /app

### Phase 3: User Dashboard & Core Features
- [ ] Personal dashboard (`/app`) — generate via Stitch MCP
- [ ] Daily check-in (`/app/check-in`) — 1-10 SUDS scale
- [ ] Behavioral / compulsion log (`/app/log`)
- [ ] ERP practice companion (`/app/practice`)
- [ ] Progress dashboard (`/app/progress`)
- [ ] AI weekly summary (`/app/insights`)
- [ ] Consent center (`/app/share`)
- [ ] Safety resources page (`/app/resources`)

### Phase 4: Practitioner Dashboard
- [ ] Practitioner dashboard (`/practitioner`) — generate via Stitch MCP
- [ ] Patient requests (`/practitioner/requests`)
- [ ] Patient view with consent-filtered data
- [ ] Recommendation / referral form

### Phase 5: Backend Integration
- [ ] AWS SAM / Lambda handlers
- [ ] DynamoDB single-table design
- [ ] API Gateway endpoints
- [ ] Strands/Bedrock AI summary
- [ ] Cedar authorization policies
- [ ] Demo seed data

### Phase 6: Polish & Deploy
- [ ] Amplify hosting
- [ ] Demo walkthrough (3-minute path)
- [ ] CloudWatch observability

---

## 📁 Project Structure

```
Between_Sessions/
├── AGENTS.md                          # Project directives (agent rules)
├── GEMINI.md                          # Project directives (identical to AGENTS.md)
├── TILL_NOW.md                        # ← THIS FILE
├── stitch.config.json                 # Stitch MCP project configuration
├── MVP_RECREATED.md                   # MVP scope document
├── PRD_FRONTEND_RECREATED.md          # Frontend PRD
├── PRD_BACKEND_RECREATED.md           # Backend PRD
├── DATA_MODELS.md                     # Data models
├── design-system/
│   ├── tokens.css                     # CSS custom properties (vanilla reference)
│   ├── tailwind.config.js             # Tailwind v3 compat preset
│   └── DESIGN_SYSTEM_GUIDE.md         # Visual rules, components, & responsive guide
├── LANDING_PAGE_&_DESIGN_SYS/
│   ├── code.html                      # Original Stitch export (historical reference)
│   ├── DESIGN.md                      # Stitch design system spec
│   └── screen.png                     # Screenshot
├── frontend/                          # React + Vite app
│   ├── index.html                     # HTML entry point with meta tags
│   ├── vite.config.js                 # Vite + Tailwind v4 config
│   ├── package.json
│   └── src/
│       ├── main.jsx                   # React DOM root
│       ├── index.css                  # Tailwind v4 @theme + animations (SOURCE OF TRUTH)
│       ├── App.jsx                    # React Router with route map
│       ├── pages/
│       │   └── LandingPage.jsx        # Finalized landing page (navbar, hero, mascot, marquee, callouts, safety, footer)
│       └── components/
│           └── StackedFeatureCards.jsx # 3D scroll-peel cards (3 layers, interactive)
└── .agents/
    └── skills/
        ├── stitch-page-builder/       # Stitch MCP page generation skill
        ├── between-sessions-design/   # Design system enforcement skill
        ├── generative-ui/             # Interactive widget rendering skill
        └── gemini-api-dev/            # Gemini API development skill
```

---

## 🎯 Design System Quick Reference

| Token | Hex | Tailwind | Role |
|---|---|---|---|
| `brand-ink` | `#17323A` | `brand-ink` | Structural headings, high contrast |
| `brand-teal` | `#176B67` | `brand-teal` | Primary actions, confirmed states |
| `brand-tealDark` | `#195E5A` | `brand-tealDark` | Primary hover/pressed |
| `brand-coral` | `#E8856C` | `brand-coral` | Distress, somatic indicators |
| `brand-lavender` | `#8B7EC8` | `brand-lavender` | De-escalation, meditation |
| `brand-amber` | `#D4943A` | `brand-amber` | Mindful prompts, observations |
| `brand-canvas` | `#F7F8F7` | `brand-canvas` | Base page background |
| `brand-paper` | `#FFFFFF` | `brand-paper` | Card surfaces |
| `brand-border` | `#D8DFDE` | `brand-border` | 1px hairline borders |

**Typography:** Newsreader (`font-editorial`) · Plus Jakarta Sans (`font-sans`) · JetBrains Mono (`font-mono` — data only)

**Shadows:** `shadow-card-lift` (cards) · `shadow-pill` (nav) · `shadow-dashboard` (heavy panels)

---

## 🔑 Key IDs & Config

| Item | Value |
|---|---|
| Stitch Project ID | `3467580472824619901` |
| Stitch Project Title | `BS_FINAL` |
| Share Token | `AQ.Ab8RN6Kqharpue_qBoqS37-tNRpOuH-uC17es4PHZMIV0hs4ig` |
| Design System | `Organic Strategic Editorial` |
| Design System Asset | `assets/5b983aea382c4d5fbfdfe4f98f906e7e` |
| Safety Helpline | Tele-MANAS: 14416 / 1800-891-4416 |

---

## 📚 Project Documentation Directory

| File | Path | Description |
|---|---|---|
| **Agents / AI Rules** | [`AGENTS.md`](./AGENTS.md) | Agent directives, design system, clinical boundaries, animation conventions. |
| **Gemini Rules** | [`GEMINI.md`](./GEMINI.md) | Identical to AGENTS.md for Gemini context. |
| **Data Models** | [`DATA_MODELS.md`](./DATA_MODELS.md) | Schema definitions for users, sessions, and telemetry. |
| **Design Guide** | [`design-system/DESIGN_SYSTEM_GUIDE.md`](./design-system/DESIGN_SYSTEM_GUIDE.md) | Visual language, typography, colors, shadows, responsive rules, animation conventions, component patterns. |
| **Design Tokens** | [`design-system/tokens.css`](./design-system/tokens.css) | Vanilla CSS custom properties (reference for non-Tailwind consumers). |
| **Tailwind Preset** | [`design-system/tailwind.config.js`](./design-system/tailwind.config.js) | Tailwind v3 compat preset (v4 `@theme` in `index.css` is authoritative). |
| **Landing Page Design** | [`LANDING_PAGE_&_DESIGN_SYS/DESIGN.md`](./LANDING_PAGE_&_DESIGN_SYS/DESIGN.md) | Original Stitch design brief (historical reference). |
| **MVP Spec** | [`MVP_RECREATED.md`](./MVP_RECREATED.md) | Core feature requirements for the Minimum Viable Product. |
| **Backend PRD** | [`PRD_BACKEND_RECREATED.md`](./PRD_BACKEND_RECREATED.md) | Infrastructure, database, and API specifications. |
| **Frontend PRD** | [`PRD_FRONTEND_RECREATED.md`](./PRD_FRONTEND_RECREATED.md) | React/Vite architecture, component layout, routing, and visual system. |
| **Status Tracker** | [`TILL_NOW.md`](./TILL_NOW.md) | Current project state, checklist, and documentation index (this file). |
| **Runtime Tokens** | [`frontend/src/index.css`](./frontend/src/index.css) | Tailwind v4 `@theme` + all CSS animations — **source of truth for the app**. |
