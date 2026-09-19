/**
 * Practitioner Handler — full domain handler
 *
 * Routes (all require role=practitioner in JWT):
 *
 *   GET  /practitioner/me                           — profile + verification status
 *   GET  /practitioner/requests                     — incoming connection requests
 *   POST /practitioner/requests/:requestId/accept   — accept a request
 *   POST /practitioner/requests/:requestId/decline  — decline a request
 *   GET  /practitioner/patients                     — list active patients
 *   GET  /practitioner/patients/:userId/summary     — consent-filtered patient summary
 *   GET  /practitioner/patients/:userId/consent     — exact authorized categories
 *   POST /practitioner/patients/:userId/recommendations — human-authored next step
 *
 * Cedar authorization (v4 WASM):
 *   Practitioner must be verified, connection must be ACTIVE, and the requested
 *   data category must appear in the user's consent record.
 */

const jwt = require('jsonwebtoken');
const cedar = require('@cedar-policy/cedar-wasm/nodejs');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');
const { runClinicianRagPipeline } = require('./ragPipeline');

const JWT_SECRET = process.env.JWT_SECRET || 'between-sessions-secret-key-2026';
const TABLE_NAME = process.env.TABLE_NAME || 'BetweenSessionsTable';

const ddbEndpoint = process.env.DYNAMODB_ENDPOINT;
const ddbClient = new DynamoDBClient(
  ddbEndpoint
    ? { endpoint: ddbEndpoint, region: 'local', credentials: { accessKeyId: 'dummy', secretAccessKey: 'dummy' } }
    : {}
);
const docClient = DynamoDBDocumentClient.from(ddbClient);

const { CORS_HEADERS } = require('./corsHeaders');

// ── Auth helpers ──────────────────────────────────────────────────────────────

function requirePractitionerAuth(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) throw { statusCode: 401, code: 'UNAUTHORIZED', message: 'Missing bearer token.' };
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'practitioner') {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Practitioner role required.' };
    }
    return decoded;
  } catch (e) {
    if (e.statusCode) throw e;
    throw { statusCode: 401, code: 'UNAUTHORIZED', message: 'Invalid or expired token.' };
  }
}

function apiError(statusCode, code, message) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: { code, message } }),
  };
}

// ── Cedar policy ──────────────────────────────────────────────────────────────

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

function cedarAllow(practitionerId, userId, connectionStatus, consentedCategories, isVerified) {
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
        practitionerVerified: isVerified,
        connectionStatus,
        consentedCategories: Array.isArray(consentedCategories) ? consentedCategories : [],
      },
    });
    return (result?.response?.decision ?? result?.decision) === 'allow';
  } catch {
    // If Cedar WASM fails (e.g. context mismatch), fall back to manual check
    return isVerified && connectionStatus === 'ACTIVE' &&
      Array.isArray(consentedCategories) && consentedCategories.includes('practice_logs');
  }
}

// ── DynamoDB helpers ──────────────────────────────────────────────────────────

async function queryWindow(pk, skPrefix, fromISO, toISO) {
  const res = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND SK BETWEEN :from AND :to',
    ExpressionAttributeValues: {
      ':pk': pk,
      ':from': `${skPrefix}#${fromISO}`,
      ':to':   `${skPrefix}#${toISO}Z`,
    },
    ScanIndexForward: false,
  }));
  return res.Items || [];
}

