# Between Sessions — Visual Design System Source of Truth

> **Design System Name:** Organic Strategic Editorial  
> **Stitch Project ID:** `3467580472824619901` (`BS_FINAL`)  
> **Design System Asset ID:** `assets/5b983aea382c4d5fbfdfe4f98f906e7e`  
> **Authoritative Runtime Source:** `frontend/src/index.css` (Tailwind v4 `@theme`)  
> **Reference Tokens:** `design-system/tokens.css`  
> **Last Synchronized:** 2026-09-18  

---

## 1. Ethos & Core Philosophy

Between Sessions is a digital health sanctuary built for specialized behavioral healthcare continuity (specifically OCD/ERP practice between therapy sessions). The visual identity balances **editorial gravitas** with **organic warmth**, replacing cold clinical intimidation with a serene, dignified, human atmosphere.

### 1.1 Core Tenets
1. **Notice → Allow → Choose → Respond Differently → Return to Life:**  
   The user should spend **less** time monitoring OCD and **more** time practicing an intentional response and returning to life. The product never turns into an endless symptom-checking or reassurance cockpit.
2. **Anti-Gamification:**  
   Strictly prohibit streaks, celebratory fire emojis, levels, badges, behavioral health scores, or confetti bursts. Progress is presented as objective, longitudinal observation (e.g., *"7 check-ins logged across 14 days; pre-exposure distress averaged 7.2, post-exposure settled to 4.1"*). Missing a day is not a failure.
3. **Secondary AI Posture:**  
   AI never impersonates a therapist, gives symptom diagnoses, offers medical closure, or prescribes individualized exposures. All summaries are quiet, metric-grounded annotations labeled:  
   *“Synthesized from your logs — not medical advice.”*
4. **The Bridge Motif:**  
   Visual element consisting of two distinct node dots connected by a subtle hairline connector line, symbolizing the connection between independent home practice and active clinician consultation.
5. **Safety Protocol Invariant:**  
   Tele-MANAS (14416 / 1800-891-4416) emergency resources must remain persistently accessible on every view.

---

## 2. Color Palette & Semantic Roles

| Token | Hex Value | Tailwind Class | Semantic Usage |
|---|---|---|---|
| **Canvas** | `#F7F8F7` | `bg-brand-canvas` | Primary base application background |
| **Card Surface** | `#FFFFFF` | `bg-white` / `bg-brand-paper` | Card, dialog, and panel backgrounds |
| **Surface Warm** | `#F0F5F4` | `bg-brand-sand` | Muted card contrast and subtle sections |
| **Ink** | `#17323A` | `text-brand-ink` | Structural headings, primary buttons, high contrast |
| **Text Secondary**| `#5B6570` | `text-brand-ink/70` | Secondary body text, descriptions |
| **Text Muted** | `#7A868F` | `text-brand-ink/50` | Timestamps, micro-captions |
| **Subtle Border** | `#D8DFDE` | `border-brand-border` | 1px hairline structural borders |
| **Primary Teal** | `#176B67` | `bg-brand-teal` / `text-brand-teal` | Active navigation, confirmed states, primary accents |
| **Teal Dark** | `#195E5A` | `bg-brand-tealDark` | Hover and active pressed button states |
| **Teal Soft** | `#DCEFED` | `bg-brand-primarySoft` | Light primary wash and highlight areas |
| **Teal Softer** | `#EDF7F6` | `bg-brand-softerTeal` | Active navigation pills, badge backgrounds |
| **Coral** | `#E8856C` | `text-brand-coral` | Distress indicators, urges, warning notes |
| **Coral Soft** | `#FFF0EC` | `bg-brand-coralSoft` | Urge pill containers, distress callouts |
| **Lavender** | `#8B7EC8` | `text-brand-lavender` | Values compass, AI insight icons, reflection |
| **Lavender Soft**| `#F0EDFB` | `bg-brand-lavenderSoft`| Insight containers, values badges |
| **Amber** | `#D4943A` | `text-brand-amber` | Mindful prompts, pending requests |
| **Amber Soft** | `#FFF6E8` | `bg-brand-amberSoft` | Notice banners, pending badges |
| **Clinical Success**| `#2E7D62`| `text-clinical-success` | Completed practice, consented categories |
| **Success Soft** | `#E8F3EE` | `bg-brand-softSuccess` | Granted consent containers |

---

## 3. Typography Hierarchy

| Role | Font Family | Tailwind Class | Usage Guidelines |
|---|---|---|---|
| **Editorial Headlines** | `Newsreader` | `font-editorial` / `font-serif` | Page hero titles, section headers, reflection questions, modal headings |
| **Body & Controls** | `Plus Jakarta Sans` | `font-sans` | All body paragraphs, labels, forms, buttons, table headers, tags |
| **Telemetry & Numbers** | `JetBrains Mono` | `font-mono` | Numeric SUDS 0–10, percentages, timestamps, clinical IDs only |

