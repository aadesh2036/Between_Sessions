/**
 * Checkins Handler
 * POST /api/v1/checkins  — Log a daily distress/urge check-in
 * GET  /api/v1/checkins  — Retrieve check-in history with optional date range
 */

const jwt = require('jsonwebtoken');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} = require('@aws-sdk/lib-dynamodb');

const JWT_SECRET = process.env.JWT_SECRET || 'between-sessions-secret-key-2026';
const TABLE_NAME = process.env.TABLE_NAME || 'BetweenSessionsTable';

const ddbEndpoint = process.env.DYNAMODB_ENDPOINT || 'http://127.0.0.1:8000';
const ddbClient = new DynamoDBClient({
  endpoint: ddbEndpoint,
  region: 'local',
  credentials: { accessKeyId: 'dummy', secretAccessKey: 'dummy' },
});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

/** Extract and verify the bearer token. Returns decoded payload or throws. */
function requireAuth(event) {
  const authHeader =
    event.headers?.authorization || event.headers?.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) throw { statusCode: 401, code: 'UNAUTHORIZED', message: 'Missing bearer token.' };
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw { statusCode: 401, code: 'UNAUTHORIZED', message: 'Invalid or expired token.' };
  }
}

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;

    if (method === 'POST') {
      /* ── Create check-in ─────────────────────────────────────────────── */
      const decoded = requireAuth(event);
      const body = JSON.parse(event.body || '{}');

      const { sudsScore, urgeScore, mood, note } = body;

      // sudsScore 0-10 required
      if (sudsScore === undefined || sudsScore === null) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'sudsScore (0–10) is required.' } }),
        };
      }

      const timestamp = new Date().toISOString();
      const checkinId = `CI_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      const item = {
        PK: `USER#${decoded.userId}`,
        SK: `CHECKIN#${timestamp}#${checkinId}`,
        entityType: 'Checkin',
        checkinId,
        userId: decoded.userId,
        sudsScore: Number(sudsScore),
        urgeScore: urgeScore !== undefined ? Number(urgeScore) : null,
        mood: mood || null,
        note: note || null, // keep brief, not clinical narrative
        createdAt: timestamp,
      };

      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Check-in logged.', data: item }),
      };
    }

    if (method === 'GET') {
      /* ── List check-ins ─────────────────────────────────────────────── */
      const decoded = requireAuth(event);
      const qs = event.queryStringParameters || {};
      const fromDate = qs.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const toDate = qs.to || new Date().toISOString();

      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND SK BETWEEN :skFrom AND :skTo',
          ExpressionAttributeValues: {
            ':pk': `USER#${decoded.userId}`,
            ':skFrom': `CHECKIN#${fromDate}`,
            ':skTo': `CHECKIN#${toDate}Z`,
          },
          ScanIndexForward: false, // newest first
        })
      );

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ data: result.Items || [] }),
      };
    }

    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED' } }),
    };
  } catch (err) {
    if (err.statusCode) {
      return {
        statusCode: err.statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: { code: err.code, message: err.message } }),
      };
    }
    console.error('[checkins]', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected error.' } }),
    };
  }
};
