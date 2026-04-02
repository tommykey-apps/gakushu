import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { setupTable, teardownTable } from "./setup";

const TABLE_NAME = process.env.DYNAMODB_TABLE || "gakushu";
const TEST_USER_ID = process.env.DEV_USER_ID || "test-user";

const rawClient = new DynamoDBClient({
  region: "ap-northeast-1",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
});

const docClient = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: { removeUndefinedValues: true },
});

describe("Progress CRUD lifecycle (integration)", () => {
  beforeAll(async () => {
    await setupTable();
  });

  afterAll(async () => {
    await teardownTable();
  });

  it("creates, reads, updates, and lists progress items", async () => {
    // 1. Create progress (in_progress)
    const now1 = new Date().toISOString();
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          pk: `USER#${TEST_USER_ID}`,
          sk: "PROG#tokenization",
          status: "in_progress",
          updatedAt: now1,
        },
      }),
    );

    // 2. Read it back
    const getResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: `USER#${TEST_USER_ID}`, sk: "PROG#tokenization" },
      }),
    );
    expect(getResult.Item).toBeDefined();
    expect(getResult.Item!.status).toBe("in_progress");

    // 3. Update to completed with score
    const now2 = new Date().toISOString();
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          pk: `USER#${TEST_USER_ID}`,
          sk: "PROG#tokenization",
          status: "completed",
          score: 90,
          completedAt: now2,
          updatedAt: now2,
        },
      }),
    );

    // 4. Verify update
    const updated = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: `USER#${TEST_USER_ID}`, sk: "PROG#tokenization" },
      }),
    );
    expect(updated.Item!.status).toBe("completed");
    expect(updated.Item!.score).toBe(90);
    expect(updated.Item!.completedAt).toBeDefined();

    // 5. Add second progress item
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          pk: `USER#${TEST_USER_ID}`,
          sk: "PROG#attention",
          status: "not_started",
          updatedAt: new Date().toISOString(),
        },
      }),
    );

    // 6. List all progress for user
    const listResult = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
        ExpressionAttributeValues: {
          ":pk": `USER#${TEST_USER_ID}`,
          ":skPrefix": "PROG#",
        },
      }),
    );

    expect(listResult.Items).toHaveLength(2);
    const chapterIds = listResult.Items!.map((item) =>
      item.sk.replace("PROG#", ""),
    );
    expect(chapterIds).toContain("tokenization");
    expect(chapterIds).toContain("attention");
  });

  it("handles user profile creation and retrieval", async () => {
    // Create profile
    const now = new Date().toISOString();
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          pk: `USER#${TEST_USER_ID}`,
          sk: "PROFILE",
          displayName: "テストユーザー",
          createdAt: now,
        },
      }),
    );

    // Retrieve profile
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: `USER#${TEST_USER_ID}`, sk: "PROFILE" },
      }),
    );

    expect(result.Item).toBeDefined();
    expect(result.Item!.displayName).toBe("テストユーザー");
    expect(result.Item!.createdAt).toBe(now);
  });

  it("stores and retrieves quiz results", async () => {
    const now = new Date().toISOString();
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          pk: `USER#${TEST_USER_ID}`,
          sk: `QUIZ#tokenization#${now}`,
          score: 80,
          answers: [{ questionId: "q1", selectedIndex: 0 }],
          feedback: "よくできました",
          createdAt: now,
        },
      }),
    );

    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: `USER#${TEST_USER_ID}`, sk: `QUIZ#tokenization#${now}` },
      }),
    );

    expect(result.Item).toBeDefined();
    expect(result.Item!.score).toBe(80);
    expect(result.Item!.answers).toHaveLength(1);
  });

  it("stores and retrieves narration cache", async () => {
    const audioBase64 = Buffer.from("MOCK_AUDIO").toString("base64");
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          pk: "NARR#tokenization",
          sk: "LANG#ja",
          text: "ナレーションテキスト",
          audioBase64,
          createdAt: new Date().toISOString(),
        },
      }),
    );

    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: "NARR#tokenization", sk: "LANG#ja" },
      }),
    );

    expect(result.Item).toBeDefined();
    expect(result.Item!.text).toBe("ナレーションテキスト");
    expect(result.Item!.audioBase64).toBe(audioBase64);
  });
});
