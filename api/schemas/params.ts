import { z } from "zod";

export const ChapterIdParamsSchema = z.object({
  chapterId: z.string().regex(/^[1-5]$/, "chapterId must be 1-5"),
});
