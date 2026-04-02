import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

extendZodWithOpenApi(z);

import {
  ChapterProgressSchema,
  ProgressListResponseSchema,
  UpdateProgressRequestSchema,
} from "./schemas/progress";
import {
  QuizResponseSchema,
  QuizSubmitRequestSchema,
  QuizEvaluationSchema,
} from "./schemas/quiz";
import { TutorAskRequestSchema } from "./schemas/tutor";
import { NarrationResponseSchema } from "./schemas/narration";

const registry = new OpenAPIRegistry();

// Register schemas
registry.register("ChapterProgress", ChapterProgressSchema);
registry.register("ProgressListResponse", ProgressListResponseSchema);
registry.register("UpdateProgressRequest", UpdateProgressRequestSchema);
registry.register("QuizResponse", QuizResponseSchema);
registry.register("QuizSubmitRequest", QuizSubmitRequestSchema);
registry.register("QuizEvaluation", QuizEvaluationSchema);
registry.register("TutorAskRequest", TutorAskRequestSchema);
registry.register("NarrationResponse", NarrationResponseSchema);

// Auth
registry.registerPath({
  method: "get",
  path: "/api/auth/me",
  summary: "ユーザー情報取得",
  tags: ["Auth"],
  responses: {
    200: {
      description: "ユーザー情報",
      content: {
        "application/json": {
          schema: z.object({
            userId: z.string(),
            displayName: z.string().nullable(),
            createdAt: z.string(),
          }),
        },
      },
    },
  },
});

// Progress
registry.registerPath({
  method: "get",
  path: "/api/progress",
  summary: "全章の進捗一覧",
  tags: ["Progress"],
  responses: {
    200: {
      description: "進捗一覧",
      content: { "application/json": { schema: ProgressListResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/progress/{chapterId}",
  summary: "章の進捗更新",
  tags: ["Progress"],
  request: {
    params: z.object({ chapterId: z.string() }),
    body: {
      content: { "application/json": { schema: UpdateProgressRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "更新後の進捗",
      content: { "application/json": { schema: ChapterProgressSchema } },
    },
  },
});

// Quiz
registry.registerPath({
  method: "get",
  path: "/api/quiz/{chapterId}",
  summary: "クイズ生成",
  tags: ["Quiz"],
  request: { params: z.object({ chapterId: z.string() }) },
  responses: {
    200: {
      description: "クイズ問題",
      content: { "application/json": { schema: QuizResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/quiz/{chapterId}",
  summary: "クイズ回答提出・評価",
  tags: ["Quiz"],
  request: {
    params: z.object({ chapterId: z.string() }),
    body: {
      content: { "application/json": { schema: QuizSubmitRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "評価結果",
      content: { "application/json": { schema: QuizEvaluationSchema } },
    },
  },
});

// Tutor
registry.registerPath({
  method: "post",
  path: "/api/tutor/ask",
  summary: "AIチューターに質問 (SSE)",
  tags: ["Tutor"],
  request: {
    body: {
      content: { "application/json": { schema: TutorAskRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "SSE ストリーミングレスポンス",
      content: { "text/event-stream": { schema: z.string() } },
    },
  },
});

// Narration
registry.registerPath({
  method: "get",
  path: "/api/narration/{chapterId}",
  summary: "章のナレーション音声取得",
  tags: ["Narration"],
  request: { params: z.object({ chapterId: z.string() }) },
  responses: {
    200: {
      description: "音声データ",
      content: { "audio/mpeg": { schema: z.string() } },
    },
  },
});

// Sandbox
registry.registerPath({
  method: "post",
  path: "/api/sandbox/explain",
  summary: "テキスト解説 (SSE)",
  tags: ["Sandbox"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            text: z.string(),
            mode: z.enum(["tokenize", "attention", "generate", "full"]),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "SSE ストリーミングレスポンス",
      content: { "text/event-stream": { schema: z.string() } },
    },
  },
});

// Health
registry.registerPath({
  method: "get",
  path: "/health",
  summary: "ヘルスチェック",
  tags: ["System"],
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string(),
            timestamp: z.string(),
          }),
        },
      },
    },
  },
});

const generator = new OpenApiGeneratorV31(registry.definitions);
const doc = generator.generateDocument({
  openapi: "3.1.0",
  info: {
    title: "Gakushu API",
    version: "1.0.0",
    description: "GPT の仕組みをインタラクティブに学べる可視化学習サイト API",
  },
  servers: [
    { url: "http://localhost:3001", description: "ローカル開発" },
    { url: "https://api.gakushu.now", description: "本番" },
  ],
});

const outDir = resolve(__dirname, "../docs");
mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, "openapi.json");
writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log(`OpenAPI spec written to ${outPath}`);
