import { defineEventHandler, readValidatedBody, getValidatedRouterParams } from "h3";
import { docClient, TABLE_NAME } from "../../../utils/dynamo";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { invokeModel } from "../../../utils/bedrock";
import { QuizSubmitRequestSchema } from "../../../schemas/quiz";
import { ChapterIdParamsSchema } from "../../../schemas/params";

export default defineEventHandler(async (event) => {
  const userId = event.context.userId as string;
  const { chapterId } = await getValidatedRouterParams(event, ChapterIdParamsSchema);
  const parsed = await readValidatedBody(event, QuizSubmitRequestSchema);

  const system = `あなたはGPTの仕組みを教える教育AIです。ユーザーのクイズ回答を評価してください。
レスポンスは必ず以下のJSON形式で返してください:
{
  "score": 80,
  "feedback": "フィードバック",
  "corrections": [{"questionId": "q1", "correct": true, "explanation": "解説"}]
}`;

  const result = await invokeModel(system, [
    {
      role: "user",
      content: `チャプター「${chapterId}」のクイズ回答を評価してください: ${JSON.stringify(parsed.answers)}`,
    },
  ]);

  let evaluation;
  try {
    evaluation = JSON.parse(result);
  } catch {
    evaluation = { score: 0, feedback: result, corrections: [] };
  }

  // クイズ結果を保存
  const now = new Date().toISOString();
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        pk: `USER#${userId}`,
        sk: `QUIZ#${chapterId}#${now}`,
        score: evaluation.score,
        answers: parsed.answers,
        feedback: evaluation.feedback,
        createdAt: now,
      },
    }),
  );

  return evaluation;
});
