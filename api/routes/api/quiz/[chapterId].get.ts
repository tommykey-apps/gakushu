import { defineEventHandler, getValidatedRouterParams, createError } from "h3";
import { invokeModel } from "../../../utils/bedrock";
import { ChapterIdParamsSchema } from "../../../schemas/params";

export default defineEventHandler(async (event) => {
  const { chapterId } = await getValidatedRouterParams(event, ChapterIdParamsSchema);

  const system = `あなたはGPTの仕組みを教える教育AIです。指定されたチャプターに関するクイズを生成してください。
レスポンスは必ず以下のJSON形式で返してください:
{
  "questions": [
    {
      "id": "q1",
      "text": "問題文",
      "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "correctIndex": 0,
      "explanation": "解説"
    }
  ]
}`;

  let result: string;
  try {
    result = await invokeModel(system, [
      { role: "user", content: `チャプター「${chapterId}」に関するクイズを2問生成してください。` },
    ]);
  } catch {
    throw createError({ statusCode: 502, message: "Quiz generation failed" });
  }

  try {
    return JSON.parse(result);
  } catch {
    return { questions: [] };
  }
});
