import { defineEventHandler, readValidatedBody, setResponseHeader } from "h3";
import { invokeModelStream } from "../../../utils/bedrock";
import { TutorAskRequestSchema } from "../../../schemas/tutor";

export default defineEventHandler(async (event) => {
  const { question, chapterId, context } = await readValidatedBody(event, TutorAskRequestSchema);

  const system = `あなたはGPTの仕組みを教える優秀なAIチューターです。
ユーザーの質問に対して、わかりやすく丁寧に回答してください。
${chapterId ? `現在のチャプター: ${chapterId}` : ""}
${context ? `コンテキスト: ${context}` : ""}
日本語で回答してください。`;

  // SSE streaming
  setResponseHeader(event, "Content-Type", "text/event-stream");
  setResponseHeader(event, "Cache-Control", "no-cache");
  setResponseHeader(event, "Connection", "keep-alive");

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of invokeModelStream(system, [
          { role: "user", content: question },
        ])) {
          const data = `data: ${JSON.stringify({ text: chunk })}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        const errorData = `data: ${JSON.stringify({ error: "Internal server error" })}\n\n`;
        controller.enqueue(encoder.encode(errorData));
      } finally {
        controller.close();
      }
    },
  });

  return stream;
});
