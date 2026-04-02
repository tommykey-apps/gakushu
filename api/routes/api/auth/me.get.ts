import { defineEventHandler } from "h3";
import { docClient, TABLE_NAME } from "../../../utils/dynamo";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

export default defineEventHandler(async (event) => {
  const userId = event.context.userId as string;

  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { pk: `USER#${userId}`, sk: "PROFILE" },
    }),
  );

  if (!result.Item) {
    // 初回アクセス: プロフィールを自動作成
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
