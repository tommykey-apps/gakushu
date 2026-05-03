import { z } from "zod";

export const NarrationResponseSchema = z
  .object({
    chapterId: z.string(),
    audioUrl: z.string().optional(),
    audioBase64: z.string().optional(),
    contentType: z.literal("audio/mpeg"),
    text: z.string(),
  })
  .meta({ id: "NarrationResponse" });

export type NarrationResponse = z.infer<typeof NarrationResponseSchema>;
