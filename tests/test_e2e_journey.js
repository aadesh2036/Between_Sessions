/**
 * test_e2e_journey.js
 * Comprehensive end-to-end integration test of the Between Sessions MVP
 */

const BASE_URL = process.env.API_BASE || 'http://localhost:3000/api/v1';

async function req(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log('====================================================');
  console.log('BETWEEN SESSIONS — E2E VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name} — ${details}`);
      failed++;
    }
  }

  // ── TEST 1: Health Check ──
  const health = await req('/../../api/health');
  assert(health.ok && health.data?.status === 'ok', 'Health Check API is live');

  // ── TEST 2: Practitioner Discovery ──
  const pracDiscovery = await req('/practitioners');
  assert(
    pracDiscovery.ok && Array.isArray(pracDiscovery.data?.data) && pracDiscovery.data.data.length > 0,
    'Public Practitioner Discovery endpoint works',
    JSON.stringify(pracDiscovery.data)
  );
  const drMehra = pracDiscovery.data.data.find(p => p.id === 'MCI-2024-KM-7741' || p.govCertId === 'MCI-2024-KM-7741' || p.name.includes('Kavita'));
  assert(!!drMehra, 'Dr. Kavita Mehra is in the public directory', JSON.stringify(drMehra));

  // ── TEST 3: User A (Priya Sharma - Veteran) Login ──
  const priyaLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@betweensessions.com', password: 'Demo1234!' }),
  });
  assert(priyaLogin.ok && !!priyaLogin.data?.token, 'Priya Sharma login succeeds');
  const priyaToken = priyaLogin.data?.token;
  const priyaUser = priyaLogin.data?.user;

  // ── TEST 4: Priya Dashboard Stats (Anti-Gamification Check) ──
  const priyaDash = await req('/dashboard', {
    headers: { Authorization: `Bearer ${priyaToken}` },
  });
  assert(priyaDash.ok, 'Priya dashboard data retrieved');
  assert(
    priyaDash.data?.data?.checkinCountThisWeek != null,
    'Dashboard returns longitudinal checkinCountThisWeek (anti-gamification)',
    JSON.stringify(priyaDash.data?.data)
  );
  assert(
    priyaDash.data?.data?.activePatterns?.length > 0,
    'Dashboard returns active behavioral patterns'
  );

  // ── TEST 5: Priya Recommendations ──
  const priyaRecs = await req('/recommendations', {
    headers: { Authorization: `Bearer ${priyaToken}` },
  });
  assert(
    priyaRecs.ok && Array.isArray(priyaRecs.data?.data) && priyaRecs.data.data.length > 0,
    'Priya receives practitioner recommendations',
    JSON.stringify(priyaRecs.data)
  );
  const rec0 = priyaRecs.data?.data[0];
  assert(
    (rec0.practitionerId === 'MCI-2024-KM-7741' || rec0.practitionerId === 'prac_kavita_mehra_001') && rec0.nextStep && rec0.observation,
    'Recommendation includes Dr. Mehra attribution, observation, and nextStep'
  );

  // ── TEST 6: Cedar Authorization Evaluation (Granted) ──
  const cedarEval = await req('/connections/cedar-eval?practitionerId=MCI-2024-KM-7741', {
    headers: { Authorization: `Bearer ${priyaToken}` },
  });
  assert(
    cedarEval.ok && cedarEval.data?.data?.allowed === true && cedarEval.data?.data?.decision === 'allow',
    'Cedar WASM evaluates ALLOW for active connection with practice_logs consent',
    JSON.stringify(cedarEval.data)
  );

  // ── TEST 7: Practitioner Dr. Mehra Reads Priya Summary ──
  const mehraLogin = await req('/auth/practitioner-login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'kavita@betweensessions.com',
      password: 'Prac1234!',
      govCertId: 'MCI-2024-KM-7741',
    }),
  });
  assert(mehraLogin.ok && !!mehraLogin.data?.token, 'Dr. Kavita Mehra login succeeds');
  const mehraToken = mehraLogin.data?.token;

  const priyaSummary = await req(`/practitioner/patients/${priyaUser.id}/summary`, {
    headers: { Authorization: `Bearer ${mehraToken}` },
  });
  assert(
    priyaSummary.ok && priyaSummary.data?.data?.checkins?.length > 0,
    'Dr. Mehra reads Priya patient summary via Cedar-authorized access'
  );

  // ── TEST 8: Cedar Revocation & Negative Enforcement ──
  // Revoke practice_logs consent for Dr. Mehra
  const revokeRes = await req('/consents', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${priyaToken}` },
    body: JSON.stringify({
      recipientId: 'MCI-2024-KM-7741',
      purpose: 'professional_review',
      dataCategories: ['checkins'], // Omit practice_logs
      status: 'active',
    }),
  });
  assert(revokeRes.ok, 'Consent updated to remove practice_logs');

  // Verify Cedar now evaluates DENY
  const cedarDenyEval = await req('/connections/cedar-eval?practitionerId=MCI-2024-KM-7741', {
    headers: { Authorization: `Bearer ${priyaToken}` },
  });
  assert(
    cedarDenyEval.ok && cedarDenyEval.data?.data?.allowed === false && cedarDenyEval.data?.data?.decision === 'deny',
    'Cedar WASM evaluates DENY when practice_logs consent is absent',
    JSON.stringify(cedarDenyEval.data)
  );

  // Verify Dr. Mehra receives 403 CONSENT_REQUIRED
  const deniedSummary = await req(`/practitioner/patients/${priyaUser.id}/summary`, {
    headers: { Authorization: `Bearer ${mehraToken}` },
  });
  assert(
    deniedSummary.status === 403 && deniedSummary.data?.error?.code === 'CONSENT_REQUIRED',
    'Dr. Mehra request is blocked with 403 CONSENT_REQUIRED by Cedar',
    JSON.stringify(deniedSummary.data)
  );

  // Restore consent
  await req('/consents', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${priyaToken}` },
    body: JSON.stringify({
      recipientId: 'MCI-2024-KM-7741',
      purpose: 'professional_review',
      dataCategories: ['checkins', 'journal_structured', 'practice_logs', 'ai_summary'],
      status: 'active',
    }),
  });
  const restoredSummary = await req(`/practitioner/patients/${priyaUser.id}/summary`, {
    headers: { Authorization: `Bearer ${mehraToken}` },
  });
  assert(restoredSummary.ok, 'Dr. Mehra access is immediately restored upon re-granting consent');

  // ── TEST 9: User B (Alex Chen) Journey — Connect & Authoring ──
  const alexLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'alex@betweensessions.com', password: 'Demo1234!' }),
  });
  assert(alexLogin.ok && !!alexLogin.data?.token, 'Alex Chen login succeeds');
  const alexToken = alexLogin.data?.token;
  const alexUser = alexLogin.data?.user;

  // Reset any previous connection for Alex so test is repeatable
  await req('/connections/MCI-2024-KM-7741', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${alexToken}` },
  }).catch(() => {});

  // Verify Alex starts with 0 active connections
  const alexConns = await req('/connections', {
    headers: { Authorization: `Bearer ${alexToken}` },
  });
  const alexActive = (alexConns.data?.data || []).filter(c => ['active', 'ACTIVE', 'pending', 'PENDING'].includes(c.status));
  assert(alexConns.ok && alexActive.length === 0, 'Alex starts with no active connections');

  // Alex sends connection request to Dr. Mehra
  const alexReq = await req('/connections', {
    method: 'POST',
    headers: { Authorization: `Bearer ${alexToken}` },
    body: JSON.stringify({
      practitionerId: 'MCI-2024-KM-7741',
      message: 'Hi Dr. Mehra, I want to review my ERP practice with you.',
    }),
  });
  assert(alexReq.ok && alexReq.data?.data?.status === 'pending', 'Alex sends pending connection request');

  // Alex grants consent
  await req('/consents', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${alexToken}` },
    body: JSON.stringify({
      recipientId: 'MCI-2024-KM-7741',
      purpose: 'professional_review',
      dataCategories: ['checkins', 'journal_structured', 'practice_logs'],
      status: 'active',
    }),
  });

  // Dr. Mehra reviews pending requests and accepts Alex
  const pendingReqs = await req('/practitioner/requests', {
    headers: { Authorization: `Bearer ${mehraToken}` },
  });
  assert(
    pendingReqs.ok && pendingReqs.data?.data?.some(r => r.userId === alexUser.id),
    'Dr. Mehra sees Alex Chen in pending requests'
  );

  const acceptAlex = await req(`/practitioner/requests/${alexUser.id}/accept`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${mehraToken}` },
  });
  assert(acceptAlex.ok, 'Dr. Mehra accepts Alex Chen connection');

  // Dr. Mehra authors a recommendation for Alex
  const authorRec = await req(`/practitioner/patients/${alexUser.id}/recommendations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${mehraToken}` },
    body: JSON.stringify({
      observation: 'Initial baseline indicates high distress (SUDS 8) around morning rituals.',
      nextStep: 'Practice the Pause & Choose delay response for 10 minutes when the morning urge arises.',
      noteToUser: 'You are doing great taking the first step. Take it one moment at a time.',
    }),
  });
  assert(authorRec.ok && authorRec.data?.data?.recommendationId, 'Dr. Mehra authors clinical recommendation for Alex');

  // Alex receives Dr. Mehra recommendation
  const alexRecs = await req('/recommendations', {
    headers: { Authorization: `Bearer ${alexToken}` },
  });
  assert(
    alexRecs.ok && alexRecs.data?.data?.length > 0 && alexRecs.data.data[0].nextStep.includes('Pause & Choose'),
    'Alex receives and reads Dr. Mehra recommendation'
  );

  // ── TEST 10: Practitioner Self-Registration ──
  const newPracId = 'MCI-2025-RP-3312';
  const regPrac = await req('/auth/practitioner-register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Dr. Rajiv Patel',
      email: `rajiv.patel.${Date.now()}@betweensessions.com`,
      password: 'PracPassword123!',
      govCertId: newPracId,
      credentials: 'MD, DPM, Consultant Psychiatrist',
      specialty: 'ERP & Cognitive Behavioral Practice',
    }),
  });
  assert(
    regPrac.ok && !!regPrac.data?.token && regPrac.data?.practitioner?.id === newPracId,
    'New practitioner registers successfully with synthetic ID and receives JWT'
  );

  // Check new practitioner appears in directory
  const updatedDir = await req('/practitioners');
  assert(
    updatedDir.ok && updatedDir.data?.data?.some(p => p.id === newPracId || p.govCertId === newPracId),
    'Newly registered practitioner appears immediately in the directory'
  );

  // Test invalid synthetic ID format rejection
  const badIdReg = await req('/auth/practitioner-register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Dr. Fake',
      email: 'fake@example.com',
      password: 'Password123!',
      govCertId: 'INVALID-ID-1234',
      credentials: 'MD',
      specialty: 'None',
    }),
  });
  assert(
    badIdReg.status === 400 && badIdReg.data?.error?.code === 'INVALID_PRACTITIONER_ID',
    'Invalid practitioner ID is rejected with 400 INVALID_PRACTITIONER_ID'
  );

  // ── TEST 11: Practice Plans & Exposure Retrieval ──
  const plansRes = await req('/practice/plans', { token: priyaToken });
  assert(
    plansRes.ok && plansRes.data?.data?.selfGuidedPlans?.length >= 3,
    'Practice plans endpoint returns curated self-guided ERP exposure plans'
  );
  assert(
    plansRes.ok && Array.isArray(plansRes.data?.data?.clinicianPlans),
    'Practice plans endpoint returns clinician-assigned guidelines'
  );

  // ── TEST 12: Toolkit Interactions Logging (Grounding / Reassurance / Pacing) ──
  const tkPost = await req('/toolkit/interactions', {
    method: 'POST',
    token: priyaToken,
    body: JSON.stringify({
      toolId: 'grounding',
      durationSeconds: 120,
      actionChosen: '5-4-3-2-1 completed',
      notes: 'Grounded back into physical room without ritualizing',
    }),
  });
  assert(
    tkPost.status === 201 && tkPost.data?.data?.toolId === 'grounding',
    'Priya logs grounding session in Toolkit'
  );

  const tkGet = await req('/toolkit/interactions', { token: priyaToken });
  assert(
    tkGet.ok && tkGet.data?.data?.length > 0 && tkGet.data?.data[0].toolId === 'grounding',
    'Priya retrieves toolkit interaction history'
  );

  // ── TEST 13: Life Outside OCD (Values Actions) ──
  const valGet = await req('/values', { token: priyaToken });
  assert(
    valGet.ok && valGet.data?.data?.values?.includes('Yoga') && valGet.data?.data?.suggestedActions?.length > 0,
    'Priya receives values and curated Life Outside OCD actions'
  );

  const valPost = await req('/values/actions', {
    method: 'POST',
    token: priyaToken,
    body: JSON.stringify({
      value: 'Yoga',
      actionTitle: '15-minute gentle restorative movement',
      durationMinutes: 15,
      reflection: 'Enjoyed movement with full bodily presence',
    }),
  });
  assert(
    valPost.status === 201 && valPost.data?.data?.actionTitle === '15-minute gentle restorative movement',
    'Priya logs completed Life Outside OCD values action'
  );

  // ── TEST 14: Learning Curriculum & Progress ──
  const learnMods = await req('/learn/modules');
  assert(
    learnMods.ok && learnMods.data?.data?.books?.length === 3 && learnMods.data?.data?.masterclasses?.length === 3,
    'Curated educational library returns 3 Books and 3 Clinical Masterclasses'
  );

  const learnPost = await req('/learn/progress', {
    method: 'POST',
    token: priyaToken,
    body: JSON.stringify({
      chapterId: 'b1-c1',
      bookId: 'book-1',
      completed: true,
    }),
  });
  assert(
    learnPost.ok && learnPost.data?.data?.chapterId === 'b1-c1',
    'Priya records completion of Book 1, Chapter 1'
  );

  const learnProg = await req('/learn/progress', { token: priyaToken });
  assert(
    learnProg.ok && learnProg.data?.data?.completedChapters?.includes('b1-c1'),
    'Priya retrieves updated reading progress'
  );

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Test run error:', err);
  process.exit(1);
});
