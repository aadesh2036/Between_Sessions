const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ endpoint: "http://localhost:8000", region: "local", credentials: { accessKeyId: "dummy", secretAccessKey: "dummy" } });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'BetweenSessionsTable';

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, responseType, urgeLevel } = body;

    if (!userId || !responseType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const eventId = `EVT_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const timestamp = new Date().toISOString();

    const item = {
      PK: `USER#${userId}`,
      SK: `EVENT#${timestamp}#${eventId}`,
      type: 'BehaviorEvent',
      responseType,
      urgeLevel: urgeLevel || null,
      occurredAt: timestamp,
      createdAt: timestamp
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
