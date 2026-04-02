import { DynamoDBClient, CreateTableCommand, DeleteTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_TABLE || "gakushu";
const ENDPOINT = process.env.DYNAMODB_ENDPOINT || "http://localhost:8000";

const client = new DynamoDBClient({
  region: "ap-northeast-1",
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
});

export async function setupTable(): Promise<void> {
  // Drop existing table if present
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    await client.send(new DeleteTableCommand({ TableName: TABLE_NAME }));
  } catch {
    // Table doesn't exist, that's fine
  }

  await client.send(
    new CreateTableCommand({
      TableName: TABLE_NAME,
      KeySchema: [
        { AttributeName: "pk", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" },
      ],
      AttributeDefinitions: [
        { AttributeName: "pk", AttributeType: "S" },
        { AttributeName: "sk", AttributeType: "S" },
      ],
      BillingMode: "PAY_PER_REQUEST",
    }),
  );
}

export async function teardownTable(): Promise<void> {
  try {
    await client.send(new DeleteTableCommand({ TableName: TABLE_NAME }));
  } catch {
    // Ignore if table doesn't exist
  }
}
