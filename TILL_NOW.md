# TILL_NOW.md

> **Current Status**: Landing Page finalized. Authentication framework, Minimalist Onboarding Flow, and Dashboard Layout are successfully implemented and verified.
> **Date**: 2026-09-17

## ✅ What's Done

### Phase 1: Foundation & Landing Page
- [x] Initialized Vite + React + Tailwind CSS v4 template.
- [x] Converted old Tailwind config into a v4 `@theme` block in `src/index.css`.
- [x] Built the **Landing Page** (`/`):
  - Sticky navbar with "For You" buttons.
  - Organic hero layout with proper grid structures.
  - Animated continuous marquee for clinical boundaries.
  - Interactive "Stacked Cards" 3D scroll-peel layout.
  - Persistent Tele-MANAS (14416) safety anchors.
  - Verified routing (`<Link to="/login">`) across all call-to-action buttons.
- [x] Established Global `Logo.jsx` component for single-source-of-truth brand identity.
- [x] Cleaned up clinical boundaries: removed gamification, false EHR claims, and streak language.

### Phase 2: Authentication & Onboarding
- [x] **Auth Context**: Created `AuthContext.jsx` featuring a mock network-delayed login, local storage session persistence, and `completeOnboarding` functionality.
- [x] **Protected Routes**: Implemented `ProtectedRoute.jsx` to manage secure entry points and auto-routing (handling the `login -> onboarding -> app` chain).
- [x] **Login Page** (`/login`): Converted a sliding-panel HTML template into a functional React page that triggers the mock auth context.
- [x] **Minimalist Onboarding Flow** (`/onboarding`): 
  - Overhauled from a bulky card-based design to a serene, free-canvas aesthetic.
  - Replaced heavy descriptive boxes with soft, elegant pill toggles.
  - Implemented custom CSS keyframe animations (`animate-fade-up`, `animate-fade-in`) in `index.css` for a fluid, staggering entrance on each step.
  - Ensured correct state progression and final routing to the user dashboard.

### Phase 3: Dashboard Skeleton
- [x] **Dashboard Layout** (`/app`):
  - Translated a dense HTML bento-box template into `DashboardPage.jsx`.
  - Refined the bento boxes by reducing extreme border radii (from 40px down to standard `rounded-3xl` and `rounded-2xl`) to achieve a softer, less "generic AI" look.
  - Implemented sticky sidebar navigation mapped to Material Symbols.
  - Wired up foundational React states for the 10-point SUDS scale, 90-second urge surfing countdown, and the 4-7-8 somatic vagus pacer.

---

## 🔲 What's Next

### Phase 3 Continued: Core Dashboard Logic & Features
- [ ] Connect the Dashboard's SUDS log to a real/mock API.
- [ ] Implement the Behavioral/Compulsion logging modal/panel.
- [ ] Build out the AI weekly summary (`/app/insights`) and Progress views (`/app/progress`).
- [ ] Setup the Consent Center (`/app/share`).

### Phase 4: Practitioner Dashboard
- [ ] Practitioner login path (`/practitioner/login`).
- [ ] Practitioner dashboard (`/practitioner`) — generate via Stitch MCP.
- [ ] Patient request inbox and consent-filtered data views.

### Phase 5: Backend Integration
- [ ] AWS SAM / Lambda handlers setup.
- [ ] DynamoDB single-table design.
- [ ] API Gateway endpoints.
- [ ] Strands/Bedrock AI summary integration.
- [ ] Cedar authorization policies for privacy boundaries.

### Phase 6: Polish & Deploy
- [ ] AWS Amplify hosting setup.
- [ ] Demo walkthrough (3-minute path) curation.
- [ ] CloudWatch observability configuration.

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
│       ├── context/
│       │   └── AuthContext.jsx        # Auth state and mock login provider
│       ├── components/
│       │   ├── Logo.jsx               # Global unified branding component
│       │   ├── ProtectedRoute.jsx     # Route gating and onboarding redirect
│       │   └── StackedFeatureCards.jsx # 3D scroll-peel cards
│       └── pages/
│           ├── LandingPage.jsx        # Landing page
│           ├── LoginPage.jsx          # Sliding panel auth screen
│           ├── OnboardingFlow.jsx     # Animated, minimalist 4-step wizard
│           └── DashboardPage.jsx      # Fluid interlocking bento dashboard
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

## Remaining Tasks & Known Limitations (Pending Implementation)
> **Note:** The following features and architectural tasks are currently incomplete and are marked for the next iteration.

1. **Forgot Password Flow:**
   - Password reset functionality (emailing reset link, reset token verification, and password change endpoints) is completely missing.

2. **Dashboard Sub-Pages:**
   - The inside pages of the dashboard (`/app/practice`, `/app/clinician`) are currently static structural placeholders. They need to be wired to real backend queries (e.g., fetching historical behavioral events from DynamoDB).

3. **User Profile Management:**
   - The User Edit Profile page exists visually, but the `/api/v1/user/update` endpoint currently lacks proper JWT bearer token authorization validation to securely protect user data modification.

4. **Complete ERP Architecture:**
   - The comprehensive Exposure and Response Prevention (ERP) engine (e.g., exposure hierarchies, detailed exposure logging, and SUDS tracking over time) is not fully implemented yet.

5. **Production Readiness:**
   - Replacing Mailtrap with a production email service (e.g., AWS SES).
   - Moving from local DynamoDB and the Express wrapper to a fully deployed AWS API Gateway + Lambda + DynamoDB production stack.
