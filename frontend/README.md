# Between Sessions — Frontend Web Client

The frontend for **Between Sessions** is built with React 18, Vite, and Tailwind CSS v4, strictly adhering to the **Organic Strategic Editorial** design system.

It bridges the 167 hours between clinical therapy sessions through an open-canvas aesthetic, anti-gamified behavioral tracking, real-time somatic biofeedback regulators, and a dense, privacy-governed clinician portal.

---

## Design System & Theming Tokens

Defined authoritative in `src/index.css`:

### Typography Rules

| Role | Font Family | Tailwind Class | Semantic Usage |
|---|---|---|---|
| Headlines & Qualitative Prompts | `Newsreader` | `font-editorial` / `font-serif` | Hero headlines, section titles, reflections |
| Body Copy & UI Controls | `Plus Jakarta Sans` | `font-sans` | All standard body text, buttons, tags, nav |
| Telemetry & Data | `JetBrains Mono` | `font-mono` | Calibrated SUDS numerals, timestamps, clinical IDs |

> **Directive Rule**: `font-mono` is strictly prohibited on UI copy, labels, and headings. It is strictly reserved for numeric data and timestamps.

### Semantic Color Palette

- **Primary Teal** (`#176B67` / `brand-teal`): Confirmed states, primary CTAs, active indicators.
- **Ink** (`#17323A` / `brand-ink`): High-contrast typography and structural framing.
- **Canvas** (`#F7F8F7` / `brand-canvas`): Calming, non-stigmatizing warm base page background.
- **Coral** (`#E8856C` / `brand-coral`): Acute distress indicators, somatic urge spikes, crisis telephony.
- **Lavender** (`#8B7EC8` / `brand-lavender`): Somatic de-escalation, vagal regulation, urge surfing.
- **Amber** (`#D4943A` / `brand-amber`): Mindful observation, defusion prompts, values anchoring.

---

## Application Views & Navigation

| Route | Page Component | Key Functionality |
|---|---|---|
| `/` | `LandingPage.jsx` | 3D stacked feature peel, evidence-based marquee, crisis quick dial |
| `/dashboard` | `DashboardPage.jsx` | 6-card bento orientation, kinetic breathing anchor, quick check-in modal |
| `/practice` | `PracticePage.jsx` | ERP trial logging, Habit Reversal delay timer, response prevention modes |
| `/toolkit` | `ToolkitPage.jsx` | 90s Urge Surfing wave, physiological vagus sigh, box breathing down-regulator |
| `/learn` | `LearnPage.jsx` | Psychoeducational ACT modules, Reassurance Trap deconstructors |
| `/care` | `CarePage.jsx` | Cedar WASM granular consent toggles, practitioner directory connection |
| `/practitioner` | `PractitionerDashboardPage.jsx` | Longitudinal SUDS chart, AI practice overview (FACT/INFERENCE/KNOWLEDGE), clinical recommendations composer |
| `/settings` | `SettingsPage.jsx` | Profile management, device session security, national helplines |

---

## Clinical Safety & Boundaries

- **Anti-Gamification**: Strictly prohibited streaks, celebratory confetti, level-ups, or performance scores. Progress is presented through objective, longitudinal descriptions.
- **Persistent Crisis Support**: Tele-MANAS (14416 / 1800-891-4416) toll-free emergency links are permanently rendered on all viewports.
- **Secondary AI Posture**: AI summaries in the practitioner view are explicitly marked *"Synthesized from patient logs — not medical advice"*.

---

## Development & Build

```bash
# Install dependencies
npm install

# Run local development server (port 5173)
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```
