# Between Sessions — Design System & Implementation Guide

> **Theme:** Organic Strategic Editorial
> **Last synchronized:** 2026-09-17

---

## 1. Overview & Aesthetic Ethos

**Aesthetic:** Elevated, humanistic enterprise behavioral health sanctuary. Combines editorial gravitas (Newsreader serif) with accessible humanistic clarity (Plus Jakarta Sans) and restrained clinical precision (JetBrains Mono for data only).

### Key Visual Rules

1. **No Clichés:** No generic AI rounded boxes, hyper-inflated cartoon pill containers, or sterile SaaS bento grids.
2. **Atmospheric Restraint:** Delicately layered cards on `--color-brand-canvas` (`#F7F8F7`), hairline 1px borders (`#D8DFDE`), and soft ambient whisper shadows.
3. **Anti-Gamification:** No dopamine loops, streaks, badges, behavioral health "scores", or celebratory confetti. Progress is objective and longitudinal.
4. **Iconography:** Lucide-style SVG icons at `1.75` stroke width nested in square, lightly rounded (4px–8px) soft pastel containers. Never use emojis in clinical UI.
5. **The Bridge Motif:** Ground layout architecture in "The Bridge"—two nodes connected by a subtle hairline stroke, linking independent patient practice to clinical consultation.
6. **Open Canvas Composition:** The hero and major sections sit directly on breathable canvas—no wrapping boxes or artificial card containers around already-elevated content.

---

## 2. Color Palette & Semantic Tokens

### Brand Core

| Token | Hex | CSS Variable | Tailwind | Usage |
|---|---|---|---|---|
| Primary / Teal | `#176B67` | `--color-brand-teal` | `brand-teal` | CTAs, active tabs, confirmed state |
| Primary Hover | `#195E5A` | `--color-brand-teal-dark` | `brand-tealDark` | Hover & pressed states |
| Primary Soft | `#DCEFED` | `--color-brand-primary-soft` | — | Light primary wash containers |
| Primary Softer | `#EDF7F6` | `--color-brand-softer-teal` | `brand-softerTeal` | Chip/badge backgrounds |
| Ink | `#17323A` | `--color-brand-ink` | `brand-ink` | Structural headings, high contrast |

### Surfaces

| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| Canvas | `#F7F8F7` | `brand-canvas` | Base page background |
| Paper | `#FFFFFF` | `brand-paper` | Card surfaces, modals |
| Sand | `#F7F4EC` | `brand-sand` | Warm secondary surface |
| Cream | `#FAF8F3` | `brand-cream` | Card 03 warm cream background |

### Borders

| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| Border Subtle | `#D8DFDE` | `brand-border` | 1px structural hairline borders |

### Accent Tonal Scale

| Token | Hex | Soft Container | Usage |
|---|---|---|---|
| Coral | `#E8856C` | `#FFF0EC` | Compulsion/urge, somatic indicators, distress |
| Lavender | `#8B7EC8` | `#F0EDFB` | De-escalation, meditation, audio |
| Amber | `#D4943A` | `#FFF6E8` | Mindful prompts, observations, warnings |

### Clinical Status (Calm, Non-Punitive)

| Token | Hex | Soft Container | Usage |
|---|---|---|---|
| Success | `#2E7D62` | `#E8F3EE` | Completed practice, logged exposure |
| Info | `#1E4D63` | `#E3F0F6` | Informational context |
| Danger | `#B54747` | `#FDF2F2` | Reserved — never for normal distress logging |

---

## 3. Typography Rules

### Font Stack

| Role | Font Family | Tailwind Class | Weight Range |
|---|---|---|---|
| Display / Editorial | `Newsreader` | `font-editorial` / `font-serif` | 300–700 (+ italics 300–600) |
| Body / UI | `Plus Jakarta Sans` | `font-sans` | 300–800 |
| Data / Telemetry | `JetBrains Mono` | `font-mono` | 400–600 |

