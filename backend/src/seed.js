/**
 * seed.js — Populates BetweenSessionsTable with a full, deterministic demo dataset.
 *
 * Run with:  node seed.js
 *
 * Users:
 *   Alex Chen    — new user (3 days), no practitioner connection yet
 *   Priya Sharma — veteran user (21 days), connected to Dr. Mehra
 *
 * Practitioner:
 *   Dr. Kavita Mehra — verified, govCertId: MCI-2024-KM-7741
 *
 * Seed includes:
 *   - Full check-in / journal / practice history for Priya (21 days)
 *   - Light check-in / journal history for Alex (3 days)
 *   - Active connection Priya ↔ Dr. Mehra with consent
 *   - Recommendation from Dr. Mehra to Priya
 *   - Public practitioner discovery listing
 *   - Pending request in Dr. Mehra's inbox from Priya
 *   - Alex has NO connection — will see discovery banner
 */

const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const jwt = require('jsonwebtoken');

const client = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
  region: 'local',
  credentials: { accessKeyId: 'dummy', secretAccessKey: 'dummy' },
});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'BetweenSessionsTable';
const JWT_SECRET = 'between-sessions-secret-key-2026';

// ── Identities ────────────────────────────────────────────────────────────────
const ALEX_EMAIL    = 'alex@betweensessions.com';
const ALEX_ID       = 'usr_alex_chen_001';

const PRIYA_EMAIL   = 'priya@betweensessions.com';
const PRIYA_ID      = 'usr_priya_sharma_001';

