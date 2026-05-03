# Access Patterns

gakushu は 4 エンティティ × 5 のアクセスパターン。Bedrock / Polly 統合のロジックは省き、
DynamoDB 操作のみ列挙。

## 一覧

| # | Use case | API | PK | SK condition | Filter | Source |
|---|---|---|---|---|---|---|
| 1 | ユーザープロフィール取得 | `GET /api/auth/me` | `USER#{u}` | `PROFILE` (eq) | - | [auth/me.get.ts:13](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/auth/me.get.ts#L13) |
| 2 | チャプター進捗一覧取得 | `GET /api/progress` | `USER#{u}` | `begins_with(PROG#)` | - | [progress/index.get.ts:11](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/progress/index.get.ts#L11) |
| 3 | チャプター進捗更新 | `PUT /api/progress/{chapterId}` | `USER#{u}` | `PROG#{chapterId}` (eq、上書き) | - | [progress/[chapterId].put.ts:24](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/progress/[chapterId].put.ts#L24) |
| 4 | クイズ結果保存 | `POST /api/quiz/{chapterId}` | `USER#{u}` | `QUIZ#{chapterId}#{now}` (履歴蓄積) | - | [quiz/[chapterId].post.ts:44](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/quiz/[chapterId].post.ts#L44) |
| 5a | ナレーションキャッシュ取得 | `GET /api/narration/{chapterId}` | `NARR#{chapterId}` | `LANG#ja` (eq) | - | [narration/[chapterId].get.ts:13](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/narration/[chapterId].get.ts#L13) |
| 5b | ナレーションキャッシュ保存 | (5a の cache miss 時) | `NARR#{chapterId}` | `LANG#ja` (上書き) | - | [narration/[chapterId].get.ts:51](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/narration/[chapterId].get.ts#L51) |

## DB 操作と Bedrock/Polly の関係

| API | DB 操作 | Bedrock | Polly |
|---|---|---|---|
| `GET /api/auth/me` | GetCommand | - | - |
| `GET /api/progress` | QueryCommand | - | - |
| `PUT /api/progress/{id}` | PutCommand | - | - |
| `POST /api/quiz/{id}` | PutCommand (評価結果保存) | invokeModel (回答評価) | - |
| `GET /api/narration/{id}` | GetCommand → cache miss なら PutCommand | invokeModel (原稿生成) | synthesizeSpeech (音声合成) |
| `GET /api/quiz/{id}` | (DB 操作なし) | invokeModel (問題生成) | - |
| `POST /api/sandbox/explain` | (DB 操作なし) | invokeModelStream | - |
| `POST /api/tutor/ask` | (DB 操作なし) | invokeModelStream | - |

## Anti-patterns / Known concerns

### A1. Quiz 履歴の SK timestamp による無限蓄積
`QUIZ#{chapterId}#{now}` で履歴を蓄積する設計のため、ヘビーユーザーで item 数が増え続ける。
削除/古いものの archive ロジックがない。

- 改善案: TTL 属性を活用 (例: 1 年で自動削除)、もしくは古い結果を `score` のみのサマリに集約

### A2. Narration cache の cache miss 時に競合の可能性
`GET /api/narration/{chapterId}` で同チャプターを複数ユーザーが同時に初回取得すると、
cache miss → Bedrock + Polly 並列実行 → PutCommand で同 SK を上書き、というレース。
最後の書き込みが勝つだけなので致命的ではないが、Bedrock コストが重複する。

- 改善案: ConditionExpression で `attribute_not_exists(pk)` を付けて初回書き込みのみ通す
  (現状はブラインド上書き、`narration/[chapterId].get.ts:51-58`)

### A3. Quiz の Bedrock 評価失敗時に空の保存
`Bedrock invokeModel` が失敗した場合、`evaluation = { score: 0, feedback: "評価の解析に失敗しました", corrections: [] }`
で fallback されてから DynamoDB に保存される ([quiz/[chapterId].post.ts:38-40](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/quiz/[chapterId].post.ts#L38))。
ユーザーから見ると 0 点履歴がたまる。

- 改善案: Bedrock 失敗時は保存せず 502 を返す (現状は空評価でも履歴に残る)

### A4. Progress の status 値が DB レベルで強制されない
`PutCommand` で渡す `status` は Zod (`UpdateProgressRequestSchema`) で `in_progress` / `completed` に制限されているが、
DB レイヤーでは制約なし。Schema 変更で値域が拡張されたら過去データと混在する可能性。

- 改善案: 列挙型を schemas/progress.ts で定義し、変更時は migration script で過去データ正規化
