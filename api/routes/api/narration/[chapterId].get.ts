import { defineEventHandler, setResponseHeader, getValidatedRouterParams, createError } from "h3";
import { docClient, TABLE_NAME } from "../../../utils/dynamo";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { invokeModel } from "../../../utils/bedrock";
import { synthesizeSpeech } from "../../../utils/polly";
import { ChapterIdParamsSchema } from "../../../schemas/params";

export default defineEventHandler(async (event) => {
  const { chapterId } = await getValidatedRouterParams(event, ChapterIdParamsSchema);

  // キャッシュを確認
  try {
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
  } catch {
    // キャッシュ読み取り失敗は無視して生成に進む
  }

  // ナレーションテキストを生成
  let text: string;
  try {
    const system = "あなたはGPTの仕組みを解説するナレーターです。指定されたチャプターの内容をわかりやすく解説するナレーション原稿を生成してください。200文字程度で簡潔に。";
    text = await invokeModel(system, [
      { role: "user", content: `チャプター「${chapterId}」のナレーション原稿を生成してください。` },
    ]);
  } catch {
    throw createError({ statusCode: 502, message: "Narration generation failed" });
  }

  // 音声合成
  let audioBuffer: Buffer;
  try {
    audioBuffer = await synthesizeSpeech(text);
  } catch {
    throw createError({ statusCode: 502, message: "Speech synthesis failed" });
  }

  // キャッシュに保存（失敗してもレスポンスは返す）
  const audioBase64 = audioBuffer.toString("base64");
  try {
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
  } catch {
    console.error(`Failed to cache narration for chapter ${chapterId}`);
  }

  setResponseHeader(event, "Content-Type", "audio/mpeg");
  return audioBuffer;
});
