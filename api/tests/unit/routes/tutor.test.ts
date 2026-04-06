import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../utils/bedrock", () => ({
  invokeModelStream: vi.fn(),
}));

vi.mock("h3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("h3")>();
  return {
    ...actual,
    readValidatedBody: vi.fn(),
    setResponseHeader: vi.fn(),
  };
});

import handler from "../../../routes/api/tutor/ask.post";
import { invokeModelStream } from "../../../utils/bedrock";
import { readValidatedBody } from "h3";

describe("POST /api/tutor/ask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a ReadableStream for valid request", async () => {
    async function* mockStream() {
      yield "Hello ";
      yield "World";
    }
    vi.mocked(invokeModelStream).mockReturnValue(mockStream());
    vi.mocked(readValidatedBody).mockResolvedValue({
      question: "Attention機構とは？",
      chapterId: "attention",
    });

    const event = {
      context: { userId: "user-1" },
    } as any;

    const result = await handler(event);
    expect(result).toBeInstanceOf(ReadableStream);
  });

  it("throws 400 when validation fails", async () => {
    vi.mocked(readValidatedBody).mockRejectedValue(
      Object.assign(new Error("Validation failed"), { statusCode: 400 }),
    );

    const event = {
      context: { userId: "user-1" },
    } as any;

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
