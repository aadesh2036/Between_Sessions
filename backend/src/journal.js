/**
 * Journal Handler
 * POST /api/v1/journal  — Create a behavioral log entry
 * GET  /api/v1/journal  — Retrieve journal history with optional date range
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

const VALID_RESPONSE_TYPES = ['avoidance', 'compulsion', 'reassurance', 'no_response', 'delay', 'resist', 'return', 'continue'];

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;

    if (method === 'POST') {
      /* ── Create journal entry ─────────────────────────────────────────── */
      const decoded = requireAuth(event);
      const body = JSON.parse(event.body || '{}');

      const { trigger, urge, responseType, outcome, tags } = body;

      if (!responseType || !VALID_RESPONSE_TYPES.includes(responseType)) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            error: {
              code: 'VALIDATION_ERROR',
              message: `responseType must be one of: ${VALID_RESPONSE_TYPES.join(', ')}`,
            },
          }),
        };
      }

      const timestamp = new Date().toISOString();
      const entryId = `JE_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      const item = {
        PK: `USER#${decoded.userId}`,
        SK: `JOURNAL#${timestamp}#${entryId}`,
        entityType: 'JournalEntry',
        entryId,
        userId: decoded.userId,
        trigger: trigger || null, // short user-controlled label, not full narrative
        urge: urge !== undefined ? Number(urge) : null,
        responseType,
        outcome: outcome || null,
        tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
        createdAt: timestamp,
      };

      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Journal entry saved.', data: item }),
      };
    }

    if (method === 'GET') {
      /* ── List journal entries ─────────────────────────────────────────── */
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
            ':skFrom': `JOURNAL#${fromDate}`,
            ':skTo': `JOURNAL#${toDate}Z`,
          },
          ScanIndexForward: false,
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
    console.error('[journal]', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected error.' } }),
    };
  }
};
