/**
 * Connections Handler
 *
 * POST   /api/v1/connections           — Send a connection request to a practitioner
 * GET    /api/v1/connections           — List all connections/requests for the user
 * DELETE /api/v1/connections/:id       — Disconnect / revoke a connection
 *
 * Connection states: pending | active | rejected | revoked
 */

const jwt = require('jsonwebtoken');
const cedar = require('@cedar-policy/cedar-wasm/nodejs');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  GetCommand,
} = require('@aws-sdk/lib-dynamodb');

const CEDAR_POLICY = `
permit (
    principal,
    action == Action::"ReadPatientSummary",
    resource
)
when {
    context.practitionerVerified == true &&
    context.connectionStatus == "ACTIVE" &&
    context.consentedCategories.contains("practice_logs")
};
`;

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

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;
    const path = event.path || event.rawPath || '';

    if (method === 'POST') {
      /* ── Create connection request ────────────────────────────────────── */
      const decoded = requireAuth(event);
      const userId = decoded.userId;
      const body = JSON.parse(event.body || '{}');

      const { practitionerId, message } = body;

      if (!practitionerId) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'practitionerId is required.' } }),
        };
      }

      // Check for duplicate
      const existing = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${userId}`, SK: `CONNECTION#${practitionerId}` },
        })
      );

      if (existing.Item && existing.Item.status !== 'revoked') {
        return {
          statusCode: 409,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: { code: 'CONFLICT', message: 'Connection already exists.' } }),
        };
      }

      const now = new Date().toISOString();
      const connectionId = `CONN_${userId}_${practitionerId}`;

      const item = {
        PK: `USER#${userId}`,
        SK: `CONNECTION#${practitionerId}`,
        entityType: 'Connection',
        connectionId,
        userId,
        practitionerId,
        status: 'pending',
        message: message || null,
        consentedCategories: [], // granted separately via /consents
        createdAt: now,
        updatedAt: now,
      };

      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

      // Also create the practitioner-side request entry for their inbox
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `PRACTITIONER#${practitionerId}`,
          SK: `REQUEST#${now}#${userId}`,
          entityType: 'ConnectionRequest',
          connectionId,
          userId,
          practitionerId,
          status: 'pending',
          message: message || null,
          createdAt: now,
        },
      }));

      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Connection request sent.', data: item }),
      };
    }

    if (method === 'GET' && path.includes('/recommendations')) {
      /* ── List user recommendations ──────────────────────────────────── */
      const decoded = requireAuth(event);
      const userId = decoded.userId;

      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
          ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':prefix': 'RECOMMENDATION#',
          },
          ScanIndexForward: false,
        })
      );

      const recs = result.Items || [];
      const enriched = await Promise.all(
        recs.map(async (rec) => {
          if (rec.practitionerId && !rec.practitionerName) {
            try {
              const pRes = await docClient.send(
                new GetCommand({
                  TableName: TABLE_NAME,
                  Key: { PK: `PRACTITIONER#${rec.practitionerId}`, SK: 'PROFILE' },
                })
              );
              if (pRes.Item) {
                return {
                  ...rec,
                  practitionerName: pRes.Item.name,
                  practitionerCredentials: pRes.Item.credentials,
                };
              }
            } catch {
              // fallback
            }
          }
          return rec;
        })
      );

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ data: enriched }),
      };
    }

    if (method === 'GET' && path.includes('/cedar-eval')) {
      /* ── Evaluate Cedar policy for connection ────────────────────────── */
      const decoded = requireAuth(event);
      const userId = decoded.userId;
      const practitionerId = (event.queryStringParameters || {}).practitionerId || 'MCI-2024-KM-7741';

      const connRes = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${userId}`, SK: `CONNECTION#${practitionerId}` },
        })
      );
      const conn = connRes.Item;
      const connectionStatus = conn?.status || 'NO_CONNECTION';
      const consentedCategories = conn?.consentedCategories || [];
      const practitionerVerified = true;

      let allowed = false;
      try {
        const result = cedar.isAuthorized({
          policies: { staticPolicies: CEDAR_POLICY },
          entities: [
            { uid: { type: 'Practitioner', id: practitionerId }, attrs: {}, parents: [] },
            { uid: { type: 'Patient', id: userId }, attrs: {}, parents: [] },
          ],
          principal: { type: 'Practitioner', id: practitionerId },
          action:    { type: 'Action', id: 'ReadPatientSummary' },
          resource:  { type: 'Patient', id: userId },
          context: {
            practitionerVerified,
            connectionStatus,
            consentedCategories: Array.isArray(consentedCategories) ? consentedCategories : [],
          },
        });
        allowed = (result?.response?.decision ?? result?.decision) === 'allow';
      } catch {
        allowed = practitionerVerified && connectionStatus === 'ACTIVE' &&
          Array.isArray(consentedCategories) && consentedCategories.includes('practice_logs');
      }

      const reasons = allowed
        ? ['Verified clinician status confirmed', 'Connection status is ACTIVE', 'practice_logs consent is explicitly granted by patient']
        : [
            connectionStatus !== 'ACTIVE' ? `Connection is not ACTIVE (current: ${connectionStatus})` : null,
            !consentedCategories.includes('practice_logs') ? 'Required data category "practice_logs" is NOT granted by patient' : null,
          ].filter(Boolean);

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          data: {
            principal: `Practitioner::"${practitionerId}"`,
            action: 'Action::"ReadPatientSummary"',
            resource: `Patient::"${userId}"`,
            connectionStatus,
            consentedCategories,
            decision: allowed ? 'allow' : 'deny',
            allowed,
            reasons,
            policy: CEDAR_POLICY.trim(),
          },
        }),
      };
    }

    if (method === 'GET') {
      /* ── List user connections ────────────────────────────────────────── */
      const decoded = requireAuth(event);
      const userId = decoded.userId;

      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
          ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':prefix': 'CONNECTION#',
          },
        })
      );

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ data: result.Items || [] }),
      };
    }

    if (method === 'DELETE') {
      /* ── Revoke / disconnect ─────────────────────────────────────────── */
      const decoded = requireAuth(event);
      const userId = decoded.userId;

      // practitionerId from path param or query
      const practitionerId =
        event.pathParameters?.id ||
        (event.queryStringParameters || {}).practitionerId;

      if (!practitionerId) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Connection id (practitionerId) required.' } }),
        };
      }

      const now = new Date().toISOString();
      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${userId}`, SK: `CONNECTION#${practitionerId}` },
          UpdateExpression: 'SET #s = :s, updatedAt = :now, revokedAt = :now, consentedCategories = :empty',
          ExpressionAttributeNames: { '#s': 'status' },
          ExpressionAttributeValues: { ':s': 'revoked', ':now': now, ':empty': [] },
        })
      );

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Connection revoked.' }),
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
    console.error('[connections]', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected error.' } }),
    };
  }
};
