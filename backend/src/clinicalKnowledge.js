/**
 * Clinical Knowledge Base & Retrieval Engine for Between Sessions
 * 
 * Provides curated, evidence-based reference material grounded in established
 * OCD and ERP clinical literature (Inhibitory Learning, Response Prevention,
 * SUDS Calibration, ACT Defusion, Reassurance Traps).
 * 
 * Used strictly for clinician decision-support grounding in RAG queries.
 * Every chunk contains full attribution, citation, and category metadata.
 */

const CLINICAL_KNOWLEDGE_BASE = [
  {
    documentId: 'DOC-ERP-001',
    chunkId: 'ERP-INH-LEARN-01',
    category: 'erp_principles',
    title: 'Inhibitory Learning Approach to Exposure and Response Prevention',
    source: 'Craske et al. (2014), Maximizing Exposure Therapy: An Inhibitory Learning Approach',
    version: '1.0',
    tags: ['inhibitory_learning', 'expectancy_violation', 'habituation', 'extinction', 'fear_tolerance'],
    citation: 'Craske, M. G., et al. (2014). Behaviour Research and Therapy, 58, 10-23.',
    text: 'Modern ERP emphasizes inhibitory learning over simple habituation. Rather than requiring distress (SUDS) to decline to zero during an exposure, the clinical objective is expectancy violation: demonstrating that the feared catastrophe did not occur or that the patient can tolerate profound distress without engaging in compulsive safety behaviors. A persistent non-zero post-distress score does not indicate exposure failure if expectancy was violated and response prevention was maintained.',
  },
  {
    documentId: 'DOC-ERP-002',
    chunkId: 'ERP-RESP-PREV-02',
    category: 'response_prevention',
    title: 'Response Prevention and Ritual Neutralization Traps',
    source: 'Abramowitz, J. S. (2006), Understanding and Treating Obsessive-Compulsive Disorder',
    version: '1.0',
    tags: ['response_prevention', 'compulsions', 'neutralization', 'ritual_delay', 'mental_rituals'],
    citation: 'Abramowitz, J. S. (2006). Understanding and Treating OCD. Guilford Press.',
    text: 'Response prevention is the indispensable core of ERP. Exposure without response prevention is ineffective or countertherapeutic. Compulsions include both overt physical rituals (washing, checking) and covert mental rituals (replaying events, mental undoing, neutralizing phrases). Gradual ritual delay (e.g., waiting 10-15 minutes before performing a ritual) provides a structured transitional scaffold toward complete abstinence when immediate elimination causes overwhelming panic.',
  },
  {
    documentId: 'DOC-OCD-003',
    chunkId: 'OCD-REASSURE-03',
    category: 'reassurance_traps',
    title: 'The Reassurance Cycle as a Compulsive Safety Maneuver',
    source: 'Salkovskis, P. M. (1999), Understanding and Treating Obsessive-Compulsive Disorder',
    version: '1.0',
    tags: ['reassurance', 'safety_behaviors', 'uncertainty', 'intrusive_thoughts', 'checking'],
    citation: 'Salkovskis, P. M. (1999). Behavioural and Cognitive Psychotherapy, 27(4), 337-352.',
    text: 'Reassurance seeking (from clinicians, family, digital tools, or self-checking) operates identically to physical checking compulsions. It delivers brief, transient relief while reinforcing the catastrophic premise that uncertainty is intolerable. Effective clinical care requires identifying reassurance seeking as an avoidance behavior and gradually cultivating tolerance for doubt and ambiguity ("living with maybe").',
  },
  {
    documentId: 'DOC-SUDS-004',
    chunkId: 'SUDS-CALIB-04',
    category: 'suds_calibration',
    title: 'SUDS Tracking and Longitudinal Distress Curve Analysis',
    source: 'Wolpe, J. (1969), The Practice of Behavior Therapy',
    version: '1.0',
    tags: ['suds', 'distress_metrics', 'pre_post', 'spontaneous_decay', 'subjective_rating'],
    citation: 'Wolpe, J. (1969). The Practice of Behavior Therapy. Pergamon Press.',
    text: 'The Subjective Units of Distress Scale (SUDS, 0-10) is a qualitative self-rating tool, not a biomarker or clinical diagnosis. In between-session practice, clinicians track delta-SUDS (pre-distress minus post-distress). Peak distress during exposure is clinically normative. A flat or rising SUDS curve combined with completed response prevention indicates successful distress endurance, not treatment failure.',
  },
  {
    documentId: 'DOC-ACT-005',
    chunkId: 'ACT-DEFUSION-05',
    category: 'act_defusion_values',
    title: 'Cognitive Defusion and Values-Based Committed Action',
    source: 'Hayes, S. C., Strosahl, K. D., & Wilson, K. G. (2011), Acceptance and Commitment Therapy',
    version: '1.0',
    tags: ['defusion', 'values', 'life_outside_ocd', 'acceptance', 'mindfulness'],
    citation: 'Hayes, S. C., et al. (2011). Acceptance and Commitment Therapy (2nd ed.). Guilford Press.',
    text: 'Cognitive defusion encourages patients to observe thoughts as transient verbal events rather than objective truths or commands. Defusion combined with values-based behavioral activation ("Life Outside OCD") redirects patient attentional and temporal resources away from obsessive vigilance and toward meaningful relationships, creative pursuits, and occupational goals regardless of background obsessive noise.',
  },
  {
    documentId: 'DOC-GROUND-006',
    chunkId: 'GROUND-VS-ERP-06',
    category: 'grounding_vs_erp',
    title: 'Distinguishing Somatic Grounding from Covert Avoidance',
    source: 'Twohig, M. P., et al. (2015), Acceptance and Commitment Therapy as a Treatment for OCD',
    version: '1.0',
    tags: ['grounding', 'avoidance', 'breathing', 'somatic', 'safety_behavior'],
    citation: 'Twohig, M. P., et al. (2015). Journal of Consulting and Clinical Psychology, 83(2), 241.',
    text: 'Somatic grounding and paced breathing are clinical stabilization tools intended for de-escalating physiological panic when distress exceeds functional thresholds. However, if a patient deploys grounding exercises immediately upon encountering an OCD trigger specifically to escape or abort the exposure distress, grounding inadvertently becomes a safety behavior. Clinicians should examine the functional intent behind grounding usage.',
  },
  {
    documentId: 'DOC-OCD-007',
    chunkId: 'OCD-CYCLE-07',
    category: 'ocd_fundamentals',
    title: 'Egodystonic Nature of Intrusions and Threat Appraisal',
    source: 'Rachman, S. (1997), A Cognitive Theory of Obsessions',
    version: '1.0',
    tags: ['egodystonic', 'intrusions', 'appraisal', 'obsessions', 'doubt'],
    citation: 'Rachman, S. (1997). Behaviour Research and Therapy, 35(9), 793-802.',
    text: 'Intrusive thoughts occur universally across the general population. In OCD, clinical distress arises not from the presence of the thought itself, but from the catastrophic appraisal and over-importance attributed to it (e.g., "having this thought means I secretly want to act on it"). The thoughts are egodystonic—repugnant and antithetical to the individuals core morals and desires. Education must reinforce that thought content does not equate to intent or moral character.',
  }
];