const PRAC_EMAIL    = 'kavita@betweensessions.com';
const GOV_CERT_ID   = 'MCI-2024-KM-7741';   // mock government cert ID
const PRAC_ID       = GOV_CERT_ID;          // Uniform ID matching synthetic demo registry format

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** ISO string for daysAgo days before now at hour:minute */
function ago(daysAgo, hour = 9, minute = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** Monday of the current ISO week */
function weekStart() {
  const d = new Date();
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - (day === 0 ? 6 : day - 1));
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

async function put(item) {
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
}

// ─────────────────────────────────────────────────────────────────────────────
async function seed() {

  // ── Create table (idempotent) ─────────────────────────────────────────────
  console.log('⏳  Ensuring DynamoDB table...');
  try {
    await client.send(new CreateTableCommand({
      TableName: TABLE_NAME,
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    }));
    console.log('✓  Table created.');
    await delay(2000);
  } catch (err) {
    if (err.name === 'ResourceInUseException') {
      console.log('✓  Table already exists.');
    } else throw err;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PRACTITIONER — Dr. Kavita Mehra
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n⏳  Seeding practitioner Dr. Kavita Mehra...');

  // Profile record (keyed by ID — for practitioner.me)
  await put({
    PK: `PRACTITIONER#${PRAC_ID}`,
    SK: 'PROFILE',
    id: PRAC_ID,
    email: PRAC_EMAIL,
    name: 'Dr. Kavita Mehra',
    credentials: 'MD, MCI Registered Psychiatrist · ERP Specialist',
    specialisation: ['OCD', 'Anxiety Disorders', 'ERP'],
    languages: ['English', 'Hindi'],
    remoteAvailable: true,
    isVerified: true,
    govCertId: GOV_CERT_ID,
    verificationNote: 'MCI Registration verified — demo only',
    createdAt: ago(90),
  });

  // Auth record (keyed by email — for practitioner-login)
  await put({
    PK: `PRACTITIONER#${PRAC_EMAIL}`,
    SK: 'PROFILE',
    id: PRAC_ID,
    email: PRAC_EMAIL,
    password: 'Prac1234!',
    govCertId: GOV_CERT_ID,
    name: 'Dr. Kavita Mehra',
    credentials: 'MD, MCI Registered Psychiatrist · ERP Specialist',
    specialisation: ['OCD', 'Anxiety Disorders', 'ERP'],
    isVerified: true,
    createdAt: ago(90),
  });

  // Alias for practitioner@betweensessions.com
  await put({
    PK: `PRACTITIONER#practitioner@betweensessions.com`,
    SK: 'PROFILE',
    id: PRAC_ID,
    email: PRAC_EMAIL,
    password: 'Prac1234!',
    govCertId: GOV_CERT_ID,
    name: 'Dr. Kavita Mehra',
    credentials: 'MD, MCI Registered Psychiatrist · ERP Specialist',
    specialisation: ['OCD', 'Anxiety Disorders', 'ERP'],
    isVerified: true,
    createdAt: ago(90),
  });

  // Alias for prac_kavita_mehra_001 legacy ID
  await put({
    PK: `PRACTITIONER#prac_kavita_mehra_001`,
    SK: 'PROFILE',
    id: PRAC_ID,
    email: PRAC_EMAIL,
    password: 'Prac1234!',
    govCertId: GOV_CERT_ID,
    name: 'Dr. Kavita Mehra',
    credentials: 'MD, MCI Registered Psychiatrist · ERP Specialist',
    specialisation: ['OCD', 'Anxiety Disorders', 'ERP'],
    isVerified: true,
    createdAt: ago(90),
  });

  const pracToken = jwt.sign(
    { practitionerId: PRAC_ID, email: PRAC_EMAIL, role: 'practitioner', name: 'Dr. Kavita Mehra', isVerified: true },
    JWT_SECRET, { expiresIn: '30d' }
  );
  console.log(`  ✓  Dr. Kavita Mehra  |  login: ${PRAC_EMAIL} / Prac1234!  |  Cert ID: ${GOV_CERT_ID}`);
  console.log(`  ✓  Practitioner JWT: ${pracToken.slice(0, 50)}...`);

  // ── Public practitioner discovery listing ─────────────────────────────────
  await put({
    PK: 'LISTING#PRACTITIONERS',
    SK: 'INDEX',
    practitioners: [
      {
        id: PRAC_ID,
        name: 'Dr. Kavita Mehra',
        credentials: 'MD, MCI Registered Psychiatrist · ERP Specialist',
        specialisation: ['OCD', 'Anxiety Disorders', 'ERP'],
        languages: ['English', 'Hindi'],
        remoteAvailable: true,
        isVerified: true,
        verificationNote: 'MCI Registration verified — demo only',
        syntheticProfile: true,
      },
    ],
  });
  console.log('  ✓  Practitioner discovery listing seeded');

  // ══════════════════════════════════════════════════════════════════════════
  // USER 1 — Priya Sharma (veteran, 21 days, connected to Dr. Mehra)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n⏳  Seeding Priya Sharma (veteran user, 21 days)...');

  await put({
    PK: `USER#${PRIYA_EMAIL}`,
    SK: 'PROFILE',
    id: PRIYA_ID,
    email: PRIYA_EMAIL,
    name: 'Priya Sharma',
    password: 'Demo1234!',
    isVerified: true,
    onboardingComplete: true,
    ageBand: '25-34',
    language: 'en',
    goal: 'track_patterns',
    values: ['Career', 'Family', 'Reading', 'Yoga'],
    aiSummariesEnabled: true,
    privacyAcknowledgedAt: ago(21),
    createdAt: ago(21),
  });
  // Alias for demo@betweensessions.com
  await put({
    PK: `USER#demo@betweensessions.com`,
    SK: 'PROFILE',
    id: PRIYA_ID,
    email: PRIYA_EMAIL,
    name: 'Priya Sharma',
    password: 'Demo1234!',
    isVerified: true,
    onboardingComplete: true,
    ageBand: '25-34',
    language: 'en',
    goal: 'track_patterns',
    values: ['Career', 'Family', 'Reading', 'Yoga'],
    aiSummariesEnabled: true,
    privacyAcknowledgedAt: ago(21),
    createdAt: ago(21),
  });
  // Also key by userId for JWT lookups
  await put({
    PK: `USER#${PRIYA_ID}`,
    SK: 'PROFILE',
    id: PRIYA_ID,
    email: PRIYA_EMAIL,
    name: 'Priya Sharma',
    isVerified: true,
    onboardingComplete: true,
    values: ['Career', 'Family', 'Reading', 'Yoga'],
    createdAt: ago(21),
  });

  const priyaToken = jwt.sign({ userId: PRIYA_ID, email: PRIYA_EMAIL }, JWT_SECRET, { expiresIn: '30d' });
  console.log(`  ✓  Priya Sharma  |  login: ${PRIYA_EMAIL} / Demo1234!`);
  console.log(`  ✓  Priya JWT: ${priyaToken.slice(0, 50)}...`);

  // Priya — 21 daily check-ins (trending down: high → lower)
  console.log('  ⏳  Seeding Priya check-ins (21 days)...');
  const priyaSuds = [9,8,9,8,7,8,7,6,7,6,5,6,5,4,5,4,3,4,3,4,3];
  for (let i = 20; i >= 0; i--) {
    const ts = ago(i, 8, 30);
    const id = `CI_PRIYA_${21 - i}`;
    await put({
      PK: `USER#${PRIYA_ID}`, SK: `CHECKIN#${ts}#${id}`,
      entityType: 'Checkin', checkinId: id, userId: PRIYA_ID,
      sudsScore: priyaSuds[20 - i],
      urgeScore: Math.max(0, priyaSuds[20 - i] - 2),
      mood: priyaSuds[20 - i] <= 4 ? 'calm' : priyaSuds[20 - i] <= 6 ? 'neutral' : 'anxious',
      createdAt: ts,
    });
  }
  console.log('    ✓  21 check-ins (SUDS 9→3)');

  // Priya — 8 journal entries across last 21 days
  const priyaJournal = [
    { d: 20, h: 14, trigger: 'Checking gas stove 4 times before leaving',      urge: 9, rt: 'compulsion',   tags: ['checking', 'home'] },
    { d: 18, h: 11, trigger: 'Intrusive thought at work — doubting email sent',  urge: 7, rt: 'avoidance',   tags: ['work', 'intrusive_thought'] },
    { d: 15, h: 18, trigger: 'Asking partner for reassurance about door lock',   urge: 8, rt: 'reassurance', tags: ['reassurance', 'home'] },
    { d: 12, h: 10, trigger: 'Morning stove-checking ritual — resisted once',    urge: 6, rt: 'resist',      tags: ['checking', 'morning'] },
    { d: 9,  h: 16, trigger: 'Contamination worry — avoided touching doorknob',  urge: 7, rt: 'avoidance',   tags: ['contamination', 'avoidance'] },
    { d: 6,  h: 9,  trigger: 'Delayed checking ritual by 20 minutes',            urge: 5, rt: 'delay',       tags: ['checking', 'delay'] },
    { d: 3,  h: 15, trigger: 'Resisted reassurance-seeking from colleague',      urge: 4, rt: 'resist',      tags: ['reassurance', 'work'] },
    { d: 0,  h: 10, trigger: 'Morning routine — no checking ritual performed',   urge: 3, rt: 'no_response', tags: ['checking', 'morning', 'progress'] },
  ];
  for (let idx = 0; idx < priyaJournal.length; idx++) {
    const j = priyaJournal[idx];
    const ts = ago(j.d, j.h);
    const id = `JE_PRIYA_${idx + 1}`;
    await put({
      PK: `USER#${PRIYA_ID}`, SK: `JOURNAL#${ts}#${id}`,
      entityType: 'JournalEntry', entryId: id, userId: PRIYA_ID,
      trigger: j.trigger, urge: j.urge, responseType: j.rt, tags: j.tags,
      createdAt: ts,
    });
  }
  console.log('    ✓  8 journal entries');

  // Priya — 6 practice logs
  const priyaPractice = [
    { d: 19, ex: 'delay-response-01',  pre: 8, post: 6, dur: 180 },
    { d: 16, ex: 'vagus-breathe-01',   pre: 7, post: 5, dur: 90  },
    { d: 13, ex: 'delay-response-01',  pre: 6, post: 4, dur: 210 },
    { d: 9,  ex: 'urge-surf-90s',      pre: 7, post: 4, dur: 90  },
    { d: 5,  ex: 'delay-response-01',  pre: 5, post: 3, dur: 240 },
    { d: 1,  ex: 'vagus-breathe-01',   pre: 4, post: 2, dur: 90  },
  ];
  for (let idx = 0; idx < priyaPractice.length; idx++) {
    const p = priyaPractice[idx];
    const ts = ago(p.d, 20);
    const id = `PR_PRIYA_${idx + 1}`;
    await put({
      PK: `USER#${PRIYA_ID}`, SK: `PRACTICE#${ts}#${id}`,
      entityType: 'PracticeLog', practiceId: id, userId: PRIYA_ID,
      exerciseId: p.ex, completed: true,
      preDistress: p.pre, postDistress: p.post, durationSeconds: p.dur,
      completedAt: ts, createdAt: ts,
    });
  }
  console.log('    ✓  6 practice logs');

  // Priya — AI weekly summary (current week)
  const ws = weekStart();
  await put({
    PK: `USER#${PRIYA_ID}`, SK: `AI#WEEK#${ws}`,
    entityType: 'AIInsight', weekStart: ws,
    summary: `Between ${ws} and the end of the week you logged 7 check-ins. Your average SUDS score was 3.9 out of 10. You completed 2 practice sessions. The most frequently logged response type was "delay" (2 times). You created 2 behavioral log entries.`,
    sourceMetricIds: ['CI_PRIYA_15', 'CI_PRIYA_16', 'CI_PRIYA_17', 'CI_PRIYA_18', 'CI_PRIYA_19', 'CI_PRIYA_20', 'CI_PRIYA_21'],
    model: 'rule-based-v1-mvp',
    promptVersion: 'weekly-summary-v1',
    generatedAt: ago(0, 7),
    disclaimer: 'Synthesized from your logs — not medical advice.',
  });
  console.log('    ✓  AI weekly summary');

  // Priya ↔ Dr. Mehra — ACTIVE connection + consent
  const connTs = ago(14);
  await put({
    PK: `USER#${PRIYA_ID}`, SK: `CONNECTION#${PRAC_ID}`,
    entityType: 'Connection',
    connectionId: `CONN_${PRIYA_ID}_${PRAC_ID}`,
    userId: PRIYA_ID, practitionerId: PRAC_ID,
    status: 'ACTIVE',
    consentedCategories: ['practice_logs', 'checkins', 'ai_summary'],
    createdAt: connTs, updatedAt: connTs,
  });
  await put({
    PK: `PRACTITIONER#${PRAC_ID}`, SK: `REQUEST#${connTs}#${PRIYA_ID}`,
    entityType: 'ConnectionRequest',
    connectionId: `CONN_${PRIYA_ID}_${PRAC_ID}`,
    userId: PRIYA_ID, practitionerId: PRAC_ID,
    status: 'ACTIVE', message: 'Hi Dr. Mehra, I have been using this app for a few weeks and would like to share my progress with you.',
    createdAt: connTs,
  });
  await put({
    PK: `USER#${PRIYA_ID}`, SK: `CONSENT#professional_review#${PRAC_ID}`,
    entityType: 'Consent', consentId: `CST_professional_review_${PRAC_ID}`,
    userId: PRIYA_ID, purpose: 'professional_review', recipientId: PRAC_ID,
    dataCategories: ['checkins', 'practice_logs', 'ai_summary'],
    status: 'active', grantedAt: connTs, revokedAt: null, updatedAt: connTs, version: '1',
  });
  console.log(`  ✓  Connection Priya ↔ Dr. Mehra (ACTIVE)`);

  // Dr. Mehra's recommendation for Priya
  const recTs = ago(3, 14);
  await put({
    PK: `USER#${PRIYA_ID}`, SK: `RECOMMENDATION#${recTs}#REC_MEHRA_001`,
    entityType: 'Recommendation', recommendationId: 'REC_MEHRA_001',
    userId: PRIYA_ID, practitionerId: PRAC_ID,
    observation: 'I can see a clear downward trend in your SUDS scores over 3 weeks. Your shift from compulsion to delay and resist responses is notable.',
    nextStep: 'Continue with delay-response practice. Extend the delay window from 20 to 30 minutes over the next two weeks. Also try one exposure without any ritual for the stove-checking situation.',
    referral: null,
    noteToUser: 'The progress in your logs is measurable. Keep trusting the process.',
    authoredAt: recTs,
    label: 'Professional note — human authored',
  });
  console.log('  ✓  Dr. Mehra recommendation for Priya');

  // Priya — Toolkit Interactions
  await put({
    PK: `USER#${PRIYA_ID}`, SK: `TOOLKIT#${ago(2, 16)}#TK_PRIYA_1`,
    entityType: 'ToolkitInteraction', interactionId: 'TK_PRIYA_1', userId: PRIYA_ID,
    toolId: 'grounding', durationSeconds: 120, actionChosen: '5-4-3-2-1 completed',
    notes: 'Completed full sensory grounding sequence', createdAt: ago(2, 16),
  });
  await put({
    PK: `USER#${PRIYA_ID}`, SK: `TOOLKIT#${ago(1, 10)}#TK_PRIYA_2`,
    entityType: 'ToolkitInteraction', interactionId: 'TK_PRIYA_2', userId: PRIYA_ID,
    toolId: 'breathing', durationSeconds: 120, actionChosen: '2-min paced breathing',
    notes: 'Steadied body cadence during stove urge', createdAt: ago(1, 10),
  });

  // Priya — Values Actions (Life Outside OCD)
  await put({
    PK: `USER#${PRIYA_ID}`, SK: `VALUE_ACTION#${ago(2, 17)}#VA_PRIYA_1`,
    entityType: 'ValueAction', actionId: 'VA_PRIYA_1', userId: PRIYA_ID,
    value: 'Yoga', actionTitle: '15-minute gentle restorative movement',
    durationMinutes: 15, reflection: 'Present in body without checking thoughts',
    completedAt: ago(2, 17), createdAt: ago(2, 17),
  });
  await put({
    PK: `USER#${PRIYA_ID}`, SK: `VALUE_ACTION#${ago(1, 14)}#VA_PRIYA_2`,
    entityType: 'ValueAction', actionId: 'VA_PRIYA_2', userId: PRIYA_ID,
    value: 'Reading', actionTitle: 'Read 1 full chapter for enjoyment without re-reading sentences',
    durationMinutes: 20, reflection: 'Tolerated uncertainty of missing small details',
    completedAt: ago(1, 14), createdAt: ago(1, 14),
  });

  // Priya — Learning Progress
  await put({
    PK: `USER#${PRIYA_ID}`, SK: 'LEARN#b1-c1',
    entityType: 'LearningProgress', userId: PRIYA_ID, chapterId: 'b1-c1',
    bookId: 'book-1', completed: true, completedAt: ago(18),
  });
  await put({
    PK: `USER#${PRIYA_ID}`, SK: 'LEARN#b1-c2',
    entityType: 'LearningProgress', userId: PRIYA_ID, chapterId: 'b1-c2',
    bookId: 'book-1', completed: true, completedAt: ago(15),
  });
  await put({
    PK: `USER#${PRIYA_ID}`, SK: 'LEARN#b2-c1',
    entityType: 'LearningProgress', userId: PRIYA_ID, chapterId: 'b2-c1',
    bookId: 'book-2', completed: true, completedAt: ago(10),
  });
  console.log('    ✓  Priya toolkit, values actions, and learning progress seeded');

  // ══════════════════════════════════════════════════════════════════════════
  // USER 2 — Alex Chen (new user, 3 days, no connection)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n⏳  Seeding Alex Chen (new user, 3 days)...');

  await put({
    PK: `USER#${ALEX_EMAIL}`,
    SK: 'PROFILE',
    id: ALEX_ID,
    email: ALEX_EMAIL,
    name: 'Alex Chen',
    password: 'Demo1234!',
    isVerified: true,
    onboardingComplete: true,
    ageBand: '18-24',
    language: 'en',
    goal: 'learn_ocd',
    values: ['Studies', 'Photography', 'Gaming', 'Friends'],
    aiSummariesEnabled: true,
    privacyAcknowledgedAt: ago(3),
    createdAt: ago(3),
  });
  await put({
    PK: `USER#${ALEX_ID}`,
    SK: 'PROFILE',
    id: ALEX_ID,
    email: ALEX_EMAIL,
    name: 'Alex Chen',
    isVerified: true,
    onboardingComplete: true,
    values: ['Studies', 'Photography', 'Gaming', 'Friends'],
    createdAt: ago(3),
  });

  const alexToken = jwt.sign({ userId: ALEX_ID, email: ALEX_EMAIL }, JWT_SECRET, { expiresIn: '30d' });
  console.log(`  ✓  Alex Chen  |  login: ${ALEX_EMAIL} / Demo1234!`);
  console.log(`  ✓  Alex JWT: ${alexToken.slice(0, 50)}...`);

  // Alex — 3 daily check-ins (still figuring things out)
  const alexSuds = [8, 7, 6];
  for (let i = 2; i >= 0; i--) {
    const ts = ago(i, 9);
    const id = `CI_ALEX_${3 - i}`;
    await put({
      PK: `USER#${ALEX_ID}`, SK: `CHECKIN#${ts}#${id}`,
      entityType: 'Checkin', checkinId: id, userId: ALEX_ID,
      sudsScore: alexSuds[2 - i], urgeScore: alexSuds[2 - i] - 1,
      mood: 'anxious', createdAt: ts,
    });
  }
  console.log('    ✓  3 check-ins (SUDS 8→6)');

  // Alex — 2 journal entries
  await put({
    PK: `USER#${ALEX_ID}`, SK: `JOURNAL#${ago(2, 15)}#JE_ALEX_1`,
    entityType: 'JournalEntry', entryId: 'JE_ALEX_1', userId: ALEX_ID,
    trigger: 'Had to re-read a message 5 times to make sure I understood it',
    urge: 8, responseType: 'compulsion',
    tags: ['checking', 'study'],
    createdAt: ago(2, 15),
  });
  await put({
    PK: `USER#${ALEX_ID}`, SK: `JOURNAL#${ago(0, 11)}#JE_ALEX_2`,
    entityType: 'JournalEntry', entryId: 'JE_ALEX_2', userId: ALEX_ID,
    trigger: 'Intrusive thought about having said something wrong in class',
    urge: 7, responseType: 'reassurance',
    tags: ['reassurance', 'intrusive_thought'],
    createdAt: ago(0, 11),
  });
  console.log('    ✓  2 journal entries');

  // Alex — Toolkit Interactions
  await put({
    PK: `USER#${ALEX_ID}`, SK: `TOOLKIT#${ago(1, 19)}#TK_ALEX_1`,
    entityType: 'ToolkitInteraction', interactionId: 'TK_ALEX_1', userId: ALEX_ID,
    toolId: 'pause-choose', durationSeconds: 60, actionChosen: 'delay',
    notes: 'Paused when wanting to re-read assignment email', createdAt: ago(1, 19),
  });

  // Alex — Values Actions (Life Outside OCD)
  await put({
    PK: `USER#${ALEX_ID}`, SK: `VALUE_ACTION#${ago(1, 20)}#VA_ALEX_1`,
    entityType: 'ValueAction', actionId: 'VA_ALEX_1', userId: ALEX_ID,
    value: 'Gaming', actionTitle: 'Play 30 minutes of a game purely for leisure with friends',
    durationMinutes: 30, reflection: 'Had fun without worrying about homework precision',
    completedAt: ago(1, 20), createdAt: ago(1, 20),
  });

  // Alex — Learning Progress
  await put({
    PK: `USER#${ALEX_ID}`, SK: 'LEARN#b1-c1',
    entityType: 'LearningProgress', userId: ALEX_ID, chapterId: 'b1-c1',
    bookId: 'book-1', completed: true, completedAt: ago(2),
  });
  console.log('    ✓  Alex toolkit, values actions, and learning progress seeded');
  console.log('  ✓  Alex has NO practitioner connection — will see discovery banner');

  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n✅  Seed complete!\n');
  console.log('   ┌─────────────────────────────────────────────────────┐');
  console.log('   │  Demo Credentials                                   │');
  console.log('   │                                                     │');
  console.log(`   │  New user:    ${ALEX_EMAIL}  / Demo1234!  │`);
  console.log(`   │  Veteran:     ${PRIYA_EMAIL}  / Demo1234! │`);
  console.log(`   │  Practitioner:${PRAC_EMAIL}  / Prac1234!  │`);
  console.log(`   │  Cert ID:     ${GOV_CERT_ID}                      │`);
  console.log('   └─────────────────────────────────────────────────────┘\n');
}

seed().catch(console.error);
