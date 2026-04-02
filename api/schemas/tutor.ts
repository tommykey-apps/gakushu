import { z } from "zod";

export const TutorAskRequestSchema = z.object({
  question: z.string().min(1).max(1000),
  chapterId: z.string().optional(),
  context: z.string().optional(),
});

export type TutorAskRequest = z.infer<typeof TutorAskRequestSchema>;
