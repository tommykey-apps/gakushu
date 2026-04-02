import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

const client = new PollyClient({
  region: process.env.AWS_REGION || "ap-northeast-1",
});

export async function synthesizeSpeech(text: string): Promise<Buffer> {
  if (process.env.POLLY_MOCK === "true") {
    // モック: 空の MP3 バッファを返す
    return Buffer.from("MOCK_AUDIO_DATA");
  }

  const command = new SynthesizeSpeechCommand({
    Text: text,
    OutputFormat: "mp3",
    VoiceId: "Mizuki", // 日本語女性音声
    Engine: "neural",
    LanguageCode: "ja-JP",
  });

  const response = await client.send(command);
  if (!response.AudioStream) {
    throw new Error("No audio stream returned from Polly");
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of response.AudioStream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
