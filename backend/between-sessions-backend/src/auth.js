const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'between-sessions-secret-key-2026';

// Initialize mailgen
const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Between Sessions',
    link: 'https://betweensessions.com/'
  }
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const email = body.email;

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    // Configure Mailtrap transport
    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
      }
    });

    const emailBody = {
      body: {
        name: email.split('@')[0],
        intro: 'Welcome to your private sanctuary.',
        action: {
          instructions: 'To securely enter your dashboard, please click the link below.',
          button: {
            color: '#176B67', // brand-teal
            text: 'Enter Sanctuary',
            link: 'http://localhost:5173/login?verify=success'
          }
        },
        outro: 'This is a self-management and care-continuity tool. It is not a diagnosis service.'
      }
    };

    const emailHtml = mailGenerator.generate(emailBody);

    // Skip actual sending if mailtrap creds are demo/demo, just to prevent crashing if unconfigured
    if (process.env.MAILTRAP_USER !== 'demo') {
      await transporter.sendMail({
        from: 'sanctuary@betweensessions.com',
        to: email,
        subject: 'Secure Login - Between Sessions',
        html: emailHtml
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: `usr_${Math.random().toString(36).substr(2, 9)}`, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Verification email sent',
        token, // Included for easy MVP testing without leaving the app
        user: { email, onboardingComplete: false }
      })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
