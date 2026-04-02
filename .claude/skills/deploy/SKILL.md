---
name: deploy
description: CD パイプライン経由でデプロイする。直接 aws コマンドやローカル terraform apply でのデプロイは禁止。
disable-model-invocation: true
user-invocable: true
allowed-tools: Bash, Read
argument-hint: status|trigger|secrets
---

# Deploy via CD Pipeline

デプロイは **必ず GitHub Actions CD パイプライン経由** で行う。
ローカルからの `terraform apply`、`aws lambda update-function-code`、`aws s3 sync` は禁止。

## 原則

- **デプロイ = main ブランチへの push、または workflow_dispatch**
- ローカル terraform は `plan` と `validate` のみ許可（`apply` は CD のみ）
- terraform state 操作 (`import`, `state rm`, `force-unlock`) は例外的にローカルで許可

## Usage

- `/deploy status` — 最新の CD 実行状況を確認
- `/deploy trigger` — CD を手動で発火 (workflow_dispatch)
- `/deploy secrets` — GitHub Secrets の一覧と設定状況を確認

## Execution

### status
```bash
gh run list -R tommykey-apps/gakushu --limit 5
```
最新の実行があれば詳細も表示:
```bash
gh run view <run_id> -R tommykey-apps/gakushu
```

### trigger
```bash
gh workflow run CD -R tommykey-apps/gakushu --ref main
```
発火後、ステータスを確認:
```bash
sleep 10 && gh run list -R tommykey-apps/gakushu --limit 1
```

### secrets
```bash
gh secret list -R tommykey-apps/gakushu
```
必要な Secrets:
- `AWS_ACCESS_KEY_ID` — AWS 認証
- `AWS_SECRET_ACCESS_KEY` — AWS 認証
- `COGNITO_USER_POOL_ID` — Nuxt ビルド時の環境変数
- `COGNITO_CLIENT_ID` — Nuxt ビルド時の環境変数
- `API_URL` — Nuxt ビルド時の環境変数
- `FRONTEND_BUCKET` — S3 sync 先
- `CLOUDFRONT_DISTRIBUTION_ID` — キャッシュ invalidation

不足している Secrets は `terraform output` から取得:
```bash
cd infra && flox activate -- terraform output
```
