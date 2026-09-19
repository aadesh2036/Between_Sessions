/**
 * AI Weekly Summary Handler
 *
 * POST /api/v1/ai/weekly-summary  — Generate (or regenerate) this week's summary
 * GET  /api/v1/ai/weekly-summary  — Retrieve existing summary (optionally ?week=yyyy-mm-dd)
 *
 * AI posture rules (from PRD):
 *  - Summarise observed metrics only
 *  - No diagnosis, no causal claims, no medication advice
 *  - No individualized treatment plan
 *  - Always append a disclaimer
 *  - Every claim traceable to sourceMetricIds
 *
 * For the MVP demo, we construct the summary deterministically from the user's
 * own data rather than calling Bedrock, to avoid credentials in dev.
 * The shape is identical to what Bedrock would return.
 */

const jwt = require('jsonwebtoken');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

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

/** Monday of the ISO week containing `date` */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0 = Sunday
  const diff = (day === 0 ? -6 : 1 - day); // adjust so Monday = start
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

async function queryWindow(userId, skPrefix, fromISO, toISO) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND SK BETWEEN :skFrom AND :skTo',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':skFrom': `${skPrefix}#${fromISO}`,
        ':skTo': `${skPrefix}#${toISO}Z`,
      },
    })
  );
  return result.Items || [];
}

/**
 * Deterministic summary builder — mirrors what a Bedrock/Strands call would return.
 * All claims are grounded strictly in the supplied metrics.
 */
function buildSummary(weekStart, checkins, journalEntries, practiceEntries) {
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const weekEndStr = weekEnd.toISOString().slice(0, 10);

  const sudsValues = checkins.map(c => c.sudsScore).filter(n => typeof n === 'number');
  const avgSuds = sudsValues.length
    ? (sudsValues.reduce((a, b) => a + b, 0) / sudsValues.length).toFixed(1)
    : null;

  const practiceCount = practiceEntries.length + journalEntries.filter(j => j.responseType).length;

  const responseTypeCounts = {};
  for (const j of journalEntries) {
    if (j.responseType) {
      responseTypeCounts[j.responseType] = (responseTypeCounts[j.responseType] || 0) + 1;
    }
  }
  const topPattern = Object.entries(responseTypeCounts).sort((a, b) => b[1] - a[1])[0];

  const sentences = [];
  sentences.push(
    `Between ${weekStart} and ${weekEndStr} you logged ${checkins.length} check-in${checkins.length === 1 ? '' : 's'}.`
  );
  if (avgSuds !== null) {
    sentences.push(`Your average SUDS score across those check-ins was ${avgSuds} out of 10.`);
  }
  if (practiceCount > 0) {
    sentences.push(
      `You logged ${practiceCount} practice response${practiceCount === 1 ? '' : 's'} this week.`
    );
  } else {
    sentences.push(`No practice responses were recorded this week.`);
  }
  if (topPattern) {
    sentences.push(
      `The most frequently logged response type was "${topPattern[0]}" (${topPattern[1]} time${topPattern[1] === 1 ? '' : 's'}).`
    );
  }
  if (journalEntries.length > 0) {
    sentences.push(`You created ${journalEntries.length} behavioral log entr${journalEntries.length === 1 ? 'y' : 'ies'}.`);
  }

  return sentences.join(' ');
}

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;

    if (method === 'POST') {
      /* ── Generate / Regenerate weekly summary ─────────────────────────── */
      const decoded = requireAuth(event);
      const userId = decoded.userId;

      const weekStart = getWeekStart(new Date());
      const weekEndISO = new Date(weekStart + 'T00:00:00Z');
      weekEndISO.setUTCDate(weekEndISO.getUTCDate() + 7);

      const [checkins, journalEntries, practiceEntries] = await Promise.all([
        queryWindow(userId, 'CHECKIN', weekStart + 'T00:00:00.000Z', weekEndISO.toISOString()),
        queryWindow(userId, 'JOURNAL', weekStart + 'T00:00:00.000Z', weekEndISO.toISOString()),
        queryWindow(userId, 'PRACTICE', weekStart + 'T00:00:00.000Z', weekEndISO.toISOString()),
      ]);

      const summary = buildSummary(weekStart, checkins, journalEntries, practiceEntries);

      const sourceMetricIds = [
        ...checkins.map(c => c.SK),
        ...journalEntries.map(j => j.SK),
        ...practiceEntries.map(p => p.SK),
      ];

      const generatedAt = new Date().toISOString();
      const item = {
        PK: `USER#${userId}`,
        SK: `AI#WEEK#${weekStart}`,
        entityType: 'AIInsight',
        weekStart,
        summary,
        sourceMetricIds,
        model: 'rule-based-v1-mvp', // swap for bedrock-model-id in prod
        promptVersion: 'weekly-summary-v1',
        generatedAt,
        disclaimer: 'Synthesized from your logs — not medical advice.',
      };

      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Weekly summary generated.', data: item }),
      };
    }

    if (method === 'GET') {
      /* ── Retrieve weekly summary ─────────────────────────────────────── */
      const decoded = requireAuth(event);
      const userId = decoded.userId;
      const qs = event.queryStringParameters || {};
      const week = qs.week || getWeekStart(new Date());

      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND SK = :sk',
          ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':sk': `AI#WEEK#${week}`,
          },
        })
      );

      const item = result.Items?.[0] || null;
      if (!item) {
        return {
          statusCode: 404,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: { code: 'NOT_FOUND', message: 'No summary for this week. Generate one first.' } }),
        };
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ data: item }),
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
    console.error('[aiSummary]', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected error.' } }),
    };
  }
};
