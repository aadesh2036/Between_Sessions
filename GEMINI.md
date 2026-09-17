# Project Directives — Between Sessions

> **Read before writing any code, generating any screens, or making design decisions.**
> Last synchronized: 2026-09-17

---

## 1. Stitch MCP Configuration & Page Generation Strategy

* **Default Stitch Project Resource:** `projects/3467580472824619901`
* **Stitch Project ID:** `3467580472824619901` (`BS_FINAL`)
* **Share Token / Hash:** `AQ.Ab8RN6Kqharpue_qBoqS37-tNRpOuH-uC17es4PHZMIV0hs4ig`
* **Design System Name:** `Organic Strategic Editorial` (`assets/5b983aea382c4d5fbfdfe4f98f906e7e`)
* **Landing Page (`/`):** Built as a React component at `frontend/src/pages/LandingPage.jsx` with `StackedFeatureCards.jsx`. Do not regenerate — the landing page is finalized.
* **All Other Application Pages:** Generate, iterate, and retrieve screens via Stitch MCP using project ID `3467580472824619901`, applying the `Organic Strategic Editorial` design system.

---

## 2. Design System & Theming Tokens

All frontend development must adhere to the design system established in:
- Runtime tokens: `frontend/src/index.css` (Tailwind v4 `@theme` block — **source of truth for the running app**)
- Reference tokens: `design-system/tokens.css` (vanilla CSS custom properties for non-Tailwind consumers)
- Tailwind preset: `design-system/tailwind.config.js` (v3 compat reference — the v4 `@theme` block in `index.css` is authoritative)

### Typography

| Role | Font Family | Tailwind Class | Usage |
|---|---|---|---|
| Headlines & Reflective Prompts | `Newsreader` | `font-editorial` / `font-serif` | Hero titles, section headers, qualitative reflections |
| Body & Controls | `Plus Jakarta Sans` | `font-sans` | All body text, nav labels, forms, buttons, tags |
| Telemetry & Data | `JetBrains Mono` | `font-mono` | SUDS 0–10 numerals, timestamps, clinical IDs only |

> **Rule:** `font-mono` must NEVER be used for UI labels, headings, or descriptive text. It is strictly for numeric data and timestamps.

### Color Palette

| Token | Hex | Tailwind Class | Semantic Role |
|---|---|---|---|
| Primary | `#176B67` | `brand-teal` | CTAs, active tabs, confirmed states |
| Primary Hover | `#195E5A` | `brand-tealDark` | Hover/pressed state |
| Primary Soft Tint | `#DCEFED` | — | Light primary wash |
| Primary Softer | `#EDF7F6` | `brand-softerTeal` | Chip/badge backgrounds |
| Ink | `#17323A` | `brand-ink` | Structural headings, high contrast |
| Canvas | `#F7F8F7` | `brand-canvas` | Base page background |
| Card Surfaces | `#FFFFFF` | `brand-paper` | Card backgrounds |
| Borders | `#D8DFDE` | `brand-border` | 1px hairline borders |
| Coral | `#E8856C` | `brand-coral` | Distress, somatic, urge indicators |
| Coral Soft | `#FFF0EC` | `brand-coralSoft` | Coral accent containers |
| Lavender | `#8B7EC8` | `brand-lavender` | De-escalation, meditation |
| Lavender Soft | `#F0EDFB` | `brand-lavenderSoft` | Lavender accent containers |
| Amber | `#D4943A` | `brand-amber` | Mindful prompts, observations |
| Amber Soft | `#FFF6E8` | `brand-amberSoft` | Amber accent containers |
| Success | `#2E7D62` | `clinical-success` | Completed practice |
| Success Soft | `#E8F3EE` | `brand-softSuccess` | Success containers |

### Geometry & Shadows

* **Corner Radius:** `4px` (`rounded`) for cards and inputs. Full pill (`rounded-full`) ONLY for status chips, tags, nav pills, and confirmed markers.
* **Shadows:** Soft, diffuse ambient lift (`shadow-card-lift`). Avoid dark sharp drop shadows.
* **3D Cards:** Use `perspective: 1600px` with `-Z` axis rotation for the stacked card peel animation.

### Responsive Breakpoints

| Breakpoint | Width | Usage |
|---|---|---|
| Default (mobile-first) | `< 640px` | Single column, stacked layouts, hamburger nav |
| `sm:` | `≥ 640px` | Two-column grids, expanded nav |
| `md:` | `≥ 768px` | Dual callout cards side by side |
| `lg:` | `≥ 1024px` | Full 12-column dashboard grids, desktop nav |

---

## 3. Behavioral Health & Clinical Boundaries

* **Anti-Gamification:** Strictly prohibit gamified loops, streaks, level-ups, celebratory confetti, or behavioral health scores. Progress is framed through objective, longitudinal descriptions.
* **Secondary AI Posture:** AI summaries must be grounded strictly in user logs and labeled clearly (*"Synthesized from your logs — not medical advice"*). AI must never impersonate clinicians or offer diagnostic closure.
* **Safety Protocol:** Tele-MANAS (14416 / 1800-891-4416) and emergency resource links must remain persistently accessible on every page.
* **No False Claims:** Do not claim HIPAA/SOC-2 certification, real EHR integration, real-time biomarkers, live somatic telemetry, sub-second webhooks, video calling, or institutional partnerships unless actually obtained.
* **Copy Hygiene:** Use "Curated Structured Practice" (not "Prescribed Micro-Exposures"), "Clinician Dashboard" (not "Intelly™"), and avoid fictional persona names (not "Dr. Olivia").

---

## 4. Animation & Interaction Conventions

* **Transitions:** Use `200–400ms` ease-out for hover/focus state changes. Use `1.5s cubic-bezier(0.19, 1, 0.22, 1)` for the 3D card peel animation.
* **Mascot (Pip):** 10-second cycle with 4 puzzle pieces scattering/locking, dual face states (struggle → happy), sweat drop, cheek blush, celebration sparkles. All keyframes defined in `index.css`.
* **Dashboard Micro-Animations:** `pulse-indicator` (2.5s), `anim-vagus-breathe` (5s), `anim-wave-surf` (3s), `anim-radar-ping` (2.5s), `anim-spline-pulse` (2s).
* **Reduced Motion:** Respect `prefers-reduced-motion` media query. Never use animation as the sole indicator of state.
