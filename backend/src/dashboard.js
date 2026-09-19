/**
 * Dashboard Handler
 * GET /api/v1/dashboard
 *
 * Returns aggregated stats for the authenticated user:
 *   - thisWeekPractice  — practice responses in the last 7 days
 *   - checkinStreak     — consecutive days with at least one check-in
 *   - avgSudsThisWeek   — mean SUDS score over last 7 days
 *   - recentJournal     — latest 3 journal entries
 *   - recentCheckins    — latest 7 check-ins for sparkline
 *   - activePatterns    — most frequent responseTypes this week
 *   - lastSummaryDate   — ISO date of the most recent AI summary
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

/** Query all items of a given SK prefix within a date window */
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
      ScanIndexForward: false,
    })
  );
  return result.Items || [];
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED' } }) };
    }

    const decoded = requireAuth(event);
    const userId = decoded.userId;

    const now = new Date();
    const weekAgoISO = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch last 7 days in parallel
    const [checkins, journalEntries, practiceEntries, aiItems] = await Promise.all([
      queryWindow(userId, 'CHECKIN', weekAgoISO, now.toISOString()),
      queryWindow(userId, 'JOURNAL', weekAgoISO, now.toISOString()),
      queryWindow(userId, 'PRACTICE', weekAgoISO, now.toISOString()),
      // AI summary — no date filter needed, just get latest
      docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':prefix': 'AI#WEEK#',
        },
        ScanIndexForward: false,
        Limit: 1,
      })).then(r => r.Items || []),
    ]);

    // --- Aggregate stats ---

    // Weekly practice count (behavior events from practice.js + journal responses)
    const thisWeekPractice = practiceEntries.length;

    // Average SUDS
    const sudsValues = checkins.map(c => c.sudsScore).filter(s => typeof s === 'number');
    const avgSudsThisWeek = sudsValues.length
      ? Math.round((sudsValues.reduce((a, b) => a + b, 0) / sudsValues.length) * 10) / 10
      : null;

    // Check-in streak: count consecutive calendar days back from today
    const checkinDays = new Set(
      checkins.map(c => c.createdAt?.slice(0, 10))
    );
    let streak = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      if (checkinDays.has(d)) {
        streak++;
      } else {
        break;
      }
    }

    // Most active pattern (most frequent responseType in journal this week)
    const responseTypeCounts = {};
    for (const j of journalEntries) {
      if (j.responseType) {
        responseTypeCounts[j.responseType] = (responseTypeCounts[j.responseType] || 0) + 1;
      }
    }
    const activePatterns = Object.entries(responseTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));

    // Last 7 check-ins for sparkline (newest first already)
    const recentCheckins = checkins.slice(0, 7).map(c => ({
      date: c.createdAt?.slice(0, 10),
      sudsScore: c.sudsScore,
      urgeScore: c.urgeScore,
    }));

    // Last 3 journal entries for quick overview
    const recentJournal = journalEntries.slice(0, 3).map(j => ({
      entryId: j.entryId,
      trigger: j.trigger,
      responseType: j.responseType,
      urge: j.urge,
      tags: j.tags,
      createdAt: j.createdAt,
    }));

    const lastSummaryDate = aiItems[0]?.weekStart || null;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        data: {
          thisWeekPractice,
          checkinStreak: checkinDays.size,
          activeDaysThisWeek: checkinDays.size,
          checkinCountThisWeek: checkins.length,
          avgSudsThisWeek,
          recentCheckins,
          recentJournal,
          activePatterns,
          lastSummaryDate,
          totalJournalThisWeek: journalEntries.length,
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
    console.error('[dashboard]', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected error.' } }),
    };
  }
};
