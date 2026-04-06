import { defineEventHandler, createError } from "h3";
import { docClient, TABLE_NAME } from "../../../utils/dynamo";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

export default defineEventHandler(async (event) => {
  const userId = event.context.userId as string;

  let result;
  try {
    result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: `USER#${userId}`, sk: "PROFILE" },
      }),
    );
  } catch {
    throw createError({ statusCode: 500, message: "Failed to fetch user profile" });
  }

  if (!result.Item) {
    return {
      userId,
      displayName: null,
      createdAt: new Date().toISOString(),
    };
  }

  return {
    userId,
    displayName: result.Item.displayName || null,
    createdAt: result.Item.createdAt,
  };
});