### Usage Rules

- **`font-editorial` (Newsreader):** Hero titles, section statement headers, qualitative reflection intros, pull quotes. Always use `font-normal` weight for headlines.
- **`font-sans` (Plus Jakarta Sans):** All body copy, navigation labels, buttons, form fields, tag text, metric labels, and dense clinical tables. Use `font-bold` or `font-semibold` for emphasis.
- **`font-mono` (JetBrains Mono):** ONLY for SUDS ratings (`0–10`), timestamps, clinical IDs, layer numbers `(01)`, and telemetry metrics. **Never** for UI labels, headings, or descriptive text.

### Scale (Responsive)

| Element | Mobile | Tablet | Desktop |
|---|---|---|---|
| Hero `h1` | `text-3xl` | `text-5xl` | `text-6xl` |
| Section `h2` | `text-2xl` | `text-3xl` | `text-5xl` |
| Card Title `h3` | `text-2xl` | `text-3xl` | `text-[32px]` |
| Body | `text-xs` / `text-sm` | `text-sm` | `text-sm` |
| Meta/Tags | `text-[10px]` | `text-[10px]` | `text-[10px]` |
| Data Chips | `text-xs` | `text-xs` | `text-xs` |

---

## 4. Geometry & Shadows

### Corner Radii

| Element | Radius | Class |
|---|---|---|
| Cards & Inputs | 4px | `rounded` |
| Inner Dashboard Widgets | 8px | `rounded-lg` |
| Major Section Cards (3D stack) | 24px | `rounded-3xl` |
| Callout Banners | 32px | `rounded-[32px]` |
| Status Chips, Tags, Nav Pills | 9999px | `rounded-full` |

> **Rule:** Full pill (`rounded-full`) is reserved ONLY for chips, tags, toggles, nav pills, and confirmed markers. Never for regular cards or containers.

### Shadow Scale

| Token | CSS Value | Usage |
|---|---|---|
| `shadow-soft` | `0 8px 30px rgba(23, 50, 58, 0.06)` | Light ambient background lift |
| `shadow-card-lift` | `0 12px 36px -4px rgba(23, 50, 58, 0.07), 0 4px 16px -2px rgba(23, 50, 58, 0.04)` | Primary card elevation |
| `shadow-pill` | `0 10px 30px -5px rgba(23, 107, 103, 0.08)` | Floating pill nav |
| `shadow-dashboard` | `0 25px 60px -15px rgba(23, 50, 58, 0.12), 0 4px 20px rgba(23, 50, 58, 0.04)` | Heavy dashboard cards |

---

## 5. Components Quick Reference

### Buttons

| Variant | Background | Text | Border | Radius | Hover |
|---|---|---|---|---|---|
| Primary | `#176B67` | White | None | `rounded` | `#195E5A` |
| Secondary | Transparent | `#172126` | `1px solid #D8DFDE` | `rounded` | Border `#176B67`, bg `#F0F5F4` |
| Pill CTA | `#176B67` / `#17323A` | White | None | `rounded-full` | Contrast shift |
| Text Link | Transparent | `#176B67` | None | — | Underline expands |

### Cards & Panels

- Background: `#FFFFFF` on canvas `#F7F8F7`.
- Border: `1px solid #D8DFDE`.
- Radius: `rounded-lg` (8px) for inner widgets, `rounded-3xl` (24px) for 3D stack cards.
- Shadow: `shadow-card-lift`.

### Interactive Consent Toggles

- Track: `w-10 h-6 rounded-full`, active `bg-brand-teal`, inactive `bg-gray-300`.
- Knob: `w-5 h-5 rounded-full bg-white`, translates `translate-x-4` when active.
- Transition: `200ms ease-in-out`.

### Metric & Status Chips

- Pill rounding (`rounded-full`).
- `text-[10px] font-sans font-bold uppercase tracking-widest`.
- Soft pastel background + contrast accent text.

