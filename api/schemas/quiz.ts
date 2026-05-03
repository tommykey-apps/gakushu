import { z } from "zod";

export const QuizQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  choices: z.array(z.string()).min(2),
  correctIndex: z.number(),
  explanation: z.string(),
});

export const QuizResponseSchema = z
  .object({
    questions: z.array(QuizQuestionSchema),
  })
  .meta({ id: "QuizResponse" });

export const QuizSubmitRequestSchema = z
  .object({
    answers: z.array(
      z.object({
        questionId: z.string(),
        selectedIndex: z.number(),
      }),
    ),
  })
  .meta({ id: "QuizSubmitRequest" });

export const QuizEvaluationSchema = z
  .object({
    score: z.number().min(0).max(100),
    feedback: z.string(),
    corrections: z.array(
      z.object({
        questionId: z.string(),
        correct: z.boolean(),
        explanation: z.string().optional(),
      }),
    ),
  })
  .meta({ id: "QuizEvaluation" });

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizSubmitRequest = z.infer<typeof QuizSubmitRequestSchema>;
export type QuizEvaluation = z.infer<typeof QuizEvaluationSchema>;