/**
 * Tokenize a query string into normalized lowercase terms
 */
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}

/**
 * Retrieve relevant clinical knowledge chunks based on query text and context
 * 
 * @param {string} query - Free text or joined keywords representing patient observations
 * @param {Object} [options]
 * @param {number} [options.limit=3] - Maximum number of chunks to return
 * @param {string[]} [options.preferredCategories] - Categories to boost
 * @returns {Array<Object>} Sorted list of matched knowledge chunks with relevance scores
 */
function retrieveRelevantKnowledge(query, options = {}) {
  const limit = options.limit || 3;
  const preferredCategories = new Set(options.preferredCategories || []);
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0) {
    // Return baseline ERP fundamentals if no query tokens
    return CLINICAL_KNOWLEDGE_BASE.slice(0, limit).map(chunk => ({
      ...chunk,
      score: 1.0,
      matchReason: 'baseline_erp_context',
    }));
  }

  const scored = CLINICAL_KNOWLEDGE_BASE.map(chunk => {
    let score = 0;
    const matchedTerms = [];

    // Tag matching (highest weight)
    for (const tag of chunk.tags) {
      for (const token of queryTokens) {
        if (tag.includes(token) || token.includes(tag)) {
          score += 3.0;
          matchedTerms.push(token);
        }
      }
    }

    // Category matching
    if (preferredCategories.has(chunk.category)) {
      score += 2.5;
    }

    // Text & Title token overlap
    const chunkTokens = tokenize(`${chunk.title} ${chunk.text}`);
    for (const token of queryTokens) {
      if (chunkTokens.includes(token)) {
        score += 1.0;
        if (!matchedTerms.includes(token)) matchedTerms.push(token);
      }
    }

    return {
      documentId: chunk.documentId,
      chunkId: chunk.chunkId,
      category: chunk.category,
      title: chunk.title,
      source: chunk.source,
      citation: chunk.citation,
      text: chunk.text,
      tags: chunk.tags,
      score: Math.round(score * 100) / 100,
      matchedTerms: [...new Set(matchedTerms)],
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Return top k results, ensuring minimum score threshold or fallback
  const topResults = scored.filter(s => s.score > 0).slice(0, limit);

  if (topResults.length === 0) {
    return CLINICAL_KNOWLEDGE_BASE.slice(0, limit).map(c => ({
      ...c,
      score: 0.5,
      matchReason: 'fallback_core_principles',
    }));
  }

  return topResults;
}

/**
 * Retrieve a specific knowledge chunk by its unique chunkId
 */
function getKnowledgeById(chunkId) {
  return CLINICAL_KNOWLEDGE_BASE.find(c => c.chunkId === chunkId) || null;
}

module.exports = {
  CLINICAL_KNOWLEDGE_BASE,
  retrieveRelevantKnowledge,
  getKnowledgeById,
};
