import { defineEventHandler, readValidatedBody, getValidatedRouterParams } from "h3";
import { docClient, TABLE_NAME } from "../../../utils/dynamo";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { UpdateProgressRequestSchema } from "../../../schemas/progress";
import { ChapterIdParamsSchema } from "../../../schemas/params";

export default defineEventHandler(async (event) => {
  const userId = event.context.userId as string;
  const { chapterId } = await getValidatedRouterParams(event, ChapterIdParamsSchema);
  const parsed = await readValidatedBody(event, UpdateProgressRequestSchema);

  const now = new Date().toISOString();
  const item = {
    pk: `USER#${userId}`,
    sk: `PROG#${chapterId}`,
    status: parsed.status,
    score: parsed.score,
    updatedAt: now,
    ...(parsed.status === "completed" && { completedAt: now }),
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
