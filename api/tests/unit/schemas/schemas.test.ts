import { describe, it, expect } from "vitest";
import {
  ChapterProgressSchema,
  UpdateProgressRequestSchema,
  ProgressListResponseSchema,
} from "../../../schemas/progress";
import {
  QuizQuestionSchema,
  QuizResponseSchema,
  QuizSubmitRequestSchema,
  QuizEvaluationSchema,
} from "../../../schemas/quiz";
import { TutorAskRequestSchema } from "../../../schemas/tutor";
import { NarrationResponseSchema } from "../../../schemas/narration";

describe("Progress schemas", () => {
  describe("UpdateProgressRequestSchema", () => {
    it("accepts valid status", () => {
      const result = UpdateProgressRequestSchema.safeParse({
        status: "completed",
        score: 80,
      });
      expect(result.success).toBe(true);
    });

    it("accepts status without score", () => {
      const result = UpdateProgressRequestSchema.safeParse({
        status: "in_progress",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid status", () => {
      const result = UpdateProgressRequestSchema.safeParse({
        status: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects score out of range", () => {
      const result = UpdateProgressRequestSchema.safeParse({
        status: "completed",
        score: 150,
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative score", () => {
      const result = UpdateProgressRequestSchema.safeParse({
        status: "completed",
        score: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ChapterProgressSchema", () => {
    it("accepts valid progress", () => {
      const result = ChapterProgressSchema.safeParse({
        chapterId: "tokenization",
        status: "completed",
        completedAt: "2025-01-01T00:00:00.000Z",
        score: 90,
        updatedAt: "2025-01-01T00:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("accepts progress without optional fields", () => {
      const result = ChapterProgressSchema.safeParse({
        chapterId: "attention",
        status: "not_started",
        updatedAt: "2025-01-01T00:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("ProgressListResponseSchema", () => {
    it("accepts empty progress list", () => {
      const result = ProgressListResponseSchema.safeParse({ progress: [] });
      expect(result.success).toBe(true);
    });
  });
});

describe("Quiz schemas", () => {
  describe("QuizQuestionSchema", () => {
    it("accepts valid question", () => {
      const result = QuizQuestionSchema.safeParse({
        id: "q1",
        text: "問題文",
        choices: ["A", "B", "C", "D"],
        correctIndex: 0,
        explanation: "解説",
      });
      expect(result.success).toBe(true);
    });

    it("rejects question with less than 2 choices", () => {
      const result = QuizQuestionSchema.safeParse({
        id: "q1",
        text: "問題文",
        choices: ["A"],
        correctIndex: 0,
        explanation: "解説",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("QuizSubmitRequestSchema", () => {
    it("accepts valid answers", () => {
      const result = QuizSubmitRequestSchema.safeParse({
        answers: [
          { questionId: "q1", selectedIndex: 0 },
          { questionId: "q2", selectedIndex: 2 },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("rejects non-array answers", () => {
      const result = QuizSubmitRequestSchema.safeParse({
        answers: "not-array",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("QuizEvaluationSchema", () => {
    it("accepts valid evaluation", () => {
      const result = QuizEvaluationSchema.safeParse({
        score: 80,
        feedback: "よくできました",
        corrections: [
          { questionId: "q1", correct: true, explanation: "正解" },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("rejects score above 100", () => {
      const result = QuizEvaluationSchema.safeParse({
        score: 101,
        feedback: "test",
        corrections: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("QuizResponseSchema", () => {
    it("accepts valid quiz response", () => {
      const result = QuizResponseSchema.safeParse({
        questions: [
          {
            id: "q1",
            text: "問題",
            choices: ["A", "B"],
            correctIndex: 0,
            explanation: "解説",
          },
        ],
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("Tutor schemas", () => {
  describe("TutorAskRequestSchema", () => {
    it("accepts valid request with all fields", () => {
      const result = TutorAskRequestSchema.safeParse({
        question: "Attention機構とは？",
        chapterId: "attention",
        context: "追加コンテキスト",
      });
      expect(result.success).toBe(true);
    });

    it("accepts request with only question", () => {
      const result = TutorAskRequestSchema.safeParse({
        question: "テスト質問",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty question", () => {
      const result = TutorAskRequestSchema.safeParse({
        question: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing question", () => {
      const result = TutorAskRequestSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

describe("Narration schemas", () => {
  describe("NarrationResponseSchema", () => {
    it("accepts valid narration response", () => {
      const result = NarrationResponseSchema.safeParse({
        chapterId: "tokenization",
        contentType: "audio/mpeg",
        text: "ナレーションテキスト",
        audioBase64: "base64data",
      });
      expect(result.success).toBe(true);
    });

    it("rejects wrong contentType", () => {
      const result = NarrationResponseSchema.safeParse({
        chapterId: "tokenization",
        contentType: "audio/wav",
        text: "テスト",
      });
      expect(result.success).toBe(false);
    });
  });
});
