/**
 * Values Handler — Between Sessions (Life Outside OCD)
 *
 * GET  /api/v1/values         — Get active user values and curated micro-actions
 * POST /api/v1/values/actions — Log completion of a value-directed action
 * GET  /api/v1/values/actions — List completed actions
 */

const jwt = require('jsonwebtoken');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
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

// Curated micro-actions mapped to core human values (non-OCD focused)
const CURATED_ACTIONS = {
  Career: [
    { id: 'act_career_1', title: 'Work 25 minutes on a priority task without checking email', minutes: 25, type: 'focus' },
    { id: 'act_career_2', title: 'Write draft of notes or proposal and hit send with one review only', minutes: 20, type: 'courage' },
  ],
  Family: [
    { id: 'act_family_1', title: 'Cook or share a meal together with full presence', minutes: 30, type: 'connection' },
    { id: 'act_family_2', title: 'Call a relative without seeking reassurance or confessing worries', minutes: 15, type: 'boundary' },
  ],
  Reading: [
    { id: 'act_reading_1', title: 'Read 1 full chapter for enjoyment without re-reading sentences', minutes: 20, type: 'presence' },
    { id: 'act_reading_2', title: 'Sit with a book and tea in a quiet room for 15 minutes', minutes: 15, type: 'sanctuary' },
  ],
  Yoga: [
    { id: 'act_yoga_1', title: '15-minute gentle somatic stretch or restorative movement', minutes: 15, type: 'embodiment' },
    { id: 'act_yoga_2', title: '10 minutes of intentional posture and mindful breath', minutes: 10, type: 'embodiment' },
  ],
  Studies: [
    { id: 'act_studies_1', title: 'Study for 25 minutes using the focus timer', minutes: 25, type: 'focus' },
    { id: 'act_studies_2', title: 'Submit an assignment without checking it more than twice', minutes: 15, type: 'courage' },
  ],
  Photography: [
    { id: 'act_photo_1', title: 'Take 5 photographs of light and texture in your neighbourhood', minutes: 20, type: 'creativity' },
  ],
  Gaming: [
    { id: 'act_game_1', title: 'Play 30 minutes of a game purely for leisure with friends', minutes: 30, type: 'play' },
  ],
  Friends: [
    { id: 'act_friends_1', title: 'Meet or message a friend to ask how their day is going', minutes: 15, type: 'connection' },
    { id: 'act_friends_2', title: 'Go for a 20-minute walk with someone without discussing obsessions', minutes: 20, type: 'boundary' },
  ],
};

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;
    const path = event.path || '';

    if (method === 'GET' && !path.endsWith('/actions')) {
      // Return user values and curated micro-actions
      const decoded = requireAuth(event);

      // Fetch user profile to get chosen values
      let values = ['Career', 'Family', 'Reading', 'Yoga'];
      try {
        const userRes = await docClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: { PK: `USER#${decoded.userId}`, SK: 'PROFILE' },
          })
        );
        if (userRes.Item?.values && Array.isArray(userRes.Item.values) && userRes.Item.values.length > 0) {
          values = userRes.Item.values;
        }
      } catch { /* use defaults */ }

      // Build suggested daily plan from values
      const suggestedActions = [];
      values.forEach((val) => {
        const actions = CURATED_ACTIONS[val] || [
          { id: `act_${val.toLowerCase()}_1`, title: `Spend 15 minutes engaging in ${val.toLowerCase()}`, minutes: 15, type: 'value_action' },
        ];
        actions.forEach((a) => suggestedActions.push({ ...a, value: val }));
      });

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          data: {
            values,
            suggestedActions,
          },
        }),
      };
    }

    if (method === 'POST' && path.endsWith('/actions')) {
      // Log completion of a value action
      const decoded = requireAuth(event);
      const body = JSON.parse(event.body || '{}');
      const { value, actionTitle, durationMinutes, reflection } = body;

      if (!actionTitle) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'actionTitle is required.' } }),
        };
      }

      const timestamp = new Date().toISOString();
      const actionId = `VA_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      const item = {
        PK: `USER#${decoded.userId}`,
        SK: `VALUE_ACTION#${timestamp}#${actionId}`,
        entityType: 'ValueAction',
        actionId,
        userId: decoded.userId,
        value: value || 'General Wellbeing',
        actionTitle,
        durationMinutes: durationMinutes ? Number(durationMinutes) : 15,
        reflection: reflection || null,
        completedAt: timestamp,
        createdAt: timestamp,
      };

      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Value action logged successfully.', data: item }),
      };
    }

    if (method === 'GET' && path.endsWith('/actions')) {
      const decoded = requireAuth(event);

      const res = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
          ExpressionAttributeValues: {
            ':pk': `USER#${decoded.userId}`,
            ':skPrefix': 'VALUE_ACTION#',
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
    console.error('Values handler error:', err);
    return {
      statusCode: err.statusCode || 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'Internal server error' } }),
    };
  }
};