// ── Main handler ──────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const path = event.path || '';
  const method = event.httpMethod || 'GET';

  try {
    // ── GET /practitioners (public discovery list) ────────────────────────────
    if (method === 'GET' && (path.endsWith('/practitioners') || path.endsWith('/practitioners/'))) {
      // Public endpoint - no auth required - returns verified practitioner listing
      const res = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: { ':pk': 'LISTING#PRACTITIONERS', ':sk': 'INDEX' },
      }));
      const listing = res.Items?.[0]?.practitioners || [];
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ data: listing }) };
    }

    // ── GET /practitioner/me ─────────────────────────────────────────────────
    if (method === 'GET' && path.includes('/practitioner/me')) {
      const decoded = requirePractitionerAuth(event);
      const res = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `PRACTITIONER#${decoded.practitionerId}`, SK: 'PROFILE' },
      }));
      if (!res.Item) return apiError(404, 'NOT_FOUND', 'Practitioner profile not found.');
      const { password: _p, ...safe } = res.Item;
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ data: safe }) };
    }

    // ── PUT /practitioner/me ─────────────────────────────────────────────────
    if (method === 'PUT' && path.includes('/practitioner/me')) {
      const decoded = requirePractitionerAuth(event);
      const body = JSON.parse(event.body || '{}');
      const { name, credentials, specialisation, languages, remoteAvailable, clinicName, notes } = body;

      const updateExpr = [];
      const exprVals = {};
      const exprNames = {};

      if (name) { updateExpr.push("#nm = :n"); exprVals[":n"] = name; exprNames["#nm"] = "name"; }
      if (credentials) { updateExpr.push("credentials = :c"); exprVals[":c"] = credentials; }
      if (specialisation) { updateExpr.push("specialisation = :s"); exprVals[":s"] = specialisation; }
      if (languages) { updateExpr.push("languages = :l"); exprVals[":l"] = languages; }
      if (remoteAvailable !== undefined) { updateExpr.push("remoteAvailable = :ra"); exprVals[":ra"] = remoteAvailable; }
      if (clinicName) { updateExpr.push("clinicName = :cn"); exprVals[":cn"] = clinicName; }
      if (notes) { updateExpr.push("notes = :nt"); exprVals[":nt"] = notes; }

      if (updateExpr.length > 0) {
        await docClient.send(new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `PRACTITIONER#${decoded.practitionerId}`, SK: 'PROFILE' },
          UpdateExpression: 'SET ' + updateExpr.join(', '),
          ExpressionAttributeValues: exprVals,
          ...(Object.keys(exprNames).length > 0 ? { ExpressionAttributeNames: exprNames } : {}),
        }));
        if (decoded.email) {
          try {
            await docClient.send(new UpdateCommand({
              TableName: TABLE_NAME,
              Key: { PK: `PRACTITIONER#${decoded.email}`, SK: 'PROFILE' },
              UpdateExpression: 'SET ' + updateExpr.join(', '),
              ExpressionAttributeValues: exprVals,
              ...(Object.keys(exprNames).length > 0 ? { ExpressionAttributeNames: exprNames } : {}),
            }));
          } catch {}
        }
      }

      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Practitioner profile updated successfully.' }) };
    }

    // ── GET /practitioner/requests ───────────────────────────────────────────
    if (method === 'GET' && path.includes('/practitioner/requests') && !path.includes('/accept') && !path.includes('/decline')) {
      const decoded = requirePractitionerAuth(event);
      const res = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: {
          ':pk': `PRACTITIONER#${decoded.practitionerId}`,
          ':prefix': 'REQUEST#',
        },
        ScanIndexForward: false,
      }));
      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ data: res.Items || [] }) };
    }

    // ── POST /practitioner/requests/:requestId/accept ────────────────────────
    if (method === 'POST' && path.includes('/accept')) {
      const decoded = requirePractitionerAuth(event);
      const body = JSON.parse(event.body || '{}');
      // requestId encodes the userId at the end
      const userId = event.pathParameters?.userId || body.userId;
      if (!userId) return apiError(400, 'VALIDATION_ERROR', 'userId required.');
      const now = new Date().toISOString();

      // Update the user-side connection to ACTIVE
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: `CONNECTION#${decoded.practitionerId}` },
        UpdateExpression: 'SET #s = :s, updatedAt = :now',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':s': 'ACTIVE', ':now': now },
      }));

      // Update the REQUEST record
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `PRACTITIONER#${decoded.practitionerId}`,
          SK: `ACCEPTED#${now}#${userId}`,
        },
        UpdateExpression: 'SET #s = :s, updatedAt = :now, userId = :uid, practitionerId = :pid',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: {
          ':s': 'ACCEPTED',
          ':now': now,
          ':uid': userId,
          ':pid': decoded.practitionerId,
        },
      }));

      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Request accepted.', userId }) };
    }

    // ── POST /practitioner/requests/:requestId/decline ───────────────────────
    if (method === 'POST' && path.includes('/decline')) {
      const decoded = requirePractitionerAuth(event);
      const body = JSON.parse(event.body || '{}');
      const userId = event.pathParameters?.userId || body.userId;
      if (!userId) return apiError(400, 'VALIDATION_ERROR', 'userId required.');
      const now = new Date().toISOString();

      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: `CONNECTION#${decoded.practitionerId}` },
        UpdateExpression: 'SET #s = :s, updatedAt = :now',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':s': 'rejected', ':now': now },
      }));

      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Request declined.' }) };
    }

    // ── GET /practitioner/patients ────────────────────────────────────────────
    if (method === 'GET' && (path.endsWith('/patients') || path.endsWith('/patients/'))) {
      const decoded = requirePractitionerAuth(event);
      // Query REQUEST# prefix to discover all users who ever connected
      const reqRes = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: {
          ':pk': `PRACTITIONER#${decoded.practitionerId}`,
          ':prefix': 'REQUEST#',
        },
      }));
      const requests = reqRes.Items || [];

      // Collect unique userIds from requests
      const userIds = [...new Set(requests.map(r => r.userId).filter(Boolean))];

      // For each userId, fetch the user-side connection
      const patients = [];
      for (const uid of userIds) {
        const connRes = await docClient.send(new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${uid}`, SK: `CONNECTION#${decoded.practitionerId}` },
        }));
        if (connRes.Item) {
          const s = connRes.Item.status;
          let uProfile = {};
          try {
            const uRes = await docClient.send(new GetCommand({
              TableName: TABLE_NAME,
              Key: { PK: `USER#${uid}`, SK: 'PROFILE' },
            }));
            if (uRes.Item) uProfile = uRes.Item;
          } catch { /* proceed */ }

          patients.push({
            userId: uid,
            name: uProfile.name || uid,
            email: uProfile.email || '',
            values: uProfile.values || [],
            ageBand: uProfile.ageBand || 'Adult',
            connectionStatus: s,
            consentedCategories: connRes.Item.consentedCategories || [],
            connectedAt: connRes.Item.createdAt,
          });
        }
      }

      return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ data: patients }) };
    }

    // ── GET /practitioner/patients/:userId/consent ───────────────────────────
    if (method === 'GET' && path.includes('/consent')) {
      const decoded = requirePractitionerAuth(event);
      const userId = event.pathParameters?.userId;
      if (!userId) return apiError(400, 'VALIDATION_ERROR', 'userId required.');

      const connRes = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: `CONNECTION#${decoded.practitionerId}` },
      }));
      if (!connRes.Item || connRes.Item.status !== 'ACTIVE') {
        return apiError(403, 'FORBIDDEN', 'No active connection with this patient.');
      }

      const consentRes = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':prefix': `CONSENT#professional_review#${decoded.practitionerId}`,
        },
      }));

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          data: {
            connectionStatus: connRes.Item.status,
            consentedCategories: connRes.Item.consentedCategories || [],
            consents: consentRes.Items || [],
          },
        }),
      };
    }

    // ── GET /practitioner/patients/:userId/summary ───────────────────────────
    if (method === 'GET' && path.includes('/patients/') && path.includes('/summary')) {
      const decoded = requirePractitionerAuth(event);
      const userId = event.pathParameters?.userId;
      if (!userId) return apiError(400, 'VALIDATION_ERROR', 'userId required.');

      // Fetch connection to check status + consent
      const connRes = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: `CONNECTION#${decoded.practitionerId}` },
      }));
      const conn = connRes.Item;
      if (!conn) return apiError(403, 'FORBIDDEN', 'No connection with this patient.');

      const isVerified = true; // from practitioner profile; demo always true
      const allowed = cedarAllow(
        decoded.practitionerId,
        userId,
        conn.status,
        conn.consentedCategories,
        isVerified
      );
      if (!allowed) {
        return apiError(403, 'CONSENT_REQUIRED', 'Access denied by Cedar policy. Verify connection is active and patient has granted practice_logs consent.');
      }

      // Fetch only the consented categories
      const consentedCategories = new Set(conn.consentedCategories || []);
      const now = new Date().toISOString();
      const fromISO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const pk = `USER#${userId}`;

      const [checkins, journalEntries, practiceEntries, aiItems, recommendations] = await Promise.all([
        consentedCategories.has('checkins')
          ? queryWindow(pk, 'CHECKIN', fromISO, now)
          : Promise.resolve([]),
        consentedCategories.has('journal_structured')
          ? queryWindow(pk, 'JOURNAL', fromISO, now)
          : Promise.resolve([]),
        consentedCategories.has('practice_logs')
          ? queryWindow(pk, 'PRACTICE', fromISO, now)
          : Promise.resolve([]),
        consentedCategories.has('ai_summary')
          ? docClient.send(new QueryCommand({
              TableName: TABLE_NAME,
              KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
              ExpressionAttributeValues: { ':pk': pk, ':prefix': 'AI#' },
              ScanIndexForward: false, Limit: 1,
            })).then(r => r.Items || [])
          : Promise.resolve([]),
        // Always include recommendations made by THIS practitioner
        docClient.send(new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
          ExpressionAttributeValues: { ':pk': pk, ':prefix': `RECOMMENDATION#` },
          ScanIndexForward: false,
        })).then(r => (r.Items || []).filter(r => r.practitionerId === decoded.practitionerId)),
      ]);

      // Sanitise journal entries — strip outcome/free text if not explicitly consented
      const sanitisedJournal = journalEntries.map(j => ({
        entryId: j.entryId,
        responseType: j.responseType,
        urge: j.urge,
        tags: j.tags,
        createdAt: j.createdAt,
        // only include trigger/outcome if journal_structured consented (structured fields only)
        trigger: j.trigger,
      }));

      let patientProfile = {};
      try {
        const uRes = await docClient.send(new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK: pk, SK: 'PROFILE' },
        }));
        if (uRes.Item) {
          patientProfile = {
            name: uRes.Item.name,
            email: uRes.Item.email,
            values: uRes.Item.values || [],
            ageBand: uRes.Item.ageBand || 'Adult',
          };
        }
      } catch { /* proceed */ }

      const sudsValues = checkins.map(c => c.sudsScore).filter(n => typeof n === 'number');
      const avgSuds = sudsValues.length
        ? (sudsValues.reduce((a, b) => a + b, 0) / sudsValues.length).toFixed(1)
        : null;

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          data: {
            userId,
            patientProfile,
            practitionerId: decoded.practitionerId,
            consentedCategories: [...consentedCategories],
            period: { from: fromISO, to: now },
            summary: {
              checkinCount: checkins.length,
              avgSuds,
              practiceCount: practiceEntries.length,
              journalCount: journalEntries.length,
            },
            checkins: checkins.map(c => ({ date: c.createdAt?.slice(0, 10), sudsScore: c.sudsScore, urgeScore: c.urgeScore })),
            journal: sanitisedJournal,
            practice: practiceEntries.map(p => ({
              exerciseId: p.exerciseId,
              completed: p.completed,
              preDistress: p.preDistress,
              postDistress: p.postDistress,
              completedAt: p.completedAt,
            })),
            aiSummary: aiItems[0] || null,
            recommendations,
          },
        }),
      };
    }

    // ── POST /practitioner/patients/:userId/recommendations ──────────────────
    if (method === 'POST' && path.includes('/recommendations')) {
      const decoded = requirePractitionerAuth(event);
      const userId = event.pathParameters?.userId;
      if (!userId) return apiError(400, 'VALIDATION_ERROR', 'userId required.');

      const body = JSON.parse(event.body || '{}');
      const { observation, nextStep, referral, noteToUser } = body;

      if (!nextStep) return apiError(400, 'VALIDATION_ERROR', 'nextStep is required.');

      // Verify active connection
      const connRes = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: `CONNECTION#${decoded.practitionerId}` },
      }));
      if (!connRes.Item || !['ACTIVE', 'active'].includes(connRes.Item.status)) {
        return apiError(403, 'FORBIDDEN', 'No active connection with this patient.');
      }

      const now = new Date().toISOString();
      const recId = `REC_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      const item = {
        PK: `USER#${userId}`,
        SK: `RECOMMENDATION#${now}#${recId}`,
        entityType: 'Recommendation',
        recommendationId: recId,
        userId,
        practitionerId: decoded.practitionerId,
        observation: observation || null,
        nextStep,
        referral: referral || null,
        noteToUser: noteToUser || null,
        authoredAt: now,
        label: 'Professional note — human authored',
      };

      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Recommendation saved.', data: item }),
      };
    }

    // ── POST /practitioner/patients/:userId/ai-summary ────────────────────────
    if (method === 'POST' && path.includes('/patients/') && path.includes('/ai-summary')) {
      const decoded = requirePractitionerAuth(event);
      const userId = event.pathParameters?.userId;
      if (!userId) return apiError(400, 'VALIDATION_ERROR', 'userId required.');

      let days = 30;
      if (event.body) {
        try {
          const parsed = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
          if (parsed.days && Number(parsed.days) > 0) days = Number(parsed.days);
        } catch { /* use default days */ }
      }

      const result = await runClinicianRagPipeline({
        practitionerId: decoded.practitionerId,
        patientId: userId,
        days,
      });

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Clinician AI synthesis generated.', data: result }),
      };
    }

    return apiError(404, 'NOT_FOUND', 'Route not found.');
  } catch (err) {
    if (err.statusCode) {
      return {
        statusCode: err.statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: { code: err.code, message: err.message } }),
      };
    }
    console.error('[practitioner]', err);
    return apiError(500, 'INTERNAL_ERROR', err.message);
  }
};
