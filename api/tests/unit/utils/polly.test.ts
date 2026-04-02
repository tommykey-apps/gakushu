import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("polly utils", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env.POLLY_MOCK = "true";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("synthesizeSpeech (mock mode)", () => {
    it("returns a Buffer with mock audio data", async () => {
      const { synthesizeSpeech } = await import("../../../utils/polly");

      const result = await synthesizeSpeech("テストテキスト");
      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe("MOCK_AUDIO_DATA");
    });

    it("returns Buffer regardless of input text", async () => {
      const { synthesizeSpeech } = await import("../../../utils/polly");

      const result = await synthesizeSpeech("");
      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
