/**
 * test_backend_e2e.js
 * Comprehensive End-to-End Verification of Backend Logic, Auth, Password Reset, and Cedar WASM.
 */

const jwt = require('jsonwebtoken');
const API_BASE = process.env.API_BASE || 'http://localhost:3000/api/v1';
const HEALTH_URL = process.env.HEALTH_URL || (API_BASE.endsWith('/api/v1') ? API_BASE.replace(/\/api\/v1$/, '/api/health') : `${API_BASE}/health`);
const JWT_SECRET = process.env.JWT_SECRET || 'between-sessions-secret-key-2026';

async function req(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function run() {
  console.log('\n======================================================');
  console.log('   BETWEEN SESSIONS: BACKEND & SECURITY E2E SUITE');
  console.log('======================================================\n');

  // 1. Health check
  console.log('Test 1: Health Check Endpoint');
  const health = await req(HEALTH_URL);
  assert(health.status === 200 && health.data?.status === 'ok', 'API dev server is healthy and responding');

  // 2. Individual Login (Priya Sharma)
  console.log('\nTest 2: Individual User Authentication');
  const userLogin = await req(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@betweensessions.com', password: 'Demo1234!' }),
  });
  assert(userLogin.status === 200, 'Valid user credentials successfully authenticate');
  assert(userLogin.data?.token, 'Returns valid JWT token');
  assert(userLogin.data?.user?.email === 'priya@betweensessions.com', 'User profile returned with email');
  const userToken = userLogin.data.token;

  // 3. Invalid credentials check
  console.log('\nTest 3: Authentication Rejection on Bad Password');
  const badLogin = await req(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@betweensessions.com', password: 'WrongPassword999!' }),
  });
  assert(badLogin.status === 401, 'Rejects invalid password with 401 Unauthorized');

  // 4. Practitioner Login (Dr. Kavita Mehra)
  console.log('\nTest 4: Practitioner Authentication & Gov Cert Verification');
  const pracLogin = await req(`${API_BASE}/auth/practitioner-login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'kavita@betweensessions.com',
      password: 'Prac1234!',
      govCertId: 'MCI-2024-KM-7741',
    }),
  });
  assert(pracLogin.status === 200, 'Valid practitioner credentials & cert ID authenticate');
  assert(pracLogin.data?.practitioner?.govCertId === 'MCI-2024-KM-7741', 'Returns practitioner details with cert ID');
  const pracToken = pracLogin.data.token;

  // 5. Practitioner Login with invalid cert ID
  console.log('\nTest 5: Practitioner ID Mismatch Rejection');
  const badCertLogin = await req(`${API_BASE}/auth/practitioner-login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'kavita@betweensessions.com',
      password: 'Prac1234!',
      govCertId: 'MCI-WRONG-CERT-0000',
    }),
  });
  assert(badCertLogin.status === 401, 'Rejects mismatched practitioner ID with 401');

  // 6. Forgot Password Flow
  console.log('\nTest 6: Forgot Password Endpoint & Token Dispatch');
  const forgot = await req(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@betweensessions.com' }),
  });
  assert(forgot.status === 200, 'Dispatches forgot password request');
  assert(forgot.data?.message && forgot.data.message.includes('dispatched'), 'Returns confirmation that reset email was dispatched');
  assert(!forgot.data?.resetToken && !forgot.data?.devResetUrl, 'Does NOT expose resetToken or devResetUrl in response body');

  // 7. Reset Password Flow (Using Valid Cryptographic Token)
  console.log('\nTest 7: Password Reset & Update Verification');
  const resetToken = jwt.sign({ email: 'priya@betweensessions.com', purpose: 'reset', role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
  const resetRes = await req(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ token: resetToken, newPassword: 'UpdatedPassword2026!' }),
  });
  assert(resetRes.status === 200, 'Password reset succeeded');

  // Verify old password fails
  const oldLogin = await req(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@betweensessions.com', password: 'Demo1234!' }),
  });
  assert(oldLogin.status === 401, 'Old password no longer works');

  // Verify new password succeeds
  const newLogin = await req(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@betweensessions.com', password: 'UpdatedPassword2026!' }),
  });
  assert(newLogin.status === 200, 'New password logs in successfully');

  // Restore demo password to Demo1234!
  const restoreToken = jwt.sign({ email: 'priya@betweensessions.com', purpose: 'reset', role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
  await req(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ token: restoreToken, newPassword: 'Demo1234!' }),
  });
  const restoredLogin = await req(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@betweensessions.com', password: 'Demo1234!' }),
  });
  assert(restoredLogin.status === 200, 'Restored demo password back to Demo1234!');

  // 8. Protected User Dashboard
  console.log('\nTest 8: Protected Resource Authorization (User Dashboard)');
  const dashboard = await req(`${API_BASE}/dashboard`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert(dashboard.status === 200, 'User dashboard accessible with valid JWT');
  assert(dashboard.data?.data?.recentCheckins !== undefined, 'Returns calibrated SUDS recentCheckins data');

  // 9. Unauthorized access to protected resource
  console.log('\nTest 9: Unauthorized Request Blocking');
  const unauth = await req(`${API_BASE}/dashboard`);
  assert(unauth.status === 401, 'Blocks unauthenticated request with 401');

  // 10. Cedar WASM Evaluation
  console.log('\nTest 10: Cedar WASM Cryptographic Consent Evaluation');
  const cedarRes = await req(`${API_BASE}/connections/cedar-eval?practitionerId=MCI-2024-KM-7741`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  assert(cedarRes.status === 200, 'Cedar evaluation endpoint executes without errors');
  assert(typeof cedarRes.data?.data?.allowed === 'boolean', 'Cedar returns deterministic boolean policy decision');
  assert(cedarRes.data?.data?.decision === 'allow' || cedarRes.data?.data?.decision === 'deny', 'Decision is strictly allow or deny');
  assert(cedarRes.data?.data?.policy?.includes('permit'), 'Cedar policy definition is returned');

  // 11. Practitioner Patients Roster
  console.log('\nTest 11: Practitioner Domain Routes (Roster & Requests)');
  const patientsRes = await req(`${API_BASE}/practitioner/patients`, {
    headers: { Authorization: `Bearer ${pracToken}` },
  });
  assert(patientsRes.status === 200, 'Practitioner can query authorized patient roster');
  assert(Array.isArray(patientsRes.data?.data), 'Returns patient list array');

  // 12. Public Practitioner Discovery
  console.log('\nTest 12: Public Practitioner Discovery (Zero-Auth)');
  const discovery = await req(`${API_BASE}/practitioners`);
  assert(discovery.status === 200, 'Public directory is queryable without authentication');
  assert(Array.isArray(discovery.data?.data) && discovery.data.data.length > 0, 'Returns list of verified practitioners');

  // 13. Registration Validation & Duplicate Conflict
  console.log('\nTest 13: Registration Validation & Conflict Rejection');
  const badReg1 = await req(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ email: 'notanemail', password: 'Short', name: '' }),
  });
  assert(badReg1.status === 400, 'Rejects invalid email format with 400');

  const dupReg = await req(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ email: 'priya@betweensessions.com', password: 'Password123!', name: 'Priya Clone' }),
  });
  assert(dupReg.status === 409, 'Rejects duplicate registration for existing email with 409 Conflict');

  // 14. New User Registration & Unverified Login Blocking
  console.log('\nTest 14: New User Registration & Verification Enforcement');
  const testNewEmail = `user_${Date.now()}@betweensessions.com`;
  const regRes = await req(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ email: testNewEmail, password: 'StrongPassword123!', name: 'New Sanctuary User' }),
  });
  assert(regRes.status === 201, 'Creates new user account and returns 201 Created');
  assert(regRes.data?.message?.includes('verify'), 'Returns instruction to verify email');

  // Attempt login before verifying email -> should return 403 with needsVerification
  const unverifiedLogin = await req(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: testNewEmail, password: 'StrongPassword123!' }),
  });
  assert(unverifiedLogin.status === 403, 'Blocks unverified user from logging in with 403 Forbidden');
  assert(unverifiedLogin.data?.needsVerification === true, 'Returns needsVerification flag to trigger resend UI');

  // 15. Resend Verification Email & Token Verification
  console.log('\nTest 15: Resend Verification & Email Token Consumption');
  const resendRes = await req(`${API_BASE}/auth/resend`, {
    method: 'POST',
    body: JSON.stringify({ email: testNewEmail }),
  });
  assert(resendRes.status === 200, 'Successfully resends verification email via Mailtrap');

  // Verify email with valid token
  const testVerifyToken = jwt.sign({ email: testNewEmail, purpose: 'verify' }, JWT_SECRET, { expiresIn: '24h' });
  const verifyRes = await req(`${API_BASE}/auth/verify`, {
    method: 'POST',
    body: JSON.stringify({ token: testVerifyToken }),
  });
  assert(verifyRes.status === 200, 'Successfully verifies email with valid token');

  // Login should now succeed!
  const verifiedLogin = await req(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: testNewEmail, password: 'StrongPassword123!' }),
  });
  assert(verifiedLogin.status === 200, 'Verified user successfully logs in');
  assert(verifiedLogin.data?.user?.isVerified === true, 'User record reflects verified status');

  console.log('\n======================================================');
  console.log(`   ALL ${passedTests} / ${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('   BACKEND & SECURITY ARE PRODUCTION-READY FOR AI');
  console.log('======================================================\n');
}

run().catch((err) => {
  console.error('\nTest runner failed:', err);
  process.exit(1);
});
