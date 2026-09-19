/**
 * Consents Handler
 * GET /api/v1/consents                    — List all consent records for the user
 * PUT /api/v1/consents/:consentId         — Grant, update, or revoke a consent
 *
 * Consent is granular and revocable. Each record covers a (purpose, recipientId) pair.
 */

const jwt = require('jsonwebtoken');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

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

const VALID_PURPOSES = ['professional_review', 'ai_summary', 'research'];
const VALID_DATA_CATEGORIES = [
  'checkins',
  'journal_structured',
  'practice_logs',
  'ai_summary',
];

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;

    if (method === 'GET') {
      /* ── List user consents ───────────────────────────────────────────── */
      const decoded = requireAuth(event);
      const userId = decoded.userId;

      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
          ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':prefix': 'CONSENT#',
          },
        })
      );

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ data: result.Items || [] }),
      };
    }

    if (method === 'PUT') {
      /* ── Grant / revoke a consent ────────────────────────────────────── */
      const decoded = requireAuth(event);
      const userId = decoded.userId;

      // consentId from path or body
      const consentIdFromPath = event.pathParameters?.consentId;
      const body = JSON.parse(event.body || '{}');

      const {
        purpose,
        recipientId,
        dataCategories,
        status, // 'active' | 'revoked'
      } = body;

      if (!purpose || !VALID_PURPOSES.includes(purpose)) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            error: { code: 'VALIDATION_ERROR', message: `purpose must be one of: ${VALID_PURPOSES.join(', ')}` },
          }),
        };
      }

      if (!recipientId) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'recipientId is required.' } }),
        };
      }

      const categories = Array.isArray(dataCategories)
        ? dataCategories.filter(c => VALID_DATA_CATEGORIES.includes(c))
        : VALID_DATA_CATEGORIES;

      const consentStatus = status === 'revoked' ? 'revoked' : 'active';
      const now = new Date().toISOString();

      // Deterministic consentId based on purpose + recipient so it's idempotent
      const consentId = consentIdFromPath || `CST_${purpose}_${recipientId}`;
      const sk = `CONSENT#${purpose}#${recipientId}`;

      const item = {
        PK: `USER#${userId}`,
        SK: sk,
        entityType: 'Consent',
        consentId,
        userId,
        purpose,
        recipientId,
        dataCategories: categories,
        status: consentStatus,
        grantedAt: consentStatus === 'active' ? now : null,
        revokedAt: consentStatus === 'revoked' ? now : null,
        updatedAt: now,
        version: '1',
      };

      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

      // Synchronize matching CONNECTION's consentedCategories so Cedar checks see the update immediately
      try {
        const syncedCategories = consentStatus === 'active' ? categories : [];
        await docClient.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${userId}`, SK: `CONNECTION#${recipientId}` },
          UpdateExpression: 'SET consentedCategories = :cats, updatedAt = :now',
          ExpressionAttributeValues: { ':cats': syncedCategories, ':now': now },
          ConditionExpression: 'attribute_exists(PK)', // only if connection exists
        }));
      } catch {
        // connection may not exist yet — fine
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: `Consent ${consentStatus}.`, data: item }),
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
    console.error('[consents]', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected error.' } }),
    };
  }
};