> **Rule:** `font-mono` must NEVER be used for UI labels, descriptive copy, or buttons. It is strictly for numeric tabular data and timestamps.

### Typographic Scale
* **Display Hero:** `Newsreader` 48–60px (mobile 36–40px), font weight 400, line-height 1.15.
* **Headline Large:** `Newsreader` 32–40px, font weight 400, leading-snug.
* **Headline Medium:** `Newsreader` 24–28px, font weight 400–500.
* **Section Label:** `Plus Jakarta Sans` 11–12px, uppercase tracking-widest, font weight 700, muted ink.
* **Body Standard:** `Plus Jakarta Sans` 14–15px, font weight 400–500, line-height 1.5.
* **Metrics Numeral:** `JetBrains Mono` 24–36px, font weight 500, `tabular-nums`.

---

## 4. Geometry, Radius & Shadows

### 4.1 Corner Radius
* **Cards & Containers:** `rounded-lg` / `rounded-xl` (8–12px).
* **Inputs & Textareas:** `rounded-lg` (8px).
* **Buttons:** `rounded-full` for pill CTAs, or `rounded-lg` for form-bound action buttons.
* **Chips & Status Badges:** `rounded-full` exclusively.

### 4.2 Shadows & Elevation
* **Card Lift:** `shadow-[0_12px_36px_-4px_rgba(23,50,58,0.07),0_4px_16px_-2px_rgba(23,50,58,0.04)]` — Soft, diffuse ambient lift without sharp black lines.
* **Pill Shadow:** `shadow-[0_10px_30px_-5px_rgba(23,107,103,0.08)]`.
* **Subtle Borders:** Always pair elevated cards with a 1px hairline border `border-[#D8DFDE]` or `border-brand-border/40`.

---

## 5. UI Component Conventions

### 5.1 Primary Button
```html
<button class="bg-[#176B67] hover:bg-[#195E5A] text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#176B67] focus:ring-offset-2">
  Begin Practice
</button>
```

### 5.2 Status Badges (Pills)
* **Active / Verified:** `bg-brand-softSuccess text-clinical-success px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`
* **Pending / Mindful:** `bg-brand-amberSoft text-brand-amber px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`
* **Urge / Distress:** `bg-brand-coralSoft text-brand-coral px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`
* **Insight / Values:** `bg-brand-lavenderSoft text-brand-lavender px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`

### 5.3 Form Inputs
* Background: `#F7F8F7` (`bg-brand-canvas`) or `#FFFFFF`.
* Border: `border border-brand-border`.
* Focus: `focus:border-brand-teal focus:ring-1 focus:ring-brand-teal focus:outline-none`.
* Corner: `rounded-lg` (8px).

### 5.4 Iconography
* **Style:** Clean, lightweight SVG strokes (stroke-width 1.75–2.0) or Google Material Symbols Rounded (`font-light`).
* **Container:** 32–40px rounded-full or rounded-xl soft pastel container matching category accent color (e.g. coralSoft for distress, lavenderSoft for values, softerTeal for home/sanctuary).

---

## 6. Motion & Animation Principles

* **Purposeful & Short:** State transitions use `200–300ms ease-out`.
* **Entry Animations:** `animate-fade-in` (400ms) and `animate-fade-up` (600ms) with gentle translateY (12–20px).
* **Pulse Indicators:** Subtle breathing rhythm `pulse-indicator` (2.5s) for live tele-MANAS active dot or status markers.
* **Reduced Motion:** Always respect `prefers-reduced-motion: reduce`. Never rely purely on animation to communicate health states.

---

## 7. Responsive Breakpoints

| Breakpoint | Width | Application Layout |
|---|---|---|
| **Mobile** | `< 768px` | Single column stacked, top mobile header with logo and Tele-MANAS, bottom/drawer navigation |
| **Tablet** | `768px – 1023px` | Collapsible sidebar, 2-column bento grids |
| **Desktop** | `≥ 1024px` | Fixed 260px sidebar, 12-column bento layouts, max container 1100–1200px |

---

## 8. Clinical Tone of Voice

* **Non-Evaluative:** Use observational framing (*"Logged 4 responses this week"*) rather than evaluative scoring (*"You scored 80% on compliance!"*).
* **Compassionate Demarcation:** Clearly distinguish between peer self-management and professional clinical consultation.
* **Granular Consent Transparency:** Every connection specifies the exact categories shared, with one-click revocation.
