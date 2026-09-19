/**
 * Learning Handler — Between Sessions (Curated Educational Sanctuary)
 *
 * GET  /api/v1/learn/modules   — Curated books, chapters, masterclasses & resources
 * GET  /api/v1/learn/progress  — User's reading/exploration history
 * POST /api/v1/learn/progress  — Mark a chapter/lesson as completed
 */

const jwt = require('jsonwebtoken');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} = require('@aws-sdk/lib-dynamodb');

const JWT_SECRET = process.env.JWT_SECRET || 'between-sessions-secret-key-2026';
const TABLE_NAME = process.env.TABLE_NAME || 'BetweenSessionsTable';

const ddbEndpoint = process.env.DYNAMODB_ENDPOINT;
const ddbClient = new DynamoDBClient(
  ddbEndpoint
    ? { endpoint: ddbEndpoint, region: 'local', credentials: { accessKeyId: 'dummy', secretAccessKey: 'dummy' } }
    : {}
);
const docClient = DynamoDBDocumentClient.from(ddbClient);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

function requireAuth(event) {
  const authHeader =
    event.headers?.authorization || event.headers?.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) throw { statusCode: 401, code: 'UNAUTHORIZED', message: 'Missing bearer token.' };
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw { statusCode: 401, code: 'UNAUTHORIZED', message: 'Invalid or expired token.' };
  }
}

