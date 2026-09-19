/**
 * Practice Handler — Between Sessions
 *
 * POST /api/v1/practice        — Log a practice event / exposure trial
 * GET  /api/v1/practice        — Retrieve user's practice history
 * GET  /api/v1/practice/plans  — Retrieve active clinician-assigned & self-guided practice plans
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
const client = new DynamoDBClient({
  endpoint: ddbEndpoint,
  region: 'local',
  credentials: { accessKeyId: 'dummy', secretAccessKey: 'dummy' },
});
const docClient = DynamoDBDocumentClient.from(client);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

function getAuthUser(event) {
  const authHeader =
    event.headers?.authorization || event.headers?.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

const DEFAULT_PRACTICE_PLANS = [
  {
    id: 'plan-delay-checking',
    title: 'Delay Checking Ritual by 15–30 Minutes',
    type: 'self-guided',
    category: 'Response Prevention',
    difficulty: 'Moderate',
    targetObsession: 'Doubts about locks, switches, appliances, or sent messages',
    instructions: 'When the urge to check arises, set a 15-minute timer and deliberately return to your primary activity. Do not check until the timer rings.',
    targetUrge: 6,
  },
  {
    id: 'plan-uncertainty-email',
    title: 'Send Communications with a Single Review',
    type: 'self-guided',
    category: 'Inhibitory Learning',
    difficulty: 'Gentle',
    targetObsession: 'Fears of having made a catastrophic mistake, offending someone, or misspelling',
    instructions: 'Draft your text or email, read through it once only for factual clarity, and send it immediately. Tolerate the post-send urge to re-open.',
    targetUrge: 5,
  },
  {
    id: 'plan-contamination-habituation',
    title: 'Delay Handwashing After Touching Common Surface',
    type: 'self-guided',
    category: 'Exposure',
    difficulty: 'Moderate',
    targetObsession: 'Contamination fears after touching doorknobs, banisters, or keyboards',
    instructions: 'Touch the item normally, then sit with hands unwashed for 20 minutes while engaging in a values-aligned task.',
    targetUrge: 7,
  },
];

exports.handler = async (event) => {
  try {
    const method = event.httpMethod || 'POST';
    const path = event.path || '';
    const authUser = getAuthUser(event);

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const userId = body.userId || authUser?.userId;
      const {
        responseType,
        urgeLevel,
        exerciseId,
        preDistress,
        postDistress,
        durationSeconds,
        context,
        notes,
        targetObsession,
        practicePlanId,
      } = body;

      if (!userId || !responseType) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Missing required fields: userId and responseType required.' }),
        };
      }

      const eventId = `EVT_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const timestamp = new Date().toISOString();
      const isPrevented = ['delay', 'resist', 'return', 'continue'].includes(responseType);

      const item = {
        PK: `USER#${userId}`,
        SK: `PRACTICE#${timestamp}#${eventId}`,
        entityType: 'PracticeLog',
        type: 'BehaviorEvent',
        practiceId: eventId,
        eventId,
        userId,
        exerciseId: exerciseId || 'pause-and-choose',
        practicePlanId: practicePlanId || null,
        targetObsession: targetObsession || null,
        responseType,
        responsePrevented: isPrevented,
        urgeLevel: urgeLevel !== undefined ? Number(urgeLevel) : null,
        preDistress: preDistress !== undefined ? Number(preDistress) : null,
        postDistress: postDistress !== undefined ? Number(postDistress) : null,
        durationSeconds: durationSeconds !== undefined ? Number(durationSeconds) : null,
        context: context || 'home',
        notes: notes || null,
        completed: true,
        completedAt: timestamp,
        createdAt: timestamp,
      };

      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      }));

      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          message: 'Practice response logged successfully',
          data: item,
        }),
      };
    }

    if (method === 'GET' && path.endsWith('/plans')) {
      const userId = authUser?.userId || event.queryStringParameters?.userId;
      let clinicianPlans = [];

      if (userId) {
        // Look up active recommendations for this user to turn into clinician plans
        try {
          const recRes = await docClient.send(
            new QueryCommand({
              TableName: TABLE_NAME,
              KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
              ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':skPrefix': 'RECOMMENDATION#',
              },
              ScanIndexForward: false,
              Limit: 5,
            })
          );
          if (recRes.Items && recRes.Items.length > 0) {
            clinicianPlans = recRes.Items.map((rec) => ({
              id: rec.recommendationId || `rec_${rec.authoredAt}`,
              title: rec.nextStep || 'Clinician-Assigned Practice Protocol',
              type: 'clinician-assigned',
              category: 'Prescribed ERP Guideline',
              practitionerName: 'Dr. Kavita Mehra',
              difficulty: 'Clinician Guided',
              instructions: rec.observation ? `${rec.observation} — ${rec.nextStep}` : rec.nextStep,
              targetObsession: 'Active therapeutic target',
              authoredAt: rec.authoredAt,
              label: rec.label || 'Professional note — human authored',
            }));
          }
        } catch { /* proceed with defaults */ }
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          data: {
            clinicianPlans,
            selfGuidedPlans: DEFAULT_PRACTICE_PLANS,
          },
        }),
      };
    }

    if (method === 'GET') {
      const userId = authUser?.userId || event.queryStringParameters?.userId;
      if (!userId) {
        return {
          statusCode: 401,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Authentication required' }),
        };
      }

      const res = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
          ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':skPrefix': 'PRACTICE#',
          },
          ScanIndexForward: false,
          Limit: 50,
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
    console.error('Practice handler error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to process practice request', details: err.message }),
    };
  }
};
