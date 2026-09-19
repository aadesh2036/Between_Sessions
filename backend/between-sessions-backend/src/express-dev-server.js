/**
 * Between Sessions — Express Development Server
 *
 * Wraps Lambda handlers in an Express app so the frontend can call
 * http://localhost:3000/api/v1/... during local development.
 *
 * Mimics API Gateway's contract: each Lambda receives an event object
 * with { httpMethod, path, headers, pathParameters, queryStringParameters, body }.
 */

process.env.MAILTRAP_SMTP_HOST = 'sandbox.smtp.mailtrap.io';
process.env.MAILTRAP_SMTP_PORT = '2525';
process.env.MAILTRAP_SMTP_USER = '9a1e374c409f43';
process.env.MAILTRAP_SMTP_PASS = '848727f20872a7';

const express = require('express');
const cors = require('cors');

// ── Handler imports ─────────────────────────────────────────────────────────
const authHandler = require('./auth').handler;
const practiceHandler = require('./practice').handler;
const practitionerHandler = require('./practitioner').handler;
const checkinsHandler = require('./checkins').handler;
const journalHandler = require('./journal').handler;
const dashboardHandler = require('./dashboard').handler;
const progressHandler = require('./progress').handler;
const aiSummaryHandler = require('./aiSummary').handler;
const consentsHandler = require('./consents').handler;
const connectionsHandler = require('./connections').handler;
const toolkitHandler = require('./toolkit').handler;
const valuesHandler = require('./values').handler;
const learningHandler = require('./learning').handler;

const app = express();
app.use(cors());
app.use(express.json());

// ── Shared helpers ───────────────────────────────────────────────────────────

/**
 * Build a Lambda API-Gateway-shaped event from an Express request.
 * pathParameters are populated from req.params.
 */
const createEvent = (req) => ({
  body: JSON.stringify(req.body),
  headers: req.headers,
  pathParameters: req.params || {},
  queryStringParameters: Object.keys(req.query).length ? req.query : null,
  httpMethod: req.method,
  path: req.path,
});

/** Forward a Lambda response back through Express */
const forward = (res, lambdaResult) => {
  if (lambdaResult.headers) {
    for (const [key, value] of Object.entries(lambdaResult.headers)) {
      res.setHeader(key, value);
    }
  }
  res.status(lambdaResult.statusCode || 200).send(lambdaResult.body);
};

/** Generic bridge: wraps a Lambda handler for an Express route */
const bridge = (handler) => async (req, res) => {
  try {
    const result = await handler(createEvent(req));
    forward(res, result);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
};

// ── Auth & User ──────────────────────────────────────────────────────────────
app.post(
  [
    '/api/v1/auth/register',
    '/api/v1/auth/login',
    '/api/v1/auth/verify',
    '/api/v1/auth/resend',
    '/api/v1/auth/forgot-password',
    '/api/v1/auth/reset-password',
  ],
  bridge(authHandler)
);
app.put('/api/v1/user/update', bridge(authHandler));
// Also support POST for backward compat with existing AuthContext call
app.post('/api/v1/user/update', bridge(authHandler));

// ── Practice & Exposure Plans ───────────────────────────────────────────────
app.post('/api/v1/practice', bridge(practiceHandler));
app.get('/api/v1/practice', bridge(practiceHandler));
app.get('/api/v1/practice/plans', bridge(practiceHandler));

// ── Toolkit (Grounding, Breathing, Pause&Choose, Reassurance, Focus) ─────────
app.post('/api/v1/toolkit/interactions', bridge(toolkitHandler));
app.get('/api/v1/toolkit/interactions', bridge(toolkitHandler));

// ── Values & Life Outside OCD ────────────────────────────────────────────────
app.get('/api/v1/values', bridge(valuesHandler));
app.get('/api/v1/values/actions', bridge(valuesHandler));
app.post('/api/v1/values/actions', bridge(valuesHandler));

// ── Learn (Books, Chapters, Masterclasses, Resources) ─────────────────────────
app.get('/api/v1/learn/modules', bridge(learningHandler));
app.get('/api/v1/learn/progress', bridge(learningHandler));
app.post('/api/v1/learn/progress', bridge(learningHandler));

// ── Checkins ─────────────────────────────────────────────────────────────────
app.post('/api/v1/checkins', bridge(checkinsHandler));
app.get('/api/v1/checkins', bridge(checkinsHandler));

// ── Journal ──────────────────────────────────────────────────────────────────
app.post('/api/v1/journal', bridge(journalHandler));
app.get('/api/v1/journal', bridge(journalHandler));

// ── Dashboard ────────────────────────────────────────────────────────────────
app.get('/api/v1/dashboard', bridge(dashboardHandler));

// ── Progress ─────────────────────────────────────────────────────────────────
app.get('/api/v1/progress', bridge(progressHandler));

// ── AI Summary ───────────────────────────────────────────────────────────────
app.post('/api/v1/ai/weekly-summary', bridge(aiSummaryHandler));
app.get('/api/v1/ai/weekly-summary', bridge(aiSummaryHandler));

// ── Consents ─────────────────────────────────────────────────────────────────
app.get('/api/v1/consents', bridge(consentsHandler));
app.put('/api/v1/consents/:consentId', bridge(consentsHandler));
app.put('/api/v1/consents', bridge(consentsHandler)); // new consent without id

// ── Connections & Recommendations ───────────────────────────────────────────
app.post('/api/v1/connections', bridge(connectionsHandler));
app.get('/api/v1/connections', bridge(connectionsHandler));
app.delete('/api/v1/connections/:id', bridge(connectionsHandler));
app.get('/api/v1/recommendations', bridge(connectionsHandler));
app.get('/api/v1/connections/cedar-eval', bridge(connectionsHandler));

// ── Practitioner auth ────────────────────────────────────────────────────────
app.post('/api/v1/auth/practitioner-login', bridge(authHandler));
app.post('/api/v1/auth/practitioner-register', bridge(authHandler));

// ── Public practitioner discovery (no auth) ──────────────────────────────────
app.get('/api/v1/practitioners', bridge(practitionerHandler));

// ── Practitioner domain routes ───────────────────────────────────────────────
app.get('/api/v1/practitioner/me',                                          bridge(practitionerHandler));
app.put('/api/v1/practitioner/me',                                          bridge(practitionerHandler));
app.get('/api/v1/practitioner/requests',                                    bridge(practitionerHandler));
app.post('/api/v1/practitioner/requests/:userId/accept',                    bridge(practitionerHandler));
app.post('/api/v1/practitioner/requests/:userId/decline',                   bridge(practitionerHandler));
app.get('/api/v1/practitioner/patients',                                    bridge(practitionerHandler));
app.get('/api/v1/practitioner/patients/:userId/summary',                    bridge(practitionerHandler));
app.get('/api/v1/practitioner/patients/:userId/consent',                    bridge(practitionerHandler));
app.post('/api/v1/practitioner/patients/:userId/recommendations',           bridge(practitionerHandler));
app.post('/api/v1/practitioner/patients/:userId/ai-summary',                 bridge(practitionerHandler));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  ✦ Between Sessions dev server\n  ✦ http://localhost:${PORT}/api/v1\n`);
});
