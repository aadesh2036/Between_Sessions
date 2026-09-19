# Between Sessions — Frontend PRD

> [!NOTE]
> **HISTORICAL SPECIFICATION / ARCHIVED PRD**
> This document is preserved for UX requirements provenance. The active, production frontend implementation is located in `frontend/` and follows the `Organic Strategic Editorial` design tokens in `frontend/src/index.css`.
> For active feature matrix and routing, see [FEATURES.md](../../FEATURES.md) and [README.md](../../README.md).

## 1. Frontend Goal

Build a calm, privacy-conscious React application that makes the **complete continuity story** obvious in one session:

**learn → log → practice → progress → AI insight → consent → professional review.**

The supplied visual reference establishes the product language: open canvas, soft cards, editorial typography, teal/coral/amber/lavender accents, a personal sanctuary, and a dense practitioner terminal. Preserve that direction, but remove visual claims that imply features excluded from the MVP. fileciteturn1file7L369-L422

### Stack

- React
- Tailwind CSS
- React Router
- Cognito via Amplify Auth
- API client for API Gateway
- No heavy UI framework unless necessary
- Responsive web only

---

## 2. Route Map

### Public

| Route | Page | Purpose |
|---|---|---|
| `/` | Landing | Problem, promise, boundaries, pathways |
| `/education` | Education hub | OCD/ERP basics + resources |
| `/education/:slug` | Education module | Individual learning module |
| `/login` | Auth | User/demo login |
| `/practitioner/login` | Practitioner auth | Practitioner login |

### User

| Route | Page | Purpose |
|---|---|---|
| `/onboarding` | Onboarding | Goal, language, privacy/safety acknowledgement |
| `/app` | Dashboard | Daily state + next useful actions |
| `/app/check-in` | Daily check-in | 1–10 distress/urge |
| `/app/log` | Behavior log | Trigger → response → outcome |
| `/app/practice` | ERP companion | Curated exercise + pre/post log |
| `/app/progress` | Progress | Trends + practice/adherence |
| `/app/insights` | AI weekly summary | Grounded pattern summary |
| `/app/share` | Consent center | Data-sharing controls |
| `/app/practitioners` | Practitioner discovery | Verified profiles |
| `/app/connections` | Connections | Requests + active relationship |
| `/app/resources` | Safety/resources | Tele-MANAS + verified support links |
| `/app/settings` | Settings | AI toggle, reminders, export/delete |

### Practitioner

| Route | Page | Purpose |
|---|---|---|
| `/practitioner/onboarding` | Verification | Role + registration reference + scope |
| `/practitioner` | Clinician dashboard | Requests + patient summaries |
| `/practitioner/requests` | Patient requests | Accept/decline |
| `/practitioner/patients/:userId` | Patient view | Consent-filtered timeline + AI summary |
| `/practitioner/patients/:userId/consent` | Consent details | Exact authorized categories |
| `/practitioner/patients/:userId/recommend` | Recommendation | Human next step/referral |
| `/practitioner/settings` | Settings | Profile + verification status |

---

## 3. Navigation Model

### User shell

```text
Dashboard
Check-in
Log
Practice
Progress
Insights
Share
Practitioners
Resources
Settings
```

Primary CTA on dashboard should always be one obvious **“next useful step”**.

### Practitioner shell

```text
Dashboard
Requests
Patients
Verification
Settings
```

Do **not** include “Secure Chat”, video, calendar, EHR, or telemetry navigation in the MVP shell even though those appear in the concept visual; they are roadmap capabilities.

---

## 4. Landing Page

The supplied design already has the strongest visual direction:

- Floating rounded navigation.
- Editorial headline style.
- “Tame the loops. Master the moments between sessions.”
- Dual pathway choice.
- Personal + practitioner visual previews.
- Soft-card / open-canvas composition. fileciteturn1file0L10-L31 fileciteturn1file1L69-L97

### Required sections

1. Hero
2. “How Between Sessions works”
3. User pathway
4. Practitioner pathway
5. Privacy / consent principles
6. Safety boundary
7. Roadmap
8. CTA

Do not claim:

- HIPAA/SOC-2 certification unless actually obtained.
- real EHR integration.
- real-time biomarkers.
- real-time messaging/video.
- autonomous clinical monitoring.

---

## 5. Onboarding

### Screen sequence

```text
Welcome
  ↓
What brings you here?
  ↓
Language/accessibility
  ↓
Privacy notice
  ↓
Data controls
  ↓
Safety acknowledgement
  ↓
Finish → /app
```

### Goal choices

