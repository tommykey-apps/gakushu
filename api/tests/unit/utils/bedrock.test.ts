import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("bedrock utils", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env.BEDROCK_MOCK = "true";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("invokeModel (mock mode)", () => {
    it("returns quiz JSON when message contains 'quiz'", async () => {
      const { invokeModel } = await import("../../../utils/bedrock");

      const result = await invokeModel("system prompt", [
        { role: "user", content: "quizを生成してください" },
      ]);

      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty("questions");
      expect(parsed.questions).toBeInstanceOf(Array);
      expect(parsed.questions.length).toBeGreaterThan(0);
      expect(parsed.questions[0]).toHaveProperty("id");
      expect(parsed.questions[0]).toHaveProperty("text");
      expect(parsed.questions[0]).toHaveProperty("choices");
      expect(parsed.questions[0]).toHaveProperty("correctIndex");
    });

    it("returns evaluation JSON when message contains 'evaluate'", async () => {
      const { invokeModel } = await import("../../../utils/bedrock");

      const result = await invokeModel("system prompt", [
        { role: "user", content: "回答をevaluateしてください" },
      ]);

      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty("score");
      expect(parsed).toHaveProperty("feedback");
      expect(typeof parsed.score).toBe("number");
    });

    it("returns default GPT explanation for generic messages", async () => {
      const { invokeModel } = await import("../../../utils/bedrock");

      const result = await invokeModel("system prompt", [
        { role: "user", content: "GPTについて教えてください" },
      ]);

      expect(result).toContain("Transformer");
      expect(typeof result).toBe("string");
    });
  });

  describe("invokeModelStream (mock mode)", () => {
    it("yields chunks of text", async () => {
      const { invokeModelStream } = await import("../../../utils/bedrock");

      const chunks: string[] = [];
      for await (const chunk of invokeModelStream("system", [
        { role: "user", content: "explain" },
      ])) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(0);
      const fullText = chunks.join("");
      expect(fullText).toContain("Transformer");
    });
  });
});
