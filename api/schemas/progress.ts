import { z } from "zod";

export const ChapterProgressSchema = z.object({
  chapterId: z.string(),
  status: z.enum(["not_started", "in_progress", "completed"]),
  completedAt: z.string().optional(),
  score: z.number().min(0).max(100).optional(),
  updatedAt: z.string(),
});

export const ProgressListResponseSchema = z.object({
  progress: z.array(ChapterProgressSchema),
});

export const UpdateProgressRequestSchema = z.object({
  status: z.enum(["not_started", "in_progress", "completed"]),
  score: z.number().min(0).max(100).optional(),
});

export const UpdateProgressResponseSchema = ChapterProgressSchema;

export type ChapterProgress = z.infer<typeof ChapterProgressSchema>;
export type UpdateProgressRequest = z.infer<typeof UpdateProgressRequestSchema>;
