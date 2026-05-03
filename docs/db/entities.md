# Entities

DynamoDB シングルテーブル `gakushu` には 4 種類の論理エンティティが PK/SK prefix で
区別されて格納される。User-scoped data (Profile / Progress / Quiz) は PK=`USER#{cognito_sub}` で
ユーザー分離、Narration cache は PK=`NARR#{chapterId}` でユーザー横断共有 (チャプター毎)。

## 一覧

| Entity | PK pattern | SK pattern | Source |
|---|---|---|---|
| User Profile | `USER#{cognito_sub}` | `PROFILE` (固定) | [auth/me.get.ts](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/auth/me.get.ts) |
| Progress | `USER#{cognito_sub}` | `PROG#{chapterId}` | [progress/[chapterId].put.ts](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/progress/[chapterId].put.ts) |
| Quiz Result | `USER#{cognito_sub}` | `QUIZ#{chapterId}#{ISO8601}` | [quiz/[chapterId].post.ts](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/quiz/[chapterId].post.ts) |
| Narration Cache | `NARR#{chapterId}` | `LANG#ja` (固定、言語別) | [narration/[chapterId].get.ts](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/narration/[chapterId].get.ts) |

---

## User Profile

Cognito 認証後にユーザーの表示名等を保持。各ユーザー 1 アイテム。

- **PK**: `USER#{cognito_sub}`
- **SK**: `PROFILE`

| Field | Type | Source |
|---|---|---|
| `displayName` | str \| null | [auth/me.get.ts:29](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/auth/me.get.ts#L29) |
| `createdAt` | str (ISO8601) | [auth/me.get.ts:30](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/auth/me.get.ts#L30) |

サンプル:
```json
{
  "pk": "USER#abc-123-cognito-sub",
  "sk": "PROFILE",
  "displayName": "山田 太郎",
  "createdAt": "2026-05-03T10:00:00.000Z"
}
```

---

## Progress

ユーザーごとのチャプター学習進捗。1 チャプター 1 アイテム (PUT で上書き)。

- **PK**: `USER#{cognito_sub}`
- **SK**: `PROG#{chapterId}` (chapterId は 1〜5、`schemas/params.ts` の regex `^[1-5]$` で検証)

| Field | Type | Source |
|---|---|---|
| `status` | str (`in_progress` / `completed`) | [progress/[chapterId].put.ts:14](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/progress/[chapterId].put.ts#L14) |
| `score` | int | [progress/[chapterId].put.ts:15](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/progress/[chapterId].put.ts#L15) |
| `updatedAt` | str (ISO8601) | [progress/[chapterId].put.ts:16](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/progress/[chapterId].put.ts#L16) |
| `completedAt` | str (ISO8601、status=completed のときのみ) | [progress/[chapterId].put.ts:17](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/progress/[chapterId].put.ts#L17) |

サンプル:
```json
{
  "pk": "USER#abc-123",
  "sk": "PROG#3",
  "status": "completed",
  "score": 85,
  "updatedAt": "2026-05-03T10:30:00.000Z",
  "completedAt": "2026-05-03T10:30:00.000Z"
}
```

---

## Quiz Result

クイズ提出ごとに新規アイテム作成 (履歴として残る、上書きしない)。SK に timestamp を含むので
同チャプターの複数回提出が並ぶ。

- **PK**: `USER#{cognito_sub}`
- **SK**: `QUIZ#{chapterId}#{ISO8601_now}`

| Field | Type | Source |
|---|---|---|
| `score` | int (Bedrock 評価) | [quiz/[chapterId].post.ts:49](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/quiz/[chapterId].post.ts#L49) |
| `answers` | array (回答配列) | [quiz/[chapterId].post.ts:50](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/quiz/[chapterId].post.ts#L50) |
| `feedback` | str (Bedrock 生成) | [quiz/[chapterId].post.ts:51](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/quiz/[chapterId].post.ts#L51) |
| `createdAt` | str (ISO8601、SK timestamp と同値) | [quiz/[chapterId].post.ts:52](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/quiz/[chapterId].post.ts#L52) |

サンプル:
```json
{
  "pk": "USER#abc-123",
  "sk": "QUIZ#3#2026-05-03T10:30:00.000Z",
  "score": 80,
  "answers": [{"questionId": "q1", "answer": "..."}],
  "feedback": "良い理解です...",
  "createdAt": "2026-05-03T10:30:00.000Z"
}
```

評価は AWS Bedrock 経由 (`utils/bedrock.ts` の `invokeModel`)。

---

## Narration Cache

チャプター毎のナレーション (テキスト + 合成音声 base64) のキャッシュ。**PK が `NARR#` で
ユーザー横断共有** (User-scoped ではない、Bedrock + Polly コスト削減のため)。
TTL 設定で期限切れ自動削除可能だが現状 `ttl` 属性は使われていない (cache miss で再生成)。

- **PK**: `NARR#{chapterId}`
- **SK**: `LANG#ja` (将来の多言語対応で `LANG#en` 等を追加可能)

| Field | Type | Source |
|---|---|---|
| `text` | str (Bedrock 生成のナレーション原稿) | [narration/[chapterId].get.ts:55](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/narration/[chapterId].get.ts#L55) |
| `audioBase64` | str (Polly 合成音声、base64) | [narration/[chapterId].get.ts:56](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/narration/[chapterId].get.ts#L56) |
| `createdAt` | str (ISO8601) | [narration/[chapterId].get.ts:57](https://github.com/tommykey-apps/gakushu/blob/main/api/routes/api/narration/[chapterId].get.ts#L57) |

サンプル (audioBase64 は省略):
```json
{
  "pk": "NARR#3",
  "sk": "LANG#ja",
  "text": "Embedding はトークンを高次元ベクトルに変換する...",
  "audioBase64": "//OEZAB...",
  "createdAt": "2026-05-03T10:00:00.000Z"
}
```

## 設計意図

- **ユーザー分離**: 学習データ (Profile / Progress / Quiz) は `USER#{cognito_sub}` PK でテナント境界
- **Narration はユーザー横断共有**: AI 生成コスト (Bedrock + Polly) が高いので全ユーザーで共有
- **Quiz は履歴保存**: SK に timestamp 含めて上書きせず、後から評価推移を分析可能
- **Progress は最新のみ**: 同 chapter の進捗は上書き、履歴は Quiz 側で保持
- **TTL 属性**: テーブルとしては有効だが、現在使用しているアイテムはなし (将来 Narration cache 期限切れで利用可能)