const BOOKS = [
  {
    id: 'book-1',
    title: 'Understanding OCD',
    subtitle: 'From Intrusive Doubts to the Behavioral Trap',
    color: 'brand-softerTeal',
    badge: 'Book I',
    estimatedMinutes: 25,
    chapters: [
      {
        id: 'b1-c1',
        title: 'Beyond the Stereotype: What OCD Actually Is',
        summary: 'OCD is not a personality quirk, neatness fetish, or desire for perfection. It is a neurocognitive doubt disorder rooted in intolerance of uncertainty.',
        content: `Pop culture frequently portrays OCD as a harmless love for symmetrical desks or tidy cupboards. In clinical reality, Obsessive-Compulsive Disorder is an agonizing struggle characterized by intrusive, unwanted thoughts (obsessions) that trigger acute emotional distress, followed by urgent repetitive acts (compulsions) executed to eliminate that discomfort or prevent an imagined catastrophe.

Understanding that OCD is rooted in the brain’s threat-detection network—specifically the hyperactive communication between the orbital frontal cortex, the caudate nucleus, and the cingulate cortex—frees you from personal blame. Intrusive thoughts do not reflect your moral desires; in fact, obsessions are almost universally *ego-dystonic*, striking precisely at the things you value most.`,
      },
      {
        id: 'b1-c2',
        title: 'The Anatomy of an Obsession: Ego-Dystonic Intrusions',
        summary: 'Obsessions latch onto what matters most to you. Understanding ego-dystonic thoughts removes shame.',
        content: `An obsession is not just any passing worry. It is characterized by three key traits: it is involuntary, repetitive, and ego-dystonic. *Ego-dystonic* means the thought directly conflicts with your core values, identity, and moral character. 

If you are a loving parent, your brain may deliver an intrusive image of harm coming to your child. If you value religious devotion, blasphemous doubts may strike. Because the thought feels so foreign and repugnant, your nervous system interprets its mere presence as an urgent emergency: 'Why would I think that? Does it mean I want it to happen?' The clinical rule of thumb is simple: *the more horrifying an intrusive thought is to you, the less likely it is to reflect your genuine intent.*`,
      },
      {
        id: 'b1-c3',
        title: 'The Compulsion Trap: Why Relief is Temporary',
        summary: 'Compulsions work in the short term, which is exactly what makes them so destructive in the long term.',
        content: `When distress spikes, you perform a compulsion—washing hands, checking locks, seeking reassurance from a partner, or mentally repeating a phrase until it feels 'just right.' For a few minutes, relief settles in. Your distress drops.

This temporary drop in distress is the trap. Through negative reinforcement, your brain learns: 'The only reason the catastrophe didn't happen is because I checked four times.' The compulsion reinforces the false premise that the intrusive thought was a real emergency. Over days and weeks, the urge returns faster, requiring more elaborate rituals to achieve the same fleeting peace.`,
      },
      {
        id: 'b1-c4',
        title: 'The Role of Avoidance: How the World Shrinks',
        summary: 'Avoidance is a covert compulsion that silently limits where you can go and what you can do.',
        content: `Not all compulsions are active rituals. Avoidance is the quiet, covert cousin of the compulsion. You might avoid driving on certain streets, avoid holding kitchen knives around others, decline social invitations, or avoid watching certain news stories.

While avoidance seems like an easy way to prevent anxiety, it sends a dangerous signal to your amygdala: 'That situation is lethal; avoid it at all costs.' Gradually, your world constricts into a narrow fortress, leaving less and less room for meaningful living, relationships, and career growth.`,
      },
      {
        id: 'b1-c5',
        title: 'Reassurance Seeking: The Deceptive Digital Loop',
        summary: 'Asking others or googling symptoms feels harmless, but it is one of OCD’s most tenacious fuels.',
        content: `In modern life, reassurance has moved onto our screens. Googling bodily symptoms for two hours, asking forums 'Did this happen to anyone else?', or asking family members 'Are you sure I locked the front door?' are all digital and relational compulsions.

Reassurance functions like a drug: it delivers an immediate hit of certainty, but the half-life of that certainty grows shorter every day. Within hours, doubt whispers: 'What if the forum post was wrong? What if the doctor didn't look closely enough?' Breaking the reassurance loop requires learning to leave questions deliberately unanswered.`,
      },
      {
        id: 'b1-c6',
        title: 'The OCD Cycle: From Trigger to Sensitization',
        summary: 'Trace the full loop: Trigger → Intrusive Thought → Distress → Compulsion → Temporary Relief → Sensitization.',
        content: `The cycle follows an invariant path:
1. **Trigger**: An internal sensation, fleeting memory, or external situation.
2. **Obsession**: An intrusive doubt ('What if I contaminated the kitchen?').
3. **Distress**: Spike in physical anxiety, autonomic arousal, or cognitive dread.
4. **Compulsion / Avoidance**: Physical check, mental replay, or asking for reassurance.
5. **Brief Relief**: Autonomic settling.
6. **Sensitization**: Brain rewires to treat the trigger as an existential danger next time.

Exposure and Response Prevention works by intervening directly between step 3 and step 4: allowing distress to exist without engaging the compulsion.`,
      },
    ],
  },
  {
    id: 'book-2',
    title: 'ERP Explained',
    subtitle: 'The Evidence-Based Gold Standard for Recovery',
    color: 'brand-coralSoft',
    badge: 'Book II',
    estimatedMinutes: 20,
    chapters: [
      {
        id: 'b2-c1',
        title: 'What is Exposure? Turning Toward the Discomfort',
        summary: 'Exposure is not reckless danger; it is a planned, voluntary encounter with uncertain situations.',
        content: `Exposure involves voluntarily confronting situations, thoughts, objects, or bodily sensations that provoke obsessive fear. It is never about doing genuinely dangerous things (e.g., leaving a stove truly on fire); rather, it is about entering situations where real danger is virtually non-existent, but OCD sounds a deafening five-alarm siren.

By turning toward the trigger deliberately, you shift from passive victimhood to active agency. You say to your brain: 'I am choosing to step into this situation and tolerate what comes up.'`,
      },
      {
        id: 'b2-c2',
        title: 'What is Response Prevention? The Active Ingredient',
        summary: 'Exposure without response prevention is just torture. Prevention is where the rewiring happens.',
        content: `If exposure is the fuel, response prevention is the engine of neuroplastic change. Response Prevention means making a conscious, behavioral commitment to refrain from performing any compulsive ritual—overt or covert—after encountering the trigger.

If you touch a doorknob (exposure), response prevention means resisting washing your hands for the next two hours. If you have an intrusive blasphemous thought, response prevention means refusing to recite a neutralizing prayer. By staying in the situation without ritualizing, your brain makes a monumental discovery: *the catastrophic outcome did not occur, and my nervous system is capable of tolerating the feeling.*`,
      },
      {
        id: 'b2-c3',
        title: 'Embracing "Maybe, Maybe Not": Living with Doubt',
        summary: 'The goal of ERP is not certainty; it is building the muscle of living alongside doubt.',
        content: `People without OCD accept hundreds of uncertainties every day: 'Will this elevator cable snap? Maybe, maybe not, but I'm getting on.' 'Will this meal give me food poisoning? Probably not, but it is never 100% guaranteed.'

OCD demands 100.000% certainty before letting you relax. Because absolute certainty about the future is mathematically impossible, seeking it guarantees unending misery. ERP teaches you to adopt the mantra of psychological flexibility: *'Maybe my hands are dirty, maybe they aren't. I'm going to make dinner anyway.'*`,
      },
      {
        id: 'b2-c4',
        title: 'Why Discomfort is Allowed: Inhibitory Learning',
        summary: 'Old habituation theory assumed anxiety must drop to zero. Modern inhibitory learning says tolerating expectancy violation is key.',
        content: `Early behavioral models claimed that you had to sit in an exposure until your anxiety naturally plummeted down to zero. Contemporary clinical neuroscience (Inhibitory Learning Theory by Dr. Michelle Craske and colleagues) provides a more empowering insight:

Your distress does not have to drop to zero for the practice to succeed! What matters is *expectancy violation*. You expected that if you didn't check the lock, you would lose your mind or your house would burn down. When you sat with the discomfort and neither event happened, your brain constructed a new inhibitory safety pathway that competes with the old fear pathway.`,
      },
    ],
  },
  {
    id: 'book-3',
    title: 'The Four Steps',
    subtitle: 'Jeffrey M. Schwartz’s Self-Help Framework (Brain Lock)',
    color: 'brand-amberSoft',
    badge: 'Book III',
    estimatedMinutes: 18,
    chapters: [
      {
        id: 'b3-c1',
        title: 'Step 1 — Relabel: It’s Not Me, It’s My OCD',
        summary: 'Learn to label the intrusive thought immediately and objectively without arguing with it.',
        content: `The first step is cultivating cognitive distance. When an obsessive thought strikes, instead of saying 'I might have forgotten to lock the back door and someone will break in,' you immediately relabel the experience: 'I am having an intrusive OCD thought about the back door.'

Relabeling strips the intrusive thought of its emotional authority. You are not denying the thought, nor are you engaging in a debate. You are simply calling it by its true medical and cognitive name: mental static generated by a misfiring circuit.`,
      },
      {
        id: 'b3-c2',
        title: 'Step 2 — Reattribute: It’s a Biochemical False Alarm',
        summary: 'Remind yourself why the thought feels so intense: a glitch in your brain’s error-detection circuitry.',
        content: `In Step 2, you answer the visceral urge: 'Why does this feel so intensely real and urgent?' You reattribute the intensity: 'It feels real because my brain's caudate nucleus and orbital frontal cortex are sending an errant false alarm.'

This understanding helps neutralize the panic. When a smoke detector screeches because of burnt toast, you don't call the fire department; you wave a towel because you understand the mechanical cause. Reattributing reminds you that emotional urgency is not evidence of physical peril.`,
      },
      {
        id: 'b3-c3',
        title: 'Step 3 — Refocus: Pivot to a Values-Aligned Action',
        summary: 'Shift your attention to a constructive, enjoyable activity for at least 15 minutes.',
        content: `Refocus is the behavioral powerhouse of the Four Steps. You do not sit passively waiting for the thought to disappear. Instead, you redirect your attention and physical energy into a constructive, values-aligned action: playing an instrument, walking outside, working on a project, gardening, or reading.

The Schwartz 15-Minute Rule: commit to engaging in your chosen activity for at least 15 minutes before even considering revisiting the obsession. By actively refocusing your behavior, you physically alter metabolic activity in the brain’s striatum.`,
      },
      {
        id: 'b3-c4',
        title: 'Step 4 — Revalue: See the Thought as Worthless Noise',
        summary: 'Over time, you treat intrusive thoughts as background chatter with zero actionable value.',
        content: `As you practice the first three steps repeatedly, Step 4 happens naturally: you revalue the intrusive thought. You no longer treat it as a significant prophecy, moral failing, or urgent task.

You see it for what it is: irrelevant mental background noise, akin to a car alarm sounding three blocks away. It is loud, but it has nothing to do with your house, and it requires no action from you whatsoever.`,
      },
    ],
  },
];

