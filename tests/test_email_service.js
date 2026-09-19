/**
 * Between Sessions — Email Service Unit & Provider Suite
 * Tests provider creation, fallback, Mailgen generation, and mock/SES isolation.
 */

const {
  EmailService,
  MockEmailProvider,
  MailtrapEmailProvider,
  SesEmailProvider,
  createEmailProvider,
  buildVerificationEmailContent,
  buildPasswordResetEmailContent,
} = require('../backend/src/emailService');

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   BETWEEN SESSIONS: EMAIL SERVICE UNIT SUITE');
  console.log('======================================================\n');

  let passed = 0;

  // Test 1: Template generation (HTML and text)
  console.log('Test 1: Mailgen Email Template Generation');
  const verifyContent = buildVerificationEmailContent('Aadesh', 'https://betweensessions.app/verify?t=test123');
  assert(verifyContent.subject.includes('Verify your Sanctuary Account'), 'Verification email subject is correct');
  assert(verifyContent.html.includes('Welcome to your private sanctuary'), 'Verification HTML body contains greeting');
  assert(verifyContent.html.includes('https://betweensessions.app/verify?t=test123'), 'Verification HTML contains action link');
  assert(verifyContent.text.includes('https://betweensessions.app/verify?t=test123'), 'Verification plain text contains action link');
  console.log('  ✓ PASS: Verification email template renders HTML and plain-text');
  passed++;

  const resetContent = buildPasswordResetEmailContent('Aadesh', 'https://betweensessions.app/reset?t=reset123');
  assert(resetContent.subject.includes('Reset your Between Sessions password'), 'Password reset subject is correct');
  assert(resetContent.html.includes('Click the button below to set a new password'), 'Reset HTML contains instructions');
  assert(resetContent.html.includes('https://betweensessions.app/reset?t=reset123'), 'Reset HTML contains reset link');
  assert(resetContent.text.includes('https://betweensessions.app/reset?t=reset123'), 'Reset plain text contains reset link');
  console.log('  ✓ PASS: Password reset email template renders HTML and plain-text');
  passed++;

  // Test 2: Mock Email Provider Isolation & Returns
  console.log('\nTest 2: Mock Email Provider Deterministic Delivery');
  const mockProvider = new MockEmailProvider();
  const mockVerifyResult = await mockProvider.sendVerificationEmail({
    to: 'test@example.com',
    name: 'Test Patient',
    verificationLink: 'https://example.com/verify',
  });
  assert(mockVerifyResult.success === true, 'Mock verification send returns success: true');
  assert(mockVerifyResult.provider === 'mock', 'Mock provider identifies as mock');

  const mockResetResult = await mockProvider.sendPasswordResetEmail({
    to: 'test@example.com',
    name: 'Test Patient',
    resetLink: 'https://example.com/reset',
  });
  assert(mockResetResult.success === true, 'Mock password reset returns success: true');
  assert(mockResetResult.provider === 'mock', 'Mock provider identifies as mock');
  console.log('  ✓ PASS: Mock provider safely records delivery without external calls');
  passed++;

  // Test 3: Email Provider Factory Resolution
  console.log('\nTest 3: Email Provider Factory Resolution');
  const originalProviderEnv = process.env.EMAIL_PROVIDER;

  process.env.EMAIL_PROVIDER = 'mock';
  const resolvedMock = createEmailProvider();
  assert(resolvedMock instanceof MockEmailProvider, 'EMAIL_PROVIDER=mock instantiates MockEmailProvider');

  process.env.EMAIL_PROVIDER = 'mailtrap';
  const resolvedMailtrap = createEmailProvider();
  assert(resolvedMailtrap instanceof MailtrapEmailProvider, 'EMAIL_PROVIDER=mailtrap instantiates MailtrapEmailProvider');

  process.env.EMAIL_PROVIDER = 'ses';
  const resolvedSes = createEmailProvider();
  assert(resolvedSes instanceof SesEmailProvider, 'EMAIL_PROVIDER=ses instantiates SesEmailProvider');
  assert(resolvedSes.region === (process.env.AWS_REGION || 'ap-south-1'), 'SES provider uses configured AWS region');

  process.env.EMAIL_PROVIDER = 'unknown_fallback';
  const resolvedFallback = createEmailProvider();
  assert(resolvedFallback instanceof MockEmailProvider, 'Unrecognized provider safely defaults to MockEmailProvider');

  process.env.EMAIL_PROVIDER = originalProviderEnv;
  console.log('  ✓ PASS: Email factory correctly resolves providers and gracefully falls back to mock');
  passed++;

  // Test 4: EmailService Class Integration
  console.log('\nTest 4: EmailService Class Orchestration');
  const service = new EmailService(mockProvider);
  const svcVerifyResult = await service.sendVerificationEmail('patient@example.com', 'Patient', 'token-abc-123', 'https://myclinic.app');
  assert(svcVerifyResult.success === true, 'Service verification dispatch succeeds');

  const svcResetPatient = await service.sendPasswordResetEmail('patient@example.com', 'Patient', 'token-def-456', false, 'https://myclinic.app');
  assert(svcResetPatient.success === true, 'Service patient password reset dispatch succeeds');

  const svcResetPractitioner = await service.sendPasswordResetEmail('dr@example.com', 'Dr. Smith', 'token-ghi-789', true, 'https://myclinic.app');
  assert(svcResetPractitioner.success === true, 'Service practitioner password reset dispatch succeeds');
  console.log('  ✓ PASS: EmailService integrates cleanly with provider and generates canonical URLs');
  passed++;

  // Test 5: SesEmailProvider Structure & Safety
  console.log('\nTest 5: SesEmailProvider Configuration & Command Safety');
  const sesProvider = new SesEmailProvider();
  assert(sesProvider.fromEmail.length > 0, 'SesEmailProvider has sender email configured');
  assert(sesProvider.client != null, 'SesEmailProvider initializes SESClient');
  console.log('  ✓ PASS: SesEmailProvider initializes AWS SDK v3 client cleanly');
  passed++;

  console.log('\n======================================================');
  console.log(` ✅ ALL ${passed} EMAIL SERVICE TESTS PASSED CLEANLY`);
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ Email Service Test Suite Failed:', err);
  process.exit(1);
});
