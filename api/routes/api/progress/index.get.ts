import { defineEventHandler, createError } from "h3";
import { docClient, TABLE_NAME } from "../../../utils/dynamo";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

export default defineEventHandler(async (event) => {
  const userId = event.context.userId as string;

  let result;
  try {
    result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":skPrefix": "PROG#",
        },
      }),
    );
  } catch {
    throw createError({ statusCode: 500, message: "Failed to fetch progress" });
  }

  const progress = (result.Items || []).map((item) => ({
    chapterId: item.sk.replace("PROG#", ""),
    status: item.status,
    completedAt: item.completedAt,
    score: item.score,
    updatedAt: item.updatedAt,
  }));

  return { progress };
});