```text
Learn about OCD
Track patterns
Practice structured exercises
Prepare for a professional visit
Find professional support
```

These mirror the concept document's entry flow. fileciteturn4file0L213-L222

### Important UX rule

Consent is not buried in a legal modal.

Show:

```text
What we collect
Why we collect it
What is optional
Who can see it
How you can revoke access
```

---

## 6. User Dashboard

The visual reference already defines the personal dashboard pattern: welcome state, streak/progress, active urge-surfing, tactile grounding, 10-point check-in, and prescribed/curated practice cards. fileciteturn3file0L24-L46 fileciteturn3file0L47-L108

### MVP layout

```text
Header
  ├── greeting
  ├── privacy state
  └── today's intention

Next useful step
  └── primary CTA

Today
  ├── Check-in
  ├── Recent behavior
  └── Practice

This week
  ├── Practice count
  ├── Distress trend
  └── Behavior trend

AI insight
  └── View weekly summary

Care connection
  └── Sharing status / practitioner
```

Avoid shame-based “streak broken” language. Track consistency without implying failure.

---

## 7. Daily Check-in

The supplied UI uses a 10-point SUDS-style continuum. Keep that interaction visually simple and non-stigmatizing. fileciteturn3file0L109-L178

### Input

```text
rating: 1–10
timestamp
optional reflection
```

### UX

- One-screen interaction.
- Keyboard accessible.
- No emoji dependency.
- Clear selected state.
- Save immediately.
- Optimistic UI only after client validation; final state comes from API.

---

## 8. Behavioral / Compulsion Log

### Form

```text
What was happening?
        ↓
Urge / distress: 1–10
        ↓
What did you do?
  • compulsion
  • avoidance
  • reassurance seeking
  • no response
        ↓
What happened afterward?
        ↓
Optional reflection
        ↓
Context tags
```

The concept specifically calls for user-controlled situation/trigger text, urge/distress, response type, outcome, optional reflection, and configurable non-diagnostic tags. fileciteturn4file0L250-L257

Keep the form structured so AI summaries can be auditable.

---

## 9. ERP Companion

This is **not an AI therapist**.

### MVP screen

```text
Practice library
  ├── curated exercise card
  ├── learning objective
  ├── preparation
  ├── timer / completion
  └── pre/post distress
```

Example visual direction from the supplied concept:

- 90-second urge-surfing interaction
- response delay
- short audio/reading exercise
- gentle milestone feedback. fileciteturn3file0L51-L90

### Critical boundary

The frontend must never label an AI-generated exercise as “prescribed for you.”

Use:

> “Structured practice”

or

> “Curated exercise”

until a verified professional has explicitly assigned/approved a future exercise.

---

## 10. Progress Dashboard

### Cards

```text
Practice this week
Average pre/post distress
Behavior events
Avoidance / compulsion frequency
Adherence
Reflection count
```

### Charts

Keep charts simple:

- 7-day line for distress/urge
- practice count bars
- response-type distribution
- before/after practice comparison

Do not turn charts into diagnostic “severity” labels.

The concept's progress definition explicitly includes weekly practice count, distress before/after practice, compulsion/avoidance frequency, adherence, reflections, and AI summary. fileciteturn4file0L264-L270

---

## 11. AI Insights

### Page

```text
Weekly pattern summary

What you logged
───────────────
...

What changed
────────────
...

Worth noticing
──────────────
...

Metrics used
────────────
[metric chips]

Not a diagnosis / not medical advice
```

### Trust UI

Every AI statement should expose:

```text
Based on:
• 4 avoidance logs
• 3 practice sessions
• average pre-distress 7.0
• average post-distress 4.3
```

This directly follows the concept's requirement that insights be traceable to user-provided metrics. fileciteturn3file1L341-L353

### Never render

- diagnosis
- medication recommendation
- “you are safe”
- autonomous crisis score
- causal claims
- individualized treatment plan

---

## 12. Consent Center

This is a **first-class page**, not a checkbox.

### Card

```text
Practitioner sharing
[ ON / OFF ]

Shared:
☑ Check-ins
☑ Practice logs
☐ Free-text reflections
☑ AI weekly summary

Recipient:
Dr. Demo Practitioner

[ Revoke access ]
```

### Rules

- Show current state from backend.
- Never infer consent from a connection alone.
- Revocation changes backend authorization immediately.
- UI should explain the effect before confirmation.

The concept explicitly requires the user to choose which data categories the professional may view and to be able to revoke access later. fileciteturn4file0L271-L285

---

## 13. Practitioner Discovery

### MVP cards

```text
Name
Role
Verified badge
Registration reference
Specialties
Languages
Remote availability
[ Request review ]
```

