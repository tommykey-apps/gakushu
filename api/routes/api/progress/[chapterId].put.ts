import { defineEventHandler, readBody, createError } from "h3";
import { docClient, TABLE_NAME } from "../../../utils/dynamo";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { UpdateProgressRequestSchema } from "../../../schemas/progress";

export default defineEventHandler(async (event) => {
  const userId = event.context.userId as string;
  const chapterId = event.context.params?.chapterId;

  if (!chapterId) {
    throw createError({ statusCode: 400, message: "chapterId is required" });
  }

  const body = await readBody(event);
  const parsed = UpdateProgressRequestSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.message });
  }

  const now = new Date().toISOString();
  const item = {
    pk: `USER#${userId}`,
    sk: `PROG#${chapterId}`,
    status: parsed.data.status,
    score: parsed.data.score,
    updatedAt: now,
    ...(parsed.data.status === "completed" && { completedAt: now }),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }),
  );

  return {
    chapterId,
    status: item.status,
    completedAt: item.completedAt,
    score: item.score,
    updatedAt: item.updatedAt,
  };
});
