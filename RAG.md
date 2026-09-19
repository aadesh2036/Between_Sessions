# Between Sessions — Clinical Retrieval-Augmented Generation (RAG) Engine

> **Document Type:** Clinical Knowledge Architecture & Retrieval Specification  
> **Source Code:** `backend/between-sessions-backend/src/clinicalKnowledge.js`  
> **Pipeline Orchestrator:** `backend/between-sessions-backend/src/ragPipeline.js`

---

## 1. Why Hybrid RAG (Structured Data + Curated Literature)?

Many AI applications make the critical mistake of vectorizing raw numerical database records (such as timestamps, SUDS scores, and boolean flags). In behavioral health, this introduces **vector hallucination**: the embedding model struggles with numerical precision, math calculations, and strict time windows.

Between Sessions employs a **strictly decoupled Hybrid Architecture**:

| Data Type | Storage & Access | Purpose |
|---|---|---|
| **Patient Telemetry** (Check-ins, SUDS, Urge ratings, Practices, Journal logs) | **Amazon DynamoDB** (Single-Table Range Queries) | Guaranteed mathematical accuracy, deterministic aggregation (average SUDS, peak distress, counts), tamper-proof audit trails. |
| **Clinical Literature** (Inhibitory learning, Response prevention, Reassurance traps, ACT defusion) | **Curated Knowledge Base** (Semantic & Keyword Weighted Retrieval) | Clinical grounding, peer-reviewed citations, session preparation framing for licensed clinicians. |

---

## 2. Curated Clinical Knowledge Base Corpus

The curated corpus contains authorized excerpts from foundational literature in OCD and Exposure and Response Prevention:

### Chunk 1: Inhibitory Learning Approach (`ERP-INH-LEARN-01`)
* **Category:** `erp_principles`
* **Title:** Inhibitory Learning Approach to Exposure and Response Prevention
* **Source:** Craske et al. (2014), *Maximizing Exposure Therapy: An Inhibitory Learning Approach*
* **Citation:** Craske, M. G., et al. (2014). Behaviour Research and Therapy, 58, 10-23.
* **Core Teaching:** Modern ERP emphasizes inhibitory learning over habituation. The goal is expectancy violation (tolerating distress without rituals), not bringing distress to zero.

### Chunk 2: Response Prevention and Ritual Traps (`ERP-RESP-PREV-02`)
* **Category:** `response_prevention`
* **Title:** Response Prevention and Ritual Neutralization Traps
* **Source:** Abramowitz, J. S. (2006), *Understanding and Treating Obsessive-Compulsive Disorder*
* **Citation:** Abramowitz, J. S. (2006). Understanding and Treating OCD. Guilford Press.
* **Core Teaching:** Exposure without response prevention is countertherapeutic. Ritual delay provides a structured transition toward complete abstinence.

### Chunk 3: Reassurance as a Compulsive Maneuver (`OCD-REASSURE-03`)
* **Category:** `reassurance_traps`
* **Title:** The Reassurance Cycle as a Compulsive Safety Maneuver
* **Source:** Salkovskis, P. M. (1999), *Understanding and Treating Obsessive-Compulsive Disorder*
* **Citation:** Salkovskis, P. M. (1999). Behavioural and Cognitive Psychotherapy, 27(4), 337-352.
* **Core Teaching:** Reassurance seeking functions identically to physical checking, offering short-term relief while escalating long-term doubt. Care focuses on "living with maybe".

### Chunk 4: SUDS Curve Calibration (`SUDS-CALIB-04`)
* **Category:** `suds_calibration`
* **Title:** SUDS Tracking and Longitudinal Distress Curve Analysis
* **Source:** Wolpe, J. (1969), *The Practice of Behavior Therapy*
* **Citation:** Wolpe, J. (1969). The Practice of Behavior Therapy. Pergamon Press.
* **Core Teaching:** SUDS is a qualitative self-rating tool (0-10), not a biomarker. A non-zero post-distress score with completed response prevention indicates successful endurance.

### Chunk 5: Cognitive Defusion & Values-Based Living (`ACT-DEFUSION-05`)
* **Category:** `act_defusion_values`
* **Title:** Cognitive Defusion and Values-Based Committed Action
* **Source:** Hayes, S. C., Strosahl, K. D., & Wilson, K. G. (2011), *Acceptance and Commitment Therapy*
* **Citation:** Hayes, S. C., et al. (2011). Acceptance and Commitment Therapy (2nd ed.). Guilford Press.
* **Core Teaching:** Thoughts are transient mental events, not moral commands. Behavioral activation redirects energy toward life goals outside OCD.

### Chunk 6: Grounding vs. Covert Avoidance (`GROUND-VS-ERP-06`)
* **Category:** `grounding_vs_erp`
* **Title:** Distinguishing Somatic Grounding from Covert Avoidance
* **Source:** Twohig, M. P., et al. (2015), *Acceptance and Commitment Therapy as a Treatment for OCD*
* **Citation:** Twohig, M. P., et al. (2015). Journal of Consulting and Clinical Psychology, 83(2), 241.
* **Core Teaching:** Somatic grounding is for de-escalating panic. If deployed specifically to escape exposure distress, it inadvertently becomes a safety behavior.

### Chunk 7: Egodystonic Obsessions & Appraisal (`OCD-CYCLE-07`)
* **Category:** `ocd_fundamentals`
* **Title:** Egodystonic Nature of Intrusions and Threat Appraisal
* **Source:** Rachman, S. (1997), *A Cognitive Theory of Obsessions*
* **Citation:** Rachman, S. (1997). Behaviour Research and Therapy, 35(9), 793-802.
* **Core Teaching:** Intrusions are universal; OCD distress stems from catastrophic appraisals. Thoughts are egodystonic and do not reflect intent or moral character.

---

## 3. Retrieval Algorithm & Scoring Mechanics

The retrieval engine (`retrieveRelevantKnowledge`) computes relevance scores based on patient observation tokens and category intent:

1. **Tag Match (Weight: 3.0):** Direct overlap with curated clinical taxonomy tags (`inhibitory_learning`, `reassurance`, `suds`, `defusion`).
2. **Category Boost (Weight: 2.5):** Boosts chunks matching high-priority patient presentations (e.g. elevated baseline distress boosts `erp_principles` and `suds_calibration`).
3. **Text & Title Overlap (Weight: 1.0):** Token match across chunk titles and explanatory passages.
4. **Ranking & Bounding:** Sorts descending by score, filters zero-score noise, and returns top $k=3$ chunks. If queries are sparse, returns foundational ERP principles as a baseline.

---

## 4. Verification & Validation

The RAG engine is continuously verified via `node test_ai_rag.js`:
- **Query 1:** `"reassurance checking ritual doubt"` $\rightarrow$ Matches `OCD-REASSURE-03` with score $\ge 8.0$.
- **Query 2:** `"inhibitory learning expectancy violation"` $\rightarrow$ Matches `ERP-INH-LEARN-01` with score $\ge 12.0$.
- **Query 3:** `"distress SUDS curve pre post exposure"` $\rightarrow$ Matches `SUDS-CALIB-04` with score $\ge 16.0$.
