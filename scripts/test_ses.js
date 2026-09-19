#!/usr/bin/env node
/**
 * Between Sessions — Amazon SES Standalone Smoke Test
 * 
 * Usage:
 *   node scripts/test_ses.js --to recipient@example.com [--from sanctuary@betweensessions.com] [--region ap-south-1] [--type verification|reset]
 */

const { SesEmailProvider } = require('../backend/src/emailService');
const { SESClient, GetSendQuotaCommand, ListIdentitiesCommand } = require('@aws-sdk/client-ses');

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    to: null,
    from: process.env.SES_FROM_EMAIL || 'sanctuary@betweensessions.com',
    region: process.env.AWS_REGION || 'ap-south-1',
    type: 'verification',
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--to' && args[i + 1]) {
      params.to = args[++i];
    } else if (args[i] === '--from' && args[i + 1]) {
      params.from = args[++i];
    } else if (args[i] === '--region' && args[i + 1]) {
      params.region = args[++i];
    } else if (args[i] === '--type' && args[i + 1]) {
      params.type = args[++i];
    }
  }

  return params;
}

async function checkAccountStatus(region) {
  const client = new SESClient({ region });
  try {
    const quota = await client.send(new GetSendQuotaCommand({}));
    const identities = await client.send(new ListIdentitiesCommand({ IdentityType: 'EmailAddress' }));
    return {
      quota,
      identities: identities.Identities || [],
    };
  } catch (err) {
    return { error: err.message };
  }
}

async function main() {
  const params = parseArgs();

  console.log('\n======================================================');
  console.log('   🌿 BETWEEN SESSIONS — AMAZON SES SMOKE TEST');
  console.log('======================================================\n');
  console.log(`Target AWS Region : ${params.region}`);
  console.log(`Sender Identity   : ${params.from}`);
  console.log(`Recipient Email   : ${params.to || '(not provided)'}`);
  console.log(`Email Type        : ${params.type}\n`);

  console.log('▶ Checking SES Account Status & Identities in region...');
  const status = await checkAccountStatus(params.region);
  if (status.error) {
    console.error(`⚠️ Could not query SES status: ${status.error}`);
  } else {
    console.log(`  Max 24-hr Send Quota : ${status.quota.Max24HourSend}`);
    console.log(`  Sent Last 24 Hours   : ${status.quota.SentLast24Hours}`);
    console.log(`  Max Send Rate        : ${status.quota.MaxSendRate}/sec`);
    console.log(`  Verified Identities  : [${status.identities.join(', ')}]`);

    if (status.identities.length === 0) {
      console.warn('\n⚠️ WARNING: No verified email identities found in this region!');
      console.warn('  If your SES account is in Sandbox Mode:');
      console.warn('  Both the SENDER and RECIPIENT email addresses must be verified in Amazon SES.\n');
    } else {
      const fromVerified = status.identities.includes(params.from);
      console.log(`  Sender (${params.from}) verified: ${fromVerified ? '✓ YES' : '✗ NO'}`);
    }
  }

  if (!params.to) {
    console.log('\nTo test active sending, run:');
    console.log(`  node scripts/test_ses.js --to <recipient-email> [--from ${params.from}]\n`);
    process.exit(0);
  }

  console.log(`\n▶ Sending test ${params.type} email via SesEmailProvider...`);
  process.env.AWS_REGION = params.region;
  process.env.SES_FROM_EMAIL = params.from;

  const provider = new SesEmailProvider();
  let result;
  if (params.type === 'reset') {
    result = await provider.sendPasswordResetEmail({
      to: params.to,
      name: 'Smoke Test User',
      resetLink: 'https://betweensessions.app/login?reset=smoke-test-token',
    });
  } else {
    result = await provider.sendVerificationEmail({
      to: params.to,
      name: 'Smoke Test User',
      verificationLink: 'https://betweensessions.app/login?verify=smoke-test-token',
    });
  }

  if (result.success) {
    console.log(`\n✅ SUCCESS: Test email accepted by Amazon SES!`);
    console.log(`   Message ID: ${result.messageId}\n`);
  } else {
    console.error(`\n❌ FAILED: Amazon SES rejected the email.`);
    console.error(`   Error: ${result.error}\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error running SES smoke test:', err);
  process.exit(1);
});
