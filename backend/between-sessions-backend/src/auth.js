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
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          token,
          user: {
            id: user.id,
            email: user.email,
            onboardingComplete: user.onboardingComplete,
            name: user.name,
            isVerified: user.isVerified,
            values: user.values || [],
            focusPatterns: user.focusPatterns || [],
            supportStatus: user.supportStatus || null,
            goal: user.goal || null,
          }
        })
      };
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
      // Require a valid JWT bearer token to authorise the update
      const authHeader = event.headers?.authorization || event.headers?.Authorization || '';
      const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (!bearerToken) {
        return { statusCode: 401, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'UNAUTHORIZED', message: 'Missing bearer token.' }) };
      }
      let decoded;
      try {
        decoded = jwt.verify(bearerToken, JWT_SECRET);
      } catch {
        return { statusCode: 401, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'UNAUTHORIZED', message: 'Invalid or expired token.' }) };
      }

      // Only allow users to update their own profile
      if (decoded.email && email && decoded.email !== email) {
        return { statusCode: 403, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'FORBIDDEN', message: 'You may only update your own profile.' }) };
      }

      const targetEmail = decoded.email || email;
      if (!targetEmail) {
        return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'VALIDATION_ERROR', message: 'Email is required.' }) };
      }

      const { name, password, onboardingComplete, values, focusPatterns, supportStatus, goal, preferences } = body;
      const updateExpr = [];
      const exprVals = {};
      const exprNames = {};
      // 'name' is a DynamoDB reserved keyword — must alias it
      if (name) { updateExpr.push("#nm = :n"); exprVals[":n"] = name; exprNames["#nm"] = "name"; }
      if (password) { updateExpr.push("password = :p"); exprVals[":p"] = password; }
      if (onboardingComplete !== undefined) { updateExpr.push("onboardingComplete = :oc"); exprVals[":oc"] = onboardingComplete; }
      if (values !== undefined) { updateExpr.push("values = :val"); exprVals[":val"] = values; }
      if (focusPatterns !== undefined) { updateExpr.push("focusPatterns = :fp"); exprVals[":fp"] = focusPatterns; }
      if (supportStatus !== undefined) { updateExpr.push("supportStatus = :ss"); exprVals[":ss"] = supportStatus; }
      if (goal !== undefined) { updateExpr.push("goal = :gl"); exprVals[":gl"] = goal; }
      if (preferences !== undefined) { updateExpr.push("preferences = :pref"); exprVals[":pref"] = preferences; }

      if (updateExpr.length > 0) {
        await docClient.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${targetEmail}`, SK: `PROFILE` },
          UpdateExpression: "SET " + updateExpr.join(", "),
          ExpressionAttributeValues: exprVals,
          ...(Object.keys(exprNames).length > 0 ? { ExpressionAttributeNames: exprNames } : {})
        }));

        if (decoded.userId) {
          try {
            await docClient.send(new UpdateCommand({
              TableName: TABLE_NAME,
              Key: { PK: `USER#${decoded.userId}`, SK: `PROFILE` },
              UpdateExpression: "SET " + updateExpr.join(", "),
              ExpressionAttributeValues: exprVals,
              ...(Object.keys(exprNames).length > 0 ? { ExpressionAttributeNames: exprNames } : {})
            }));
          } catch {
            // Best effort update for ID key
          }
        }
      }
      return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ message: 'User updated successfully.' }) };
    }

    if (path.includes('/auth/practitioner-register')) {
      const { password, name, govCertId, credentials, specialisation, languages, remoteAvailable } = body;
      if (!email || !password || !name) {
        return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Email, password, and name are required.' } }) };
      }
      if (password.length < 8) {
        return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters.' } }) };
      }
      if (!govCertId || !govCertId.trim()) {
        return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Practitioner ID is required.' } }) };
      }

      const certIdTrimmed = govCertId.trim().toUpperCase();
      const syntheticRegex = /^MCI-(202[4-6])-[A-Z]{2}-\d{4}$/;
      const allowedStatic = ['MCI-2024-KM-7741', 'MCI-2024-RD-3829', 'MCI-2025-AS-9182', 'MCI-2025-NK-5540', 'MCI-2025-PB-1204', 'MCI-2026-TS-8891'];
      if (!syntheticRegex.test(certIdTrimmed) && !allowedStatic.includes(certIdTrimmed)) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({
            error: {
              code: 'INVALID_PRACTITIONER_ID',
              message: 'Invalid demo credential format. Synthetic format: MCI-YYYY-II-NNNN (e.g. MCI-2024-RD-3829). See DEMO_PRACTITIONER_IDS.md.'
            }
          })
        };
      }

      const existing = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `PRACTITIONER#${email}`, SK: 'PROFILE' } }));
      if (existing.Item) {
        return { statusCode: 409, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: { code: 'CONFLICT', message: 'Practitioner already registered with this email.' } }) };
      }

      const pracId = certIdTrimmed;
      const now = new Date().toISOString();
      const pracCreds = credentials || 'MD, Clinical Practitioner · ERP Specialist';
      const pracSpecs = Array.isArray(specialisation) && specialisation.length > 0 ? specialisation : ['OCD', 'Anxiety Disorders', 'ERP'];
      const pracLangs = Array.isArray(languages) && languages.length > 0 ? languages : ['English', 'Hindi'];
      const pracRemote = remoteAvailable !== undefined ? remoteAvailable : true;

      const pracItem = {
        PK: `PRACTITIONER#${email}`,
        SK: 'PROFILE',
        id: pracId,
        email,
        password,
        name,
        credentials: pracCreds,
        specialisation: pracSpecs,
        languages: pracLangs,
        remoteAvailable: pracRemote,
        isVerified: true,
        govCertId: certIdTrimmed,
        verificationNote: 'Synthetic demo registration — verified for evaluation',
        createdAt: now,
      };

      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: pracItem }));
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...pracItem, PK: `PRACTITIONER#${pracId}` }
      }));

      // Append to public directory listing
      try {
        const listingRes = await docClient.send(new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: 'LISTING#PRACTITIONERS', SK: 'INDEX' }
        }));
        const currentList = listingRes.Item?.practitioners || [];
        const updatedList = [
          ...currentList.filter(p => p.email !== email && p.id !== pracId),
          {
            id: pracId,
            name,
            credentials: pracCreds,
            specialisation: pracSpecs,
            languages: pracLangs,
            remoteAvailable: pracRemote,
            isVerified: true,
            verificationNote: 'Synthetic demo registration — verified for evaluation',
            syntheticProfile: true,
          }
        ];
        await docClient.send(new PutCommand({
          TableName: TABLE_NAME,
          Item: { PK: 'LISTING#PRACTITIONERS', SK: 'INDEX', practitioners: updatedList }
        }));
      } catch (e) {
        console.error('Could not update practitioner listing:', e);
      }

      const token = jwt.sign(
        { practitionerId: pracId, email, role: 'practitioner', name, isVerified: true },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        statusCode: 201,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          message: 'Practitioner registration successful. Demo credentials verified.',
          token,
          practitioner: {
            id: pracId,
            email,
            name,
            isVerified: true,
            credentials: pracCreds,
            specialisation: pracSpecs,
            govCertId: certIdTrimmed,
            role: 'practitioner',
          }
        })
      };
    }

    if (path.includes('/auth/practitioner-login')) {
      const { password } = body;
      const govCertId = body.practitionerId || body.govCertId;
      if (!email || !password) return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Email and password required' }) };

      // Practitioners are keyed by email under PK = PRACTITIONER#email
      const res = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `PRACTITIONER#${email}`, SK: `PROFILE` } }));
      const prac = res.Item;

      if (!prac || prac.password !== password) {
        return { statusCode: 401, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Invalid credentials' }) };
      }

      if (govCertId !== undefined && govCertId !== null && govCertId !== '') {
        if (prac.govCertId && prac.govCertId.toUpperCase() !== govCertId.trim().toUpperCase()) {
          return {
            statusCode: 401,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Practitioner ID does not match our records. Please check your government certification number.' })
          };
        }
      } else if (!govCertId || govCertId.trim() === '') {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: 'Practitioner ID (government certification number) is required.' })
        };
      }


      const token = jwt.sign(
        { practitionerId: prac.id, email, role: 'practitioner', name: prac.name, isVerified: prac.isVerified },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          token,
          practitioner: {
            id: prac.id,
            email: prac.email,
            name: prac.name,
            isVerified: prac.isVerified,
            credentials: prac.credentials,
            specialisation: prac.specialisation,
            govCertId: prac.govCertId,
            role: 'practitioner',
          },
        }),
      };
    }

    if (path.includes('/auth/forgot-password')) {
      if (!email) return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Email required' }) };

      // Check if user or practitioner exists
      const userRes = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `USER#${email}`, SK: 'PROFILE' } }));
      const pracRes = !userRes.Item ? await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `PRACTITIONER#${email}`, SK: 'PROFILE' } })) : null;

      const account = userRes.Item || pracRes?.Item;
      let devResetUrl = null;
      let devToken = null;

      if (account) {
        const isPractitioner = !!pracRes?.Item;
        const resetToken = jwt.sign(
          { email, purpose: 'reset', role: isPractitioner ? 'practitioner' : 'user' },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
        devToken = resetToken;
        const resetLink = `http://localhost:5173/login?reset=${resetToken}${isPractitioner ? '&mode=practitioner' : ''}`;
        devResetUrl = resetLink;

        try {
          const transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_SMTP_HOST || 'sandbox.smtp.mailtrap.io',
            port: process.env.MAILTRAP_SMTP_PORT || 2525,
            auth: {
              user: process.env.MAILTRAP_SMTP_USER || 'dummy',
              pass: process.env.MAILTRAP_SMTP_PASS || 'dummy',
            },
          });
          const emailBody = {
            body: {
              name: account.name || email.split('@')[0],
              intro: 'We received a request to reset your Between Sessions password.',
              action: {
                instructions: 'Click the button below to set a new password. This link expires in 1 hour.',
                button: { color: '#176B67', text: 'Reset Password', link: resetLink },
              },
              outro: 'If you did not request this, you can safely ignore this email.',
            },
          };
          await transporter.sendMail({
            from: 'sanctuary@betweensessions.com',
            to: email,
            subject: 'Reset your Between Sessions password',
            html: mailGenerator.generate(emailBody),
          });
        } catch (mailErr) {
          console.log('📧 [Local Dev Mailer Notice]: SMTP not connected or delivery bypassed.');
          console.log(`🔑 [Between Sessions Dev Reset Link]: ${resetLink}`);
        }
      }

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          message: 'If that email address is registered, a password reset link has been dispatched.',
          ...(devResetUrl ? { devResetUrl, resetToken: devToken } : {}),
        }),
      };
    }

    if (path.includes('/auth/reset-password')) {
      const { token, newPassword } = body;
      if (!token || !newPassword) {
        return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'token and newPassword are required.' }) };
      }
      if (newPassword.length < 8) {
        return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Password must be at least 8 characters.' }) };
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.purpose !== 'reset') throw new Error('Invalid token type');

        // Check whether this is a user or practitioner
        const userRes = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `USER#${decoded.email}`, SK: 'PROFILE' } }));
        if (userRes.Item) {
          await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: `USER#${decoded.email}`, SK: 'PROFILE' },
            UpdateExpression: 'SET password = :p',
            ExpressionAttributeValues: { ':p': newPassword },
          }));
          if (userRes.Item.id) {
            try {
              await docClient.send(new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { PK: `USER#${userRes.Item.id}`, SK: 'PROFILE' },
                UpdateExpression: 'SET password = :p',
                ExpressionAttributeValues: { ':p': newPassword },
              }));
            } catch {}
          }
        }

        const pracRes = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: `PRACTITIONER#${decoded.email}`, SK: 'PROFILE' } }));
        if (pracRes.Item) {
          await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: `PRACTITIONER#${decoded.email}`, SK: 'PROFILE' },
            UpdateExpression: 'SET password = :p',
            ExpressionAttributeValues: { ':p': newPassword },
          }));
          if (pracRes.Item.id) {
            try {
              await docClient.send(new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { PK: `PRACTITIONER#${pracRes.Item.id}`, SK: 'PROFILE' },
                UpdateExpression: 'SET password = :p',
                ExpressionAttributeValues: { ':p': newPassword },
              }));
            } catch {}
          }
        }

        return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ message: 'Password updated successfully. You can now log in.' }) };
      } catch (err) {
        return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: err.message || 'Invalid or expired reset token.' }) };
      }
    }

    return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'Internal server error', details: err.message }) };
  }
};
