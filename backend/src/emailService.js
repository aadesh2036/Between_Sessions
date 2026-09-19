/**
 * Between Sessions — Email Service & Provider Abstraction
 * 
 * Supports:
 *  - SesEmailProvider: Amazon SES transactional delivery (AWS SDK v3, IAM role auth)
 *  - MailtrapEmailProvider: Nodemailer SMTP transport for sandbox testing
 *  - MockEmailProvider: Offline deterministic mock for local development and test suites
 */

const Mailgen = require('mailgen');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const nodemailer = require('nodemailer');

const APP_URL = process.env.APP_URL || process.env.APP_BASE_URL || 'http://localhost:5173';

const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Between Sessions',
    link: APP_URL,
  },
});

/**
 * Generates verification email HTML and text bodies
 */
function buildVerificationEmailContent(name, verificationLink) {
  const emailTemplate = {
    body: {
      name: name || 'Sanctuary Member',
      intro: 'Welcome to your private sanctuary.',
      action: {
        instructions: 'Please click the link below to verify your email address. This link expires in 24 hours.',
        button: {
          color: '#176B67',
          text: 'Verify Email',
          link: verificationLink,
        },
      },
      outro: 'If you did not create an account with Between Sessions, no further action is required.',
    },
  };

  return {
    subject: 'Verify your Sanctuary Account — Between Sessions',
    html: mailGenerator.generate(emailTemplate),
    text: mailGenerator.generatePlaintext(emailTemplate),
  };
}

/**
 * Generates password reset email HTML and text bodies
 */
function buildPasswordResetEmailContent(name, resetLink) {
  const emailTemplate = {
    body: {
      name: name || 'Sanctuary Member',
      intro: 'We received a request to reset your Between Sessions password.',
      action: {
        instructions: 'Click the button below to set a new password. This link expires in 1 hour.',
        button: {
          color: '#176B67',
          text: 'Reset Password',
          link: resetLink,
        },
      },
      outro: 'If you did not request a password reset, you can safely ignore this email.',
    },
  };

  return {
    subject: 'Reset your Between Sessions password',
    html: mailGenerator.generate(emailTemplate),
    text: mailGenerator.generatePlaintext(emailTemplate),
  };
}

// ── 1. Mock Provider ─────────────────────────────────────────────────────────

class MockEmailProvider {
  constructor() {
    this.name = 'mock';
  }

  async sendVerificationEmail({ to, name, verificationLink }) {
    console.log(`📧 [Mock Email] Verification email generated for ${to} (delivery skipped in mock/staging mode)`);
    return { success: true, provider: 'mock' };
  }

  async sendPasswordResetEmail({ to, name, resetLink }) {
    console.log(`📧 [Mock Email] Password reset email generated for ${to} (delivery skipped in mock/staging mode)`);
    return { success: true, provider: 'mock' };
  }
}

// ── 2. Mailtrap Provider ──────────────────────────────────────────────────────

class MailtrapEmailProvider {
  constructor() {
    this.name = 'mailtrap';
    this.fromEmail = process.env.MAILTRAP_FROM_EMAIL || 'sanctuary@betweensessions.com';
    this.transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_SMTP_HOST || 'sandbox.smtp.mailtrap.io',
      port: Number(process.env.MAILTRAP_SMTP_PORT) || 2525,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
      auth: {
        user: process.env.MAILTRAP_SMTP_USER || '9a1e374c409f43',
        pass: process.env.MAILTRAP_SMTP_PASS || '848727f20872a7',
      },
    });
  }

  async sendVerificationEmail({ to, name, verificationLink }) {
    const { subject, html, text } = buildVerificationEmailContent(name, verificationLink);
    try {
      const info = await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        html,
        text,
      });
      console.log(`📧 [Mailtrap] Verification email dispatched to ${to} (messageId: ${info.messageId})`);
      return { success: true, provider: 'mailtrap', messageId: info.messageId };
    } catch (err) {
      console.error(`⚠️ [Mailtrap Error] Failed to send verification email to ${to}:`, err.message);
      return { success: false, provider: 'mailtrap', error: err.message };
    }
  }

  async sendPasswordResetEmail({ to, name, resetLink }) {
    const { subject, html, text } = buildPasswordResetEmailContent(name, resetLink);
    try {
      const info = await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        html,
        text,
      });
      console.log(`📧 [Mailtrap] Password reset email dispatched to ${to} (messageId: ${info.messageId})`);
      return { success: true, provider: 'mailtrap', messageId: info.messageId };
    } catch (err) {
      console.error(`⚠️ [Mailtrap Error] Failed to send password reset email to ${to}:`, err.message);
      return { success: false, provider: 'mailtrap', error: err.message };
    }
  }
}

// ── 3. Amazon SES Provider ────────────────────────────────────────────────────

class SesEmailProvider {
  constructor() {
    this.name = 'ses';
    this.region = process.env.AWS_REGION || 'ap-south-1';
    this.fromEmail = process.env.SES_FROM_EMAIL || 'sanctuary@betweensessions.com';
    this.client = new SESClient({ region: this.region });
  }

  async sendVerificationEmail({ to, name, verificationLink }) {
    const { subject, html, text } = buildVerificationEmailContent(name, verificationLink);
    return this._sendSesMessage(to, subject, html, text, 'verification');
  }

  async sendPasswordResetEmail({ to, name, resetLink }) {
    const { subject, html, text } = buildPasswordResetEmailContent(name, resetLink);
    return this._sendSesMessage(to, subject, html, text, 'password-reset');
  }

  async _sendSesMessage(to, subject, html, text, purpose) {
    const command = new SendEmailCommand({
      Source: this.fromEmail,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: html,
          },
          Text: {
            Charset: 'UTF-8',
            Data: text,
          },
        },
      },
    });

    try {
      const response = await this.client.send(command);
      console.log(`📧 [Amazon SES] ${purpose} email dispatched to ${to} (MessageId: ${response.MessageId})`);
      return { success: true, provider: 'ses', messageId: response.MessageId };
    } catch (err) {
      console.error(`⚠️ [Amazon SES Error] Failed to dispatch ${purpose} email to ${to}:`, err.message);
      return { success: false, provider: 'ses', error: err.message };
    }
  }
}

// ── 4. Factory & EmailService ─────────────────────────────────────────────────

function createEmailProvider() {
  const providerType = (process.env.EMAIL_PROVIDER || 'mock').toLowerCase();

  switch (providerType) {
    case 'ses':
      return new SesEmailProvider();
    case 'mailtrap':
      return new MailtrapEmailProvider();
    case 'mock':
    default:
      return new MockEmailProvider();
  }
}

class EmailService {
  constructor(provider = null) {
    this.provider = provider || createEmailProvider();
  }

  async sendVerificationEmail(to, name, verificationToken, appUrl = APP_URL) {
    const verificationLink = `${appUrl}/login?verify=${verificationToken}`;
    return this.provider.sendVerificationEmail({ to, name, verificationLink });
  }

  async sendPasswordResetEmail(to, name, resetToken, isPractitioner = false, appUrl = APP_URL) {
    const resetLink = `${appUrl}/login?reset=${resetToken}${isPractitioner ? '&mode=practitioner' : ''}`;
    return this.provider.sendPasswordResetEmail({ to, name, resetLink });
  }
}

const defaultEmailService = new EmailService();

module.exports = {
  EmailService,
  defaultEmailService,
  createEmailProvider,
  MockEmailProvider,
  MailtrapEmailProvider,
  SesEmailProvider,
  buildVerificationEmailContent,
  buildPasswordResetEmailContent,
};
