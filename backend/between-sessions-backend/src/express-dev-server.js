process.env.MAILTRAP_SMTP_HOST = 'sandbox.smtp.mailtrap.io';
process.env.MAILTRAP_SMTP_PORT = '2525';
process.env.MAILTRAP_SMTP_USER = '9a1e374c409f43';
process.env.MAILTRAP_SMTP_PASS = '848727f20872a7';

const express = require('express');
const cors = require('cors');

const authHandler = require('./auth').handler;
const practiceHandler = require('./practice').handler;
const practitionerHandler = require('./practitioner').handler;

const app = express();
app.use(cors());
app.use(express.json());

const createApiGatewayEvent = (req) => ({
  body: JSON.stringify(req.body),
  headers: req.headers,
  pathParameters: req.params,
  queryStringParameters: req.query,
  httpMethod: req.method,
  path: req.path
});

const handleLambdaResponse = (res, lambdaResult) => {
  if (lambdaResult.headers) {
    for (const [key, value] of Object.entries(lambdaResult.headers)) {
      res.setHeader(key, value);
    }
  }
  res.status(lambdaResult.statusCode || 200).send(lambdaResult.body);
};

app.post(['/api/v1/auth/register', '/api/v1/auth/login', '/api/v1/auth/verify', '/api/v1/auth/resend', '/api/v1/user/update'], async (req, res) => {
  const event = createApiGatewayEvent(req);
  try {
    const result = await authHandler(event);
    handleLambdaResponse(res, result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.post('/api/v1/practice', async (req, res) => {
  const event = createApiGatewayEvent(req);
  try {
    const result = await practiceHandler(event);
    handleLambdaResponse(res, result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/api/v1/practitioner/patients/:userId/summary', async (req, res) => {
  const event = createApiGatewayEvent(req);
  try {
    const result = await practitionerHandler(event);
    handleLambdaResponse(res, result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serverless wrapper running on http://localhost:${PORT}`);
});