For the hackathon, populate with a clearly marked **synthetic/demo verified practitioner**.

Do not present fabricated real clinicians as real people.

---

## 14. Practitioner Dashboard

The supplied clinician concept uses a high-density “terminal” visual with navigation, cohort summary, patient list, detailed patient view, and timeline. Keep the visual density, but reduce the MVP information architecture to consented behavioral continuity. fileciteturn3file1L320-L375

### MVP dashboard

```text
Top bar
  ├── practitioner name
  ├── verification badge
  └── notifications

Requests
  └── pending patient requests

Patients
  └── active connected users

Selected patient
  ├── consent summary
  ├── behavioral timeline
  ├── practice trend
  ├── AI weekly summary
  └── recommendation CTA
```

Do not show hidden raw journal content unless explicitly consented.

---

## 15. Patient View

### Header

```text
Demo User
Connection: Active
Consent: 4 categories shared
Last updated: …
```

### Tabs

```text
Overview
Behavior
Practice
AI Summary
Consent
```

### Empty/stale states

Always show:

> “No consented data available.”

or

> “Information may be incomplete.”

Never imply missing data means “stable.”

---

## 16. Recommendation / Referral

Practitioner writes:

```text
Observation / discussion point
Next useful step
Referral / escalation option
Optional note to user
```

The recommendation is clearly marked:

> **Professional note — human authored**

No AI-generated recommendation should appear as a clinician decision.

---

## 17. Safety UX

Persistent but non-alarming:

```text
Need urgent help?
Between Sessions is not an emergency response service.
Use local emergency services or verified public support.

Tele-MANAS
14416 / 1800-89-14416
```

The concept specifically calls for persistent verified emergency/public resources and clear non-emergency language. fileciteturn4file0L442-L449

---

## 18. State Management

Keep it simple.

### Server state

Use a lightweight query/cache layer for:

```text
profile
dashboard
checkins
journal
practice
progress
insights
consents
connections
practitioner data
```

### Local state

Only for:

- form drafts
- timer state
- UI animation
- modal visibility

Never store sensitive records in localStorage unless there is a deliberate encrypted/storage design.

---

## 19. API Client Rules

All protected calls:

```text
Cognito access token
      ↓
Authorization header
      ↓
API Gateway
      ↓
Lambda
```

Frontend may hide buttons based on role, but **backend authorization is authoritative**.

Standard client handling:

```text
401 → refresh/login
403 → explain missing permission/consent
404 → not found
409 → stale state/conflict
429 → retry/backoff UI
5xx → friendly retry state
AI unavailable → preserve dashboard and show retry
```

---

## 20. Accessibility

Minimum:

- keyboard navigation
- visible focus states
- semantic buttons/links
- labels for every form field
- sufficient contrast
- reduced-motion support
- charts with text equivalents
- never communicate meaning by color alone

The calming visual language should remain usable rather than decorative.

---

## 21. Visual System

Use the supplied reference direction:

```text
Ink:        #17323A
Teal:       #176B67
Coral:      #E8856C
Lavender:   #8B7EC8
Amber:      #D4943A
Sand:       #F7F4EC
Cream:      #FAF8F3
Canvas:     #F7F8F7
```

Typography:

```text
Display/editorial: Newsreader
UI/body: Plus Jakarta Sans
Metadata/technical: JetBrains Mono
```

These are already present in the supplied design system. fileciteturn1file2L112-L142

Interaction language:

- soft 200–400ms transitions
- subtle lift/scale
- no gamified punishment
- no aggressive red error states for normal distress logging
- respect `prefers-reduced-motion`
- use nature-inspired micro accents rather than clinical coldness

---

## 22. Demo Data / Demo Mode

For the hackathon, create a deterministic demo:

### User

```text
Alex / Demo User
7 days of structured records
3 practice sessions
1 weekly AI summary
1 practitioner connection
```

### Practitioner

```text
Dr. Demo
Role: Clinical Psychologist / ERP-capable
Status: Verified (Demo)
```

Add a visible but subtle:

> Synthetic demo profile

Never imply the demo practitioner is a real verified clinician.

---

## 23. Frontend Definition of Done

The frontend is complete when a judge can:

1. land on `/`;
2. sign in as demo user;
3. complete onboarding/privacy choices;
4. submit a check-in;
5. add behavior logs;
6. complete a structured practice;
7. see progress update;
8. generate a grounded AI summary;
9. choose data to share;
10. switch to practitioner demo;
11. see only consented data;
12. submit a human recommendation.

That is the product story. Everything else is secondary.
