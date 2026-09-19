# Between Sessions — MVP

> [!NOTE]
> **HISTORICAL MVP SCOPE SPECIFICATION**
> This document captures the initial hackathon contract. The full, implemented MVP is complete with AI/RAG clinical synthesis and AWS SAM serverless deployment.
> See [README.md](../../README.md) for current capabilities and quick-start instructions.

> **Hackathon MVP contract:** build one complete, privacy-conscious continuity story:  
> **learn → log → practice → see progress → AI summarizes → user chooses what to share → verified practitioner reviews → practitioner gives a next step/referral.**
>
> Product principle: **software helps a person take the next useful step; qualified humans decide when clinical care is needed.**

## 1. MVP Scope

### Person / User

| Must exist | MVP behavior |
|---|---|
| Landing page | Explain the OCD/ERP continuity problem, product boundary, safety note, and two pathways: **For You** / **For Practitioners**. |
| Sign up / demo login | Cognito authentication plus a fast demo-user path for the 3-minute presentation. |
| Onboarding | Goal, language/accessibility preference, plain-language privacy notice, data-use choices, safety acknowledgement. |
| Education | Small, curated OCD + ERP education hub: OCD cycle, ERP basics, mental rituals, avoidance/reassurance, when to seek professional help, verified resources. |
| Personal dashboard | Today’s check-in, recent behavior, practice, progress, AI insight, sharing status. |
| Daily check-in | 1–10 subjective distress/urge rating with timestamp and optional short reflection. |
| Behavioral / compulsion log | Situation/trigger, urge, response type (compulsion / avoidance / reassurance / no response), outcome, optional reflection, configurable non-diagnostic tags. |
| ERP practice | **Tracker + educational companion**, using curated exercises; log pre/post distress and completion. No autonomous personalized exposure prescribing. |
| Progress dashboard | Weekly practice count, distress/urge before-vs-after practice, behavior frequency, adherence/missed practice, reflections. |
| AI weekly summary | Bedrock/Strands summary grounded only in logged metrics; every insight references source metrics; explicit “not a diagnosis / not medical advice” label. |
| Share-with-practitioner consent | Granular, revocable choices over what is shared; sharing must be enforced server-side. |
| Practitioner recommendation | User can discover/select a verified demo practitioner, send a request, and receive a professional next-step/referral note. |
| Safety resources | Persistent emergency/public-resource access, including Tele-MANAS; never presented as an emergency response service. |

### Practitioner

| Must exist | MVP behavior |
|---|---|
| Login | Cognito practitioner login / role boundary. |
| Verification status | Demo/manual verification workflow: pending → verified; registration reference and scope stored. |
| Patient request | View incoming user connection requests. |
| Consent view | See exactly which user data categories are authorized. |
| Patient behavioral summary | Review consented longitudinal metrics + AI summary, not hidden/private data. |
| Recommendation / referral | Add a human-authored next-step, discussion point, or referral recommendation. |

## 2. Hard Product Boundaries

The MVP **must not** diagnose, prescribe medication, autonomously assess suicide/self-harm risk, provide reassurance for repeated intrusive-thought questions, dynamically prescribe exposure hierarchies, or claim to replace a psychiatrist/psychologist/emergency service.

ERP content is **curated and structured**, not dynamically prescribed by AI. AI is a **summarization / navigation layer**, not a clinician.

## 3. Explicitly OUT

- Real video calling
- Payments
- Full doctor marketplace
- Social/community feed
- Emergency AI detection
- Medical diagnosis
- Medication recommendation
- Wearable / biometric integration
- Actual EHR interoperability
- Real-time encrypted messaging
- Government / population-health dashboard
- Native mobile apps
- Automated registry/API verification
- OpenSearch-backed search at scale

These belong in **Roadmap**, not MVP.

## 4. Demo-Critical Path

**0:00–0:20** Landing → problem + promise  
**0:20–0:50** User onboarding → privacy/consent  
**0:50–1:20** Add 2–3 behavioral logs → dashboard changes  
**1:20–1:45** Generate grounded AI weekly insight  
**1:45–2:20** Switch to verified practitioner → consented summary → recommendation  
**2:20–2:45** Show live AWS architecture / deployed URL  
**2:45–3:00** Impact + roadmap

## 5. MVP Definition of Done

A feature counts only when it works end-to-end against the deployed stack:

**React/Tailwind → Amplify → Cognito → API Gateway → Lambda → DynamoDB → Strands/Bedrock → back to UI**, with authorization/consent checks and CloudWatch visibility.

Primary success signal: **one reliable 3-minute story, not maximum feature count.**