const MASTERCLASSES = [
  {
    id: 'suds-guide',
    title: 'The SUDS Scale (0–10) Demystified',
    badge: 'Clinical Guide',
    duration: '6 min read',
    content: `The Subjective Units of Distress Scale (SUDS) was developed by Joseph Wolpe in 1969 to help individuals quantify the subjective intensity of their anxiety and discomfort:
• 0: Total peace and relaxed equanimity.
• 1–3: Mild background tension; noticeable but easily set aside.
• 4–6: Moderate discomfort; urges are present and distracting, but fully manageable.
• 7–8: Significant distress; physical arousal (racing heart, tightness), strong compulsive pull.
• 9–10: Peak acute distress; overwhelming urge to escape or ritualize.

**Crucial Truth:** The goal of ERP is NOT to force your SUDS to zero. If you start an exposure at SUDS 8, and finish at SUDS 6, that is an overwhelming victory! In fact, completing a practice while remaining at SUDS 7 without performing a compulsion is the highest form of neurological rewiring.`,
  },
  {
    id: 'erp-success',
    title: 'What Real Success Looks Like in ERP',
    badge: 'Perspective Shift',
    duration: '5 min read',
    content: `People often enter therapy believing that 'success' means never experiencing intrusive thoughts and never feeling anxious. This false expectation leads to despair.

In evidence-based ERP, success is measured by **behavioral tolerance and life engagement**, not the absence of sensations:
✓ Success is delaying a checking compulsion by 20 minutes when you used to do it immediately.
✓ Success is going to a birthday dinner with friends while your brain whispers that your hands are unclean.
✓ Success is saying 'Maybe my worst fear will come true, maybe it won't' and continuing to read your book.
✓ Success is noticing an intrusive taboo thought and refusing to analyze what it says about your moral soul.`,
  },
  {
    id: 'erp-vs-grounding',
    title: 'ERP vs Grounding: The Crucial Clinical Boundary',
    badge: 'Safety Rule',
    duration: '7 min read',
    content: `A frequent pitfall in OCD self-management is using relaxation or grounding exercises as a covert compulsion to neutralize obsessions.

**The Golden Boundary:**
• **ERP** is about willingly stepping toward discomfort, inviting uncertainty, and deliberately not soothing yourself out of the feeling.
• **Grounding** (5-4-3-2-1, sensory orientation) is designed for acute physiological overwhelm or dissociation, helping you anchor into the physical room so you can return to life.

**The Golden Test:**
Ask yourself: *'Am I using this breathing exercise or grounding tool to prove that the thought isn't dangerous, or to make the bad feeling go away?'*
If yes, STOP. That is a compulsion.
Only use grounding to steady your physical vessel so you can continue living your life alongside the uncertainty.`,
  },
];

