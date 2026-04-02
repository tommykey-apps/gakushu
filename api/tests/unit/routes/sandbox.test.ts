import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../utils/bedrock", () => ({
  invokeModelStream: vi.fn(),
}));

vi.mock("h3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("h3")>();
  return {
    ...actual,
    readBody: vi.fn(),
    setResponseHeader: vi.fn(),
  };
});

import handler from "../../../routes/api/sandbox/explain.post";
import { invokeModelStream } from "../../../utils/bedrock";
import { readBody } from "h3";

describe("POST /api/sandbox/explain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a ReadableStream for valid request", async () => {
    async function* mockStream() {
      yield "Explanation ";
      yield "here";
    }
    vi.mocked(invokeModelStream).mockReturnValue(mockStream());
    vi.mocked(readBody).mockResolvedValue({
      text: "Hello world",
      mode: "tokenize",
    });

    const event = {
      context: { userId: "user-1" },
    } as any;

    const result = await handler(event);
    expect(result).toBeInstanceOf(ReadableStream);
  });

  it("uses default mode 'full' when not specified", async () => {
    async function* mockStream() {
      yield "test";
    }
    vi.mocked(invokeModelStream).mockReturnValue(mockStream());
    vi.mocked(readBody).mockResolvedValue({
      text: "Hello world",
    });

    const event = {
      context: { userId: "user-1" },
    } as any;

    const result = await handler(event);
    expect(result).toBeInstanceOf(ReadableStream);
    expect(invokeModelStream).toHaveBeenCalledOnce();
    // The system prompt should contain the "full" mode text
    const systemArg = vi.mocked(invokeModelStream).mock.calls[0][0];
    expect(systemArg).toContain("全プロセス");
  });

  it("throws 400 when text is missing", async () => {
    vi.mocked(readBody).mockResolvedValue({});

    const event = {
      context: { userId: "user-1" },
    } as any;

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("throws 400 when text is empty", async () => {
    vi.mocked(readBody).mockResolvedValue({ text: "" });

    const event = {
      context: { userId: "user-1" },
    } as any;

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("throws 400 when mode is invalid", async () => {
    vi.mocked(readBody).mockResolvedValue({
      text: "Hello",
      mode: "invalid_mode",
    });

    const event = {
      context: { userId: "user-1" },
    } as any;

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
