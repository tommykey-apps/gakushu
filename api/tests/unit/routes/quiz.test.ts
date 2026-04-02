import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../utils/bedrock", () => ({
  invokeModel: vi.fn(),
}));

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

import getHandler from "../../../routes/api/quiz/[chapterId].get";
import postHandler from "../../../routes/api/quiz/[chapterId].post";
import { invokeModel } from "../../../utils/bedrock";
import { readBody } from "h3";

describe("GET /api/quiz/:chapterId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns parsed quiz questions from Bedrock", async () => {
    const mockQuiz = {
      questions: [
        {
          id: "q1",
          text: "テスト問題",
          choices: ["A", "B", "C", "D"],
          correctIndex: 0,
          explanation: "解説",
        },
      ],
    };
    vi.mocked(invokeModel).mockResolvedValue(JSON.stringify(mockQuiz));

    const event = {
      context: { userId: "user-1", params: { chapterId: "tokenization" } },
    } as any;

    const result = await getHandler(event);
    expect(result).toEqual(mockQuiz);
    expect(invokeModel).toHaveBeenCalledOnce();
  });

  it("returns raw result when JSON parse fails", async () => {
    vi.mocked(invokeModel).mockResolvedValue("not json");

    const event = {
      context: { userId: "user-1", params: { chapterId: "tokenization" } },
    } as any;

    const result = await getHandler(event);
    expect(result).toEqual({ questions: [], raw: "not json" });
  });

  it("throws 400 when chapterId is missing", async () => {
    const event = {
      context: { params: {} },
    } as any;

    await expect(getHandler(event)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});

describe("POST /api/quiz/:chapterId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("evaluates quiz answers and saves result", async () => {
    const mockEval = {
      score: 80,
      feedback: "よくできました",
      corrections: [],
    };
    vi.mocked(invokeModel).mockResolvedValue(JSON.stringify(mockEval));
    vi.mocked(readBody).mockResolvedValue({
      answers: [{ questionId: "q1", selectedIndex: 0 }],
    });

    const { docClient } = await import("../../../utils/dynamo");
    vi.mocked(docClient.send).mockResolvedValue({} as any);

    const event = {
      context: { userId: "user-1", params: { chapterId: "tokenization" } },
    } as any;

    const result = await postHandler(event);
    expect(result).toMatchObject({ score: 80, feedback: "よくできました" });
    expect(docClient.send).toHaveBeenCalledOnce();
  });

  it("throws 400 when chapterId is missing", async () => {
    const event = {
      context: { userId: "user-1", params: {} },
    } as any;

    await expect(postHandler(event)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("throws 400 when body validation fails", async () => {
    vi.mocked(readBody).mockResolvedValue({ answers: "invalid" });

    const event = {
      context: { userId: "user-1", params: { chapterId: "tokenization" } },
    } as any;

    await expect(postHandler(event)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
