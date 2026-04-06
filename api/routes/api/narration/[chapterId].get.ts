import { defineEventHandler, setResponseHeader, getValidatedRouterParams } from "h3";
import { docClient, TABLE_NAME } from "../../../utils/dynamo";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { invokeModel } from "../../../utils/bedrock";
import { synthesizeSpeech } from "../../../utils/polly";
import { ChapterIdParamsSchema } from "../../../schemas/params";

export default defineEventHandler(async (event) => {
  const { chapterId } = await getValidatedRouterParams(event, ChapterIdParamsSchema);

  // キャッシュを確認
  const cached = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { pk: `NARR#${chapterId}`, sk: "LANG#ja" },
    }),
  );

  if (cached.Item?.audioBase64) {
    setResponseHeader(event, "Content-Type", "audio/mpeg");
    return Buffer.from(cached.Item.audioBase64, "base64");
  }

  // ナレーションテキストを生成
  const system = "あなたはGPTの仕組みを解説するナレーターです。指定されたチャプターの内容をわかりやすく解説するナレーション原稿を生成してください。200文字程度で簡潔に。";
  const text = await invokeModel(system, [
    { role: "user", content: `チャプター「${chapterId}」のナレーション原稿を生成してください。` },
  ]);

  // 音声合成
  const audioBuffer = await synthesizeSpeech(text);
  const audioBase64 = audioBuffer.toString("base64");

  // キャッシュに保存
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        pk: `NARR#${chapterId}`,
        sk: "LANG#ja",
        text,
        audioBase64,
        createdAt: new Date().toISOString(),
      },
    }),
  );

  setResponseHeader(event, "Content-Type", "audio/mpeg");
  return audioBuffer;
});