const EXTERNAL_RESOURCES = [
  {
    id: 'res-iocdf',
    name: 'International OCD Foundation (IOCDF)',
    url: 'https://iocdf.org',
    category: 'Global Authority',
    description: 'The premier global non-profit organization dedicated to helping individuals with OCD and related disorders, their families, and clinicians.',
  },
  {
    id: 'res-nice',
    name: 'NICE Clinical Guidelines (CG31)',
    url: 'https://www.nice.org.uk/guidance/cg31',
    category: 'Clinical Standards',
    description: 'National Institute for Health and Care Excellence official evidence-based guidelines for the diagnosis and management of OCD and BDD in children, young people, and adults.',
  },
  {
    id: 'res-nimh',
    name: 'National Institute of Mental Health (NIMH)',
    url: 'https://www.nimh.nih.gov/health/topics/obsessive-compulsive-disorder-ocd',
    category: 'Scientific Research',
    description: 'Authoritative research papers, neuroimaging studies, and evidence-based clinical descriptions of OCD neurobiology and clinical trials.',
  },
  {
    id: 'res-who',
    name: 'WHO Mental Health Compendium',
    url: 'https://www.who.int/news-room/fact-sheets/detail/mental-disorders',
    category: 'Global Health',
    description: 'World Health Organization clinical descriptions and diagnostic criteria for obsessive-compulsive and related conditions.',
  },
];

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;
    const path = event.path || '';

    if (method === 'GET' && path.endsWith('/modules')) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          data: {
            books: BOOKS,
            masterclasses: MASTERCLASSES,
            resources: EXTERNAL_RESOURCES,
          },
        }),
      };
    }

    if (method === 'POST' && path.endsWith('/progress')) {
      const decoded = requireAuth(event);
      const body = JSON.parse(event.body || '{}');
      const { chapterId, bookId, completed } = body;

      if (!chapterId) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'chapterId is required.' } }),
        };
      }

      const timestamp = new Date().toISOString();
      const item = {
        PK: `USER#${decoded.userId}`,
        SK: `LEARN#${chapterId}`,
        entityType: 'LearningProgress',
        userId: decoded.userId,
        chapterId,
        bookId: bookId || null,
        completed: completed !== false,
        completedAt: timestamp,
      };

      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Chapter progress saved.', data: item }),
      };
    }

    if (method === 'GET' && path.endsWith('/progress')) {
      const decoded = requireAuth(event);

      const res = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
          ExpressionAttributeValues: {
            ':pk': `USER#${decoded.userId}`,
            ':skPrefix': 'LEARN#',
          },
        })
      );

      const completedChapters = (res.Items || []).map((i) => i.chapterId);

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ data: { completedChapters, items: res.Items || [] } }),
      };
    }

    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (err) {
    console.error('Learning handler error:', err);
    return {
      statusCode: err.statusCode || 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Internal server error' } }),
    };
  }
};
