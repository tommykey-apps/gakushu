# Gakushu

AWS ポートフォリオ 4つ目。GPT の仕組みをインタラクティブに学べる可視化学習サイト。

## プロジェクト構成

```
gakushu/
├── api/          # TypeScript + H3/Nitro スタンドアロン API
├── web/          # Nuxt 4 + Nuxt UI + Tailwind CSS v4
├── infra/        # Terraform (Cognito, DynamoDB, Bedrock, Polly, CloudFront, Lambda, WAF)
├── docs/         # 構成図 + OpenAPI
└── .github/      # CI/CD
```

## 開発環境

**flox を使う。** `flox activate` で Node.js, pnpm, Terraform 等が使える。
DynamoDB Local は docker-compose で自動起動。

## パッケージマネージャ

pnpm (npm は使わない)

## コマンド

### API
```bash
cd api && pnpm install
cd api && pnpm dev          # ローカル起動 (port 3001)
cd api && pnpm test         # テスト
cd api && pnpm build        # ビルド (.output/)
```

### Web
```bash
cd web && pnpm install
cd web && pnpm dev          # ローカル起動 (port 3000)
cd web && pnpm build        # ビルド
cd web && pnpm check        # 型チェック
```

### Infra
```bash
cd infra && terraform init
cd infra && terraform plan
cd infra && terraform apply
cd infra && terraform destroy
```

## ドメイン

gakushu.now (独自ドメイン。他プロジェクトの *.tommykeyapp.com とは別)

## デプロイルール

デプロイは **必ず GitHub Actions CD パイプライン経由** で行う。
- `terraform apply` はローカルで実行しない (CD のみ)
- `aws lambda update-function-code` はローカルで実行しない
- `aws s3 sync` はローカルで実行しない
- ローカルで許可されるのは `terraform plan`, `terraform validate`, state 操作のみ
- `/deploy status` でCD実行状況を確認、`/deploy trigger` で手動発火

## AWS リージョン

ap-northeast-1 (東京)

## 環境変数

```bash
DYNAMODB_ENDPOINT=http://localhost:8000
DYNAMODB_TABLE=gakushu
AWS_REGION=ap-northeast-1
DEV_USER_ID=local-dev-user
BEDROCK_MOCK=true
POLLY_MOCK=true
```
