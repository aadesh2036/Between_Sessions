const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ endpoint: "http://localhost:8000", region: "local", credentials: { accessKeyId: "dummy", secretAccessKey: "dummy" } });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'BetweenSessionsTable';

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const {
      userId,
      responseType,
      urgeLevel,
      exerciseId,
      preDistress,
      postDistress,
      durationSeconds,
      context,
      notes,
    } = body;

    if (!userId || !responseType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: userId and responseType required.' })
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
      Item: item
    }));

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Practice response logged successfully',
        data: item
      })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to log practice event' })
    };
  }
};
