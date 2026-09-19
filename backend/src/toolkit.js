/**
 * Toolkit Handler — Between Sessions
 *
 * POST /api/v1/toolkit/interactions — Log a session with Grounding, Breathing, Pause & Choose, Reassurance Interrupter, or Focus Timer
 * GET  /api/v1/toolkit/interactions — Retrieve recent toolkit interactions
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

const ddbEndpoint = process.env.DYNAMODB_ENDPOINT;
const ddbClient = new DynamoDBClient(
  ddbEndpoint
    ? { endpoint: ddbEndpoint, region: 'local', credentials: { accessKeyId: 'dummy', secretAccessKey: 'dummy' } }
    : {}
);
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

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;

    if (method === 'POST') {
      const decoded = requireAuth(event);
      const body = JSON.parse(event.body || '{}');

      const { toolId, durationSeconds, actionChosen, details, notes } = body;

      if (!toolId) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'toolId is required.' } }),
        };
      }

      const timestamp = new Date().toISOString();
      const interactionId = `TK_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      const item = {
        PK: `USER#${decoded.userId}`,
        SK: `TOOLKIT#${timestamp}#${interactionId}`,
        entityType: 'ToolkitInteraction',
        interactionId,
        userId: decoded.userId,
        toolId, // 'grounding', 'breathing', 'pause-choose', 'reassurance-interrupter', 'focus-timer'
        durationSeconds: durationSeconds ? Number(durationSeconds) : 0,
        actionChosen: actionChosen || null,
        details: details || null,
        notes: notes || null,
        createdAt: timestamp,
      };

      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Toolkit interaction recorded.', data: item }),
      };
    }

    if (method === 'GET') {
      const decoded = requireAuth(event);

      const res = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
          ExpressionAttributeValues: {
            ':pk': `USER#${decoded.userId}`,
            ':skPrefix': 'TOOLKIT#',
          },
          ScanIndexForward: false,
          Limit: 30,
        })
      );

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ data: res.Items || [] }),
      };
    }

    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (err) {
    console.error('Toolkit handler error:', err);
    return {
      statusCode: err.statusCode || 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Internal server error' } }),
    };
  }
};
