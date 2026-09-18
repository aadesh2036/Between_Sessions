const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const jwt = require('jsonwebtoken');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const JWT_SECRET = process.env.JWT_SECRET || 'between-sessions-secret-key-2026';
const TABLE_NAME = process.env.TABLE_NAME || 'BetweenSessionsTable';

const ddbClient = new DynamoDBClient({ endpoint: "http://localhost:8000", region: "local", credentials: { accessKeyId: "dummy", secretAccessKey: "dummy" } });
const docClient = DynamoDBDocumentClient.from(ddbClient);

const mailGenerator = new Mailgen({
  theme: 'default',
  product: { name: 'Between Sessions', link: 'http://localhost:5173/' }
});

const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST || "sandbox.smtp.mailtrap.io",
    port: process.env.MAILTRAP_SMTP_PORT || 2525,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS
    }
  });

  const emailBody = {
    body: {
      name: email.split('@')[0],
      intro: 'Welcome to your private sanctuary.',
      action: {
        instructions: 'Please click the link below to verify your email address.',
        button: {
          color: '#176B67',
          text: 'Verify Email',
          link: `http://localhost:5173/login?verify=${verificationToken}`
        }
      }
    }
  };

  await transporter.sendMail({
    from: 'sanctuary@betweensessions.com',
    to: email,
    subject: 'Verify your Sanctuary Account',
    html: mailGenerator.generate(emailBody)
  });
};

exports.handler = async (event) => {
  try {
    const path = event.path;
    const body = JSON.parse(event.body || '{}');
    const email = body.email ? body.email.toLowerCase() : null;

    if (path.includes('/auth/register')) {
      const { password, name } = body;
      if (!email || !password) return { statusCode: 400, body: JSON.stringify({ error: 'Email and password required' }) };

      const userId = `usr_${Math.random().toString(36).substr(2, 9)}`;
      const verificationToken = jwt.sign({ email, purpose: 'verify' }, JWT_SECRET, { expiresIn: '1h' });

      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: { PK: `USER#${email}`, SK: `PROFILE`, id: userId, email, password, name, isVerified: false, onboardingComplete: false, createdAt: new Date().toISOString() }
      }));

      await sendVerificationEmail(email, verificationToken);

      return { statusCode: 201, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ message: 'Registration successful. Please check your email to verify.' }) };
    }

    if (path.includes('/auth/login')) {
      const { password, name } = body;
      if (!email || !password) return { statusCode: 400, body: JSON.stringify({ error: 'Email and password required' }) };

      const res = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `USER#${email}`, SK: `PROFILE` } }));
      const user = res.Item;

      if (!user || user.password !== password) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
      
      const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
      return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ token, user: { id: user.id, email: user.email, onboardingComplete: user.onboardingComplete, name: user.name, isVerified: user.isVerified } }) };
    }

    if (path.includes('/auth/verify')) {
      const { token } = body;
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.purpose !== 'verify') throw new Error('Invalid token type');
        
        await docClient.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${decoded.email}`, SK: `PROFILE` },
          UpdateExpression: "SET isVerified = :v",
          ExpressionAttributeValues: { ":v": true }
        }));
        return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ message: 'Email verified successfully.' }) };
      } catch (err) {
        return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Invalid or expired verification token.' }) };
      }
    }

    if (path.includes('/auth/resend')) {
      if (!email) return { statusCode: 400, body: JSON.stringify({ error: 'Email required' }) };
      const verificationToken = jwt.sign({ email, purpose: 'verify' }, JWT_SECRET, { expiresIn: '1h' });
      await sendVerificationEmail(email, verificationToken);
      return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ message: 'Verification email resent.' }) };
    }

    if (path.includes('/user/update')) {
      // Very basic user update (in reality we should check Authorization JWT here)
      const { name, password, onboardingComplete } = body;
      const updateExpr = [];
      const exprVals = {};
      if (name) { updateExpr.push("name = :n"); exprVals[":n"] = name; }
      if (password) { updateExpr.push("password = :p"); exprVals[":p"] = password; }
      if (onboardingComplete !== undefined) { updateExpr.push("onboardingComplete = :oc"); exprVals[":oc"] = onboardingComplete; }
      
      if (updateExpr.length > 0) {
        await docClient.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${email}`, SK: `PROFILE` },
          UpdateExpression: "SET " + updateExpr.join(", "),
          ExpressionAttributeValues: exprVals
        }));
      }
      return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ message: 'User updated successfully.' }) };
    }

    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Internal server error', details: err.message }) };
  }
};
