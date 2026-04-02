import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../utils/dynamo", () => ({
  docClient: {
    send: vi.fn(),
  },
  TABLE_NAME: "gakushu-test",
}));

vi.mock("h3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("h3")>();
  return {
    ...actual,
    readBody: vi.fn(),
  };
});

import getHandler from "../../../routes/api/progress/index.get";
import putHandler from "../../../routes/api/progress/[chapterId].put";
import { docClient } from "../../../utils/dynamo";
import { readBody } from "h3";

describe("GET /api/progress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty progress list when no items", async () => {
    vi.mocked(docClient.send).mockResolvedValue({ Items: [] } as any);

    const event = { context: { userId: "user-1" } } as any;
    const result = await getHandler(event);
    expect(result).toEqual({ progress: [] });
  });

  it("returns mapped progress items", async () => {
    vi.mocked(docClient.send).mockResolvedValue({
      Items: [
        {
          sk: "PROG#tokenization",
          status: "completed",
          completedAt: "2025-01-01T00:00:00.000Z",
          score: 90,
          updatedAt: "2025-01-01T00:00:00.000Z",
        },
        {
          sk: "PROG#attention",
          status: "in_progress",
          updatedAt: "2025-01-02T00:00:00.000Z",
        },
      ],
    } as any);

    const event = { context: { userId: "user-1" } } as any;
    const result = await getHandler(event);
    expect(result.progress).toHaveLength(2);
    expect(result.progress[0]).toEqual({
      chapterId: "tokenization",
      status: "completed",
      completedAt: "2025-01-01T00:00:00.000Z",
      score: 90,
      updatedAt: "2025-01-01T00:00:00.000Z",
    });
    expect(result.progress[1].chapterId).toBe("attention");
  });

  it("handles undefined Items gracefully", async () => {
    vi.mocked(docClient.send).mockResolvedValue({ Items: undefined } as any);

    const event = { context: { userId: "user-1" } } as any;
    const result = await getHandler(event);
    expect(result).toEqual({ progress: [] });
  });
});

describe("PUT /api/progress/:chapterId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves progress and returns updated item", async () => {
    vi.mocked(docClient.send).mockResolvedValue({} as any);
    vi.mocked(readBody).mockResolvedValue({ status: "completed", score: 85 });

    const event = {
      context: { userId: "user-1", params: { chapterId: "tokenization" } },
    } as any;

    const result = await putHandler(event);
    expect(result).toMatchObject({
      chapterId: "tokenization",
      status: "completed",
      score: 85,
    });
    expect(result.completedAt).toBeDefined();
    expect(result.updatedAt).toBeDefined();
  });

  it("throws 400 when chapterId is missing", async () => {
    const event = {
      context: { userId: "user-1", params: {} },
    } as any;

    await expect(putHandler(event)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("throws 400 when body validation fails", async () => {
    vi.mocked(readBody).mockResolvedValue({ status: "invalid_status" });

    const event = {
      context: { userId: "user-1", params: { chapterId: "tokenization" } },
    } as any;

    await expect(putHandler(event)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
