process.env.MAILTRAP_USER = 'demo'; process.env.MAILTRAP_PASS = 'demo';
const express = require('express');
const cors = require('cors');

const authHandler = require('./auth').handler;
const practiceHandler = require('./practice').handler;
const practitionerHandler = require('./practitioner').handler;

const app = express();
app.use(cors());
app.use(express.json());

// Helper to simulate API Gateway Event
const createApiGatewayEvent = (req) => ({
  body: JSON.stringify(req.body),
  headers: req.headers,
  pathParameters: req.params,
  queryStringParameters: req.query,
  httpMethod: req.method,
  path: req.path
});

// Helper to handle Lambda Response
const handleLambdaResponse = (res, lambdaResult) => {
  if (lambdaResult.headers) {
    for (const [key, value] of Object.entries(lambdaResult.headers)) {
      res.setHeader(key, value);
    }
  }
  res.status(lambdaResult.statusCode || 200).send(lambdaResult.body);
};

// Routes mapping to Lambda Handlers
app.post('/api/v1/auth/verify', async (req, res) => {
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
  console.log(`Routing to AWS Lambda handlers...`);
});
