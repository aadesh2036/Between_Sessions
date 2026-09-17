---
name: between-sessions-design
description: >-
  Use this skill whenever designing, styling, building, or reviewing UI components, templates, or layouts for Between Sessions to ensure compliance with the Organic Strategic Editorial design system and clinical safety principles.
---

# Between Sessions Design System Skill

This skill enforces the visual identity, tokens, component conventions, and behavioral health UX guidelines for the **Between Sessions** platform.

## 1. Design Ethos & Philosophy

Between Sessions is a digital health sanctuary built for specialized behavioral healthcare continuity (specifically OCD/ERP practice between therapy sessions). 

### Core Tenets
1. **Editorial Gravitas + Organic Warmth:** 
   - Uses `Newsreader` serif for expressive titles and human reflection intros.
   - Uses `Plus Jakarta Sans` for clarity in dense behavioral logs and clinical review terminals.
2. **Anti-Gamification:**
   - Strict prohibition against streaks, celebratory fire emojis, levels, badges, behavioral health "scores", or confetti bursts.
   - Progress is presented as objective, longitudinal observation (e.g., "7 practices logged across 14 days; pre-exposure distress averaged 7.2, post-exposure settled to 4.1").
3. **Secondary AI Posture:**
   - System prompts and AI insights must never impersonate therapists or offer automated diagnostic closure.
   - AI summaries must be quietly annotated under user data with an explicit label: *"Synthesized from your logs — not medical advice."*
4. **The Bridge Motif:**
   - Visual element consisting of two distinct node dots connected by a subtle hairline connector line, symbolizing the connection between independent between-session moments and active clinician consultation.

---

## 2. Token Quick Reference

### Colors
- **Canvas Base:** `#F7F8F7`
- **Surface Cards:** `#FFFFFF`
- **Primary Teal:** `#176B67` (Hover/Active: `#195E5A`)
- **Primary Soft Tint:** `#DCEFED`
- **Brand Ink:** `#17323A`
- **Subtle Hairline Border:** `#D8DFDE`
- **Accent Soft Pastels:**
  - Coral Soft: `#FFF0EC` (Foreground Coral: `#E8856C`)
  - Lavender Soft: `#F0EDFB` (Foreground Lavender: `#8B7EC8`)
  - Amber Soft: `#FFF6E8` (Foreground Amber: `#D4943A`)
  - Success Soft: `#E8F3EE` (Foreground Green: `#2E7D62`)

### Typography
- Display / Headers: `'Newsreader', Georgia, serif`
- Body / Forms / UI: `'Plus Jakarta Sans', sans-serif`
- Metrics / Tabular: `'JetBrains Mono', monospace` (`tabular-nums`)

---

## 3. Component Construction Patterns

### Editorial Cards
```html
<div class="bg-white border border-[#D8DFDE] rounded-md p-6 shadow-[0_12px_36px_-4px_rgba(23,50,58,0.07)]">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-8 h-8 rounded-md bg-[#FFF0EC] flex items-center justify-center text-[#E8856C]">
      <!-- Lucide-style SVG icon (stroke-width 1.75) -->
    </div>
    <h3 class="font-editorial text-xl text-[#17323A] font-medium">Card Title</h3>
  </div>
  <p class="text-sm text-[#5B6570] leading-relaxed">Reflective body content...</p>
</div>
```

### Primary Action Button
```html
<button class="bg-[#176B67] hover:bg-[#195E5A] text-white font-medium text-sm px-5 py-2.5 rounded transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#176B67] focus:ring-offset-2">
  Begin Guided Practice
</button>
```

### The Bridge Motif Component
```html
<div class="flex items-start gap-4">
  <div class="flex flex-col items-center">
    <div class="w-3 h-3 rounded-full bg-[#176B67]"></div>
    <div class="w-0.5 h-12 bg-[#D8DFDE]"></div>
    <div class="w-3 h-3 rounded-full bg-[#17323A]"></div>
  </div>
  <div class="space-y-4">
    <div>
      <p class="text-xs font-semibold text-[#176B67] uppercase tracking-wider">Between Sessions</p>
      <p class="text-sm font-medium text-[#17323A]">Home Exposure Practice</p>
    </div>
    <div>
      <p class="text-xs font-semibold text-[#5B6570] uppercase tracking-wider">Next Consultation</p>
      <p class="text-sm font-medium text-[#17323A]">Clinician Review & Refinement</p>
    </div>
  </div>
</div>
```

---

## 4. Safety & Boundary Checklist
Before finalizing any UI screen:
- [ ] Emergency resources / Tele-MANAS persistent link is readily available.
- [ ] Explicit disclaimer present: "Between Sessions is a practice and continuity tool, not an emergency medical service."
- [ ] Granular consent controls are visible on sharing views.
- [ ] No gamification tropes (streaks, points, level-ups).
