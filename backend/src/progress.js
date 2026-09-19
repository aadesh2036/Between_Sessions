/**
 * Progress Handler
 * GET /api/v1/progress?range=7d|30d
 *
 * Returns time-series data for check-ins and practice events
 * grouped by calendar day, suitable for charting on the frontend.
 */

const jwt = require('jsonwebtoken');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

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

/** Build an array of ISO date strings for the last `days` days */
function buildDateRange(days) {
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED' } }) };
    }

    const decoded = requireAuth(event);
    const userId = decoded.userId;

    const qs = event.queryStringParameters || {};
    const range = qs.range || '7d';
    const days = range === '30d' ? 30 : 7;

    const now = new Date();
    const fromISO = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
    const toISO = now.toISOString();

    const [checkins, practiceEvents, journalEntries] = await Promise.all([
      queryWindow(userId, 'CHECKIN', fromISO, toISO),
      queryWindow(userId, 'PRACTICE', fromISO, toISO),
      queryWindow(userId, 'JOURNAL', fromISO, toISO),
    ]);

    const dateRange = buildDateRange(days);

    // Build per-day buckets
    const byDay = {};
    for (const d of dateRange) {
      byDay[d] = { date: d, avgSuds: null, sudsSum: 0, sudsCount: 0, practiceCount: 0, journalCount: 0 };
    }

    for (const c of checkins) {
      const d = c.createdAt?.slice(0, 10);
      if (byDay[d] && typeof c.sudsScore === 'number') {
        byDay[d].sudsSum += c.sudsScore;
        byDay[d].sudsCount++;
      }
    }

    for (const p of practiceEvents) {
      const d = (p.completedAt || p.createdAt)?.slice(0, 10);
      if (byDay[d]) byDay[d].practiceCount++;
    }

    for (const j of journalEntries) {
      const d = j.createdAt?.slice(0, 10);
      if (byDay[d]) byDay[d].journalCount++;
    }

    // Compute averages and clean up helper fields
    const timeline = dateRange.map(d => {
      const bucket = byDay[d];
      return {
        date: d,
        avgSuds: bucket.sudsCount > 0
          ? Math.round((bucket.sudsSum / bucket.sudsCount) * 10) / 10
          : null,
        practiceCount: bucket.practiceCount,
        journalCount: bucket.journalCount,
      };
    });

    // Summary totals
    const totalPractice = practiceEvents.length + journalEntries.filter(j => j.responseType).length;
    const allSuds = checkins.map(c => c.sudsScore).filter(s => typeof s === 'number');
    const avgSudsOverall = allSuds.length
      ? Math.round((allSuds.reduce((a, b) => a + b, 0) / allSuds.length) * 10) / 10
      : null;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        data: {
          range,
          days,
          timeline,
          summary: {
            totalPractice,
            totalCheckins: checkins.length,
            totalJournal: journalEntries.length,
            avgSudsOverall,
          },
        },
      }),
    };
  } catch (err) {
    if (err.statusCode) {
      return {
        statusCode: err.statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: { code: err.code, message: err.message } }),
      };
    }
    console.error('[progress]', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected error.' } }),
    };
  }
};
