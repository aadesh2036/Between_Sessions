# Between Sessions — Complete Features Guide: Individuals & Practitioners

> **Between Sessions** is an evidence-based between-session companion for Obsessive-Compulsive Disorder (OCD) and Exposure & Response Prevention (ERP).  
> It bridges the critical multi-day gap between therapy appointments with calibrated distress tracking, guided exposures, values-based living, and clinician decision support.

---

## Part 1: Features for Individuals (Patients)

### 1. Calibrated Check-ins & SUDS Tracking
* **Subjective Units of Distress Scale (SUDS):** Rate distress on a calibrated 0–10 scale.
* **Urge Intensity:** Rate compulsive urge intensity (0–10).
* **Obsessive Category:** Categorize triggers (e.g., Contamination, Symmetry/Order, Harm, Intrusive Taboo Thoughts, Relationship Doubt, Somatic).
* **Anti-Gamification:** No streaks, celebratory confetti, or "OCD severity scores". Progress is framed longitudinally.

### 2. Guided Exposure & Response Prevention (ERP)
* **Pre-Distress & Post-Distress Logging:** Capture SUDS immediately before beginning exposure and immediately upon concluding.
* **Expectancy Violation:** Track whether the feared catastrophe occurred versus whether the distress was tolerated.
* **Ritual Delay Scaffold:** Structured timer (1 min, 5 min, 15 min, 30 min) to build distress tolerance and delay compulsive neutralizing rituals when complete abstinence is initially overwhelming.
* **Clinician-Assigned & Self-Guided Practice Plans:** View agreed exposure exercises with explicit response prevention instructions.

### 3. Somatic & Cognitive Toolkit
* **Grounding Exercises (5-4-3-2-1):** Multi-sensory somatic stabilization for acute panic.
* **Paced Box Breathing:** Visual 4-4-4-4 rhythm to regulate physiological fight-or-flight arousal.
* **Pause & Choose:** Decision matrix encouraging values-congruent choices over compulsive relief.
* **Urge Surfing:** Mindfulness visualization for riding compulsive urges like ocean waves without acting.
* **Reassurance Redirection:** Structured prompt identifying reassurance-seeking as a safety trap and cultivating tolerance for uncertainty ("living with maybe").

### 4. Values & Life Outside OCD
* **Attentional Redirection:** Dedicated portal connecting exposures to meaningful life domains (Relationships, Creativity, Health, Knowledge, Career).
* **Committed Actions:** Log concrete behavioral actions taken in service of personal values despite obsessive background noise.

### 5. Curated Educational Sanctuary (Learn)
* **Evidence-Based Literature:** Curated chapters and masterclasses on Inhibitory Learning, Pure-O Mental Compulsions, and Somatic Regulation.
* **Reading Progress:** Track completion states across books and clinical chapters.

### 6. Granular Privacy & Cryptographic Consent
* **AWS Cedar Consent Controls:** Toggle data categories shared with your clinician in real time:
  - `checkins` (SUDS & urge scores)
  - `practice_logs` (ERP exercises)
  - `journal_structured` (Categorical responses)
  - `ai_summary` (Clinician decision-support synthesis)
* **Instant Revocation:** Revoking consent immediately denies practitioner and AI access through the AWS Cedar WASM engine.
* **Emergency Resources:** Persistent Tele-MANAS (14416 / 1800-891-4416) crisis links on every screen.

---

## Part 2: Features for Clinicians (Practitioners)

### 1. Verified Directory & Credential Integrity
* **Government/Board Certification Verification:** Synthetic MCI registration IDs (`MCI-YYYY-II-NNNN`) verified upon registration and login.
* **Public Discovery Listing:** Zero-auth public directory allowing prospective patients to find verified ERP practitioners by specialty, language, and remote availability.

### 2. Practitioner Command Dashboard
* **Active Patient Roster:** Real-time list of all connected individuals with consent statuses and connection timestamps.
* **Pending Connection Requests:** Review incoming connection requests from individuals with one-click Accept or Decline.
* **Profile Management:** Update clinic details, accepted insurance, credentials, and practice notes.

### 3. Cryptographically Governed Patient Continuity View
* **Cedar-Enforced Data Isolation:** Access to patient check-ins and practices is evaluated on-demand by AWS Cedar. If consent is revoked, access is refused with `403 CONSENT_REQUIRED`.
* **SUDS Trend Telemetry:** Visual bar chart of historical SUDS distress curves and urge ratings without third-party chart dependencies.
* **Patient Profile & Values:** View patient age band, contact email, and active "Life Outside OCD" values commitments to personalize session therapy.

### 4. AI Practice Overview (Decision Support)
* **Longitudinal Narrative Synthesis:** Synthesizes 30-day practice frequency, average SUDS, peak distress, and ritual delay compliance.
* **Evidence-Tagged Observations (`[FACT]`):** Every observation explicitly cites verifiable DynamoDB sort keys (`PRACTICE#...`, `CHECKIN#...`).
* **Behavioral Pattern Recognition (`[INFERENCE]`):** Surfaces potential distress decay patterns, avoidance maneuvers, or ritual delay milestones for clinical review.
* **Curated Literature Grounding (`[KNOWLEDGE]`):** Surfaces relevant peer-reviewed clinical literature (Craske et al. 2014, Abramowitz 2006, Salkovskis 1999) with full academic citations.
* **Session Inquiry Recommendations:** Clinician-oriented questions to prepare for the upcoming clinical hour (e.g., inquiring into covert mental rituals during unlogged intervals).
* **Clinical Boundary Disclaimer:** Explicitly disclaims medical diagnosis or treatment plan prescription; emphasizes practitioner clinical authority.

### 5. Human-Authored Clinical Recommendations
* **Professional Notes:** Author personalized between-session next steps, observation notes, and referrals.
* **Direct Patient Delivery:** Delivered securely to the patient's Care portal with human author attribution (`Dr. Kavita Mehra · MCI-2024-KM-7741`).
