import { defineEventHandler, readValidatedBody, setResponseHeader } from "h3";
import { invokeModelStream } from "../../../utils/bedrock";
import { wrapUserInput, ANTI_INJECTION_INSTRUCTION } from "../../../utils/sanitize";
import { z } from "zod";

const ExplainRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  mode: z.enum(["tokenize", "attention", "generate", "full"]).default("full"),
});

export default defineEventHandler(async (event) => {
  const { text, mode } = await readValidatedBody(event, ExplainRequestSchema);

  const systemPrompts: Record<string, string> = {
    tokenize: "ユーザーが入力したテキストがどのようにトークン化されるか、ステップバイステップで解説してください。",
    attention: "ユーザーが入力したテキストに対して、Self-Attentionがどのように機能するか解説してください。",
    generate: "ユーザーが入力したテキストの続きをGPTがどのように生成するか、そのプロセスを解説してください。",
    full: "ユーザーが入力したテキストがGPTでどのように処理されるか、トークン化→埋め込み→Attention→生成の全プロセスを解説してください。",
  };

  const system = `あなたはGPTの仕組みを可視化して教える教育AIです。${systemPrompts[mode]}日本語で回答してください。
${ANTI_INJECTION_INSTRUCTION}`;

  // SSE streaming
  setResponseHeader(event, "Content-Type", "text/event-stream");
  setResponseHeader(event, "Cache-Control", "no-cache");
  setResponseHeader(event, "Connection", "keep-alive");

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of invokeModelStream(system, [
          { role: "user", content: `以下のテキストを解説してください: ${wrapUserInput(text)}` },
        ])) {
          const data = `data: ${JSON.stringify({ text: chunk })}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch {
        const errorData = `data: ${JSON.stringify({ error: "Internal server error" })}\n\n`;
        controller.enqueue(encoder.encode(errorData));
      } finally {
        controller.close();
      }
    },
  });

  return stream;
});