---

## 6. Animation & Motion Conventions

### Transition Timing

| Context | Duration | Easing |
|---|---|---|
| Hover/Focus | `200–400ms` | `ease-out` |
| Card Peel (3D stack) | `1.5s` | `cubic-bezier(0.19, 1, 0.22, 1)` |
| Opacity Fade | `1.2s` | `ease-out` |

### 3D Card Stack

- Stage: `perspective: 1600px`, `perspective-origin: 50% 50%`.
- Peel-up: `translateY(-80%) translateZ(-500px) rotateX(15deg)`, opacity → 0.
- Active: `translateY(0) translateZ(0) rotateX(0) scale(1)`, z-index 30.
- Next-1: `translateY(40px) translateZ(-100px) scale(0.95)`, opacity 0.9, z-index 20.
- Next-2: `translateY(80px) translateZ(-200px) scale(0.90)`, opacity 0.7, z-index 10.

### Mascot (Pip) — 10-Second Cycle

4 puzzle pieces scatter/lock. Head bobs (struggle → exhale → relief). Arms animate. Dual face states crossfade at 45–50%. Sweat drop appears during struggle. Sparkles radiate during breakthrough.

### Dashboard Micro-Animations

| Class | Duration | Purpose |
|---|---|---|
| `.pulse-indicator` | 2.5s | Subtle scale/opacity pulse for live status dots |
| `.anim-vagus-breathe` | 5s | Breathing orb expand/contract |
| `.anim-wave-surf` | 3s | Urge wave crest bob |
| `.anim-radar-ping` | 2.5s | Radar ping expand/fade for sync indicators |
| `.anim-spline-pulse` | 2s | SVG circle glow pulse at chart apex |

### Accessibility

- Respect `prefers-reduced-motion` — reduce or eliminate animations.
- Never communicate state solely through animation.
- Keyboard-accessible interactive elements (min 44px touch targets on mobile).

---

## 7. Responsive Architecture

### Breakpoint Strategy (Mobile-First)

| Breakpoint | Min Width | Layout |
|---|---|---|
| Base | `< 640px` | Single column, stacked cards, hamburger nav, `overflow-y-auto` on 3D cards |
| `sm:` | `≥ 640px` | Two-column grids begin, expanded nav buttons |
| `md:` | `≥ 768px` | Dual callout cards side-by-side, desktop nav links visible |
| `lg:` | `≥ 1024px` | Full 12-column dashboard grids, `overflow-hidden` on cards, desktop stepper |

### Mobile Navigation

- Floating pill navbar compacts on mobile with hamburger toggle.
- Slide-down frosted glass drawer with section links + Tele-MANAS quick-dial.
- All tap targets ≥ 44px height.

### 3D Card Stack Viewport Calibration

- Sticky top: `top-[68px]` (mobile) / `top-[84px]` (desktop).
- Stage height: `h-[560px] sm:h-[580px] lg:h-[600px]`.
- Cards use `overflow-y-auto custom-scrollbar` on mobile, `overflow-hidden` on `lg:`.

---

## 8. Workflow Strategy

- **Landing Page:** Finalized React component at `frontend/src/pages/LandingPage.jsx` with `StackedFeatureCards.jsx`. Do not regenerate.
- **App & Practitioner Pages:** Generate and refine using Stitch MCP with project `3467580472824619901` and the `Organic Strategic Editorial` design system.
- **Source of Truth:** The Tailwind v4 `@theme` block in `frontend/src/index.css` is the authoritative token source for the running application.

---

## 9. Clinical Safety Rules

- Tele-MANAS (14416 / 1800-891-4416) must be persistently accessible on every page.
- AI summaries must always display: *"Synthesized from your logs — not medical advice."*
- Never use aggressive red error states for normal distress logging.
- Never imply missing data means "stable."
- Use nature-inspired micro accents rather than clinical coldness.
