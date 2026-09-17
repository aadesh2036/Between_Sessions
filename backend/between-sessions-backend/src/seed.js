const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ endpoint: "http://localhost:8000", region: "local", credentials: { accessKeyId: "dummy", secretAccessKey: "dummy" } });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'BetweenSessionsTable';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function seed() {
  console.log("Creating DynamoDB Table...");
  try {
    await client.send(new CreateTableCommand({
      TableName: TABLE_NAME,
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' }
      ],
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    }));
    console.log("Table created.");
    await delay(2000); // Wait for table to be active
  } catch (err) {
    if (err.name === 'ResourceInUseException') {
      console.log("Table already exists. Proceeding to seed data...");
    } else {
      throw err;
    }
  }

  const timestamp = new Date().toISOString();
  
  // User 1: Just joined
  const newUserId = "usr_newbie123";
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${newUserId}`,
      SK: `PROFILE`,
      email: "new@betweensessions.com",
      onboardingCompleted: false,
      createdAt: timestamp
    }
  }));

  // User 2: Progress of some weeks
  const veteranId = "usr_veteran456";
  
  // Backdate events for veteran user over the last 3 weeks
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${veteranId}`,
      SK: `PROFILE`,
      email: "veteran@betweensessions.com",
      onboardingCompleted: true,
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
    }
  }));

  // Insert 3 historical practice events for veteran
  for (let i = 1; i <= 3; i++) {
    const historicalTime = new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000).toISOString();
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${veteranId}`,
        SK: `EVENT#${historicalTime}#EVT_HIST${i}`,
        type: 'BehaviorEvent',
        responseType: i % 2 === 0 ? 'resist' : 'delay',
        urgeLevel: 7 - i,
        occurredAt: historicalTime,
        createdAt: historicalTime
      }
    }));
  }

  // Insert Practitioner Connection & Consent for Cedar Auth demo
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${veteranId}`,
      SK: `CONNECTION#prac_123`,
      status: "ACTIVE",
      consentedCategories: ["PRACTICE_HISTORY", "FUNCTIONAL_IMPACT"]
    }
  }));

  console.log("Database successfully seeded with 2 users!");
}

seed().catch(console.error);
