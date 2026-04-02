import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../utils/dynamo", () => ({
  docClient: {
    send: vi.fn(),
  },
  TABLE_NAME: "gakushu-test",
}));

vi.mock("../../../utils/bedrock", () => ({
  invokeModel: vi.fn(),
}));

vi.mock("../../../utils/polly", () => ({
  synthesizeSpeech: vi.fn(),
}));

vi.mock("h3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("h3")>();
  return {
    ...actual,
    setResponseHeader: vi.fn(),
  };
});

import handler from "../../../routes/api/narration/[chapterId].get";
import { docClient } from "../../../utils/dynamo";
import { invokeModel } from "../../../utils/bedrock";
import { synthesizeSpeech } from "../../../utils/polly";

describe("GET /api/narration/:chapterId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns cached audio when available", async () => {
    const audioBase64 = Buffer.from("CACHED_AUDIO").toString("base64");
    vi.mocked(docClient.send).mockResolvedValue({
      Item: { audioBase64 },
    } as any);

    const event = {
      context: { params: { chapterId: "tokenization" } },
    } as any;

    const result = await handler(event);
    expect(result).toBeInstanceOf(Buffer);
    expect(invokeModel).not.toHaveBeenCalled();
    expect(synthesizeSpeech).not.toHaveBeenCalled();
  });

  it("generates and caches narration when not cached", async () => {
    // First call: cache miss
    vi.mocked(docClient.send)
      .mockResolvedValueOnce({ Item: undefined } as any) // GetCommand - no cache
      .mockResolvedValueOnce({} as any); // PutCommand - save cache

    vi.mocked(invokeModel).mockResolvedValue("ナレーションテキスト");
    const audioBuffer = Buffer.from("AUDIO_DATA");
    vi.mocked(synthesizeSpeech).mockResolvedValue(audioBuffer);

    const event = {
      context: { params: { chapterId: "tokenization" } },
    } as any;

    const result = await handler(event);
    expect(result).toEqual(audioBuffer);
    expect(invokeModel).toHaveBeenCalledOnce();
    expect(synthesizeSpeech).toHaveBeenCalledWith("ナレーションテキスト");
    // PutCommand should have been called to cache
    expect(docClient.send).toHaveBeenCalledTimes(2);
  });

  it("throws 400 when chapterId is missing", async () => {
    const event = {
      context: { params: {} },
    } as any;

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
