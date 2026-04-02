.PHONY: help dev db db-admin api web test docs clean

-include .env
export

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Infrastructure ──

db: ## Start DynamoDB Local + create table
	docker compose up -d dynamodb-local dynamodb-init

db-admin: db ## Start DynamoDB Local + Admin UI (http://localhost:8001)
	docker compose --profile dev up -d

# ── Application ──

api: ## Start API server (http://localhost:3001)
	cd api && pnpm dev

web: ## Start frontend dev server (http://localhost:3000)
	cd web && pnpm dev

dev: db ## Start all services (run api/web in separate terminals)
	@echo ""
	@echo "  DynamoDB Local: http://localhost:8000"
	@echo ""
	@echo "  Run in separate terminals:"
	@echo "    make api   → http://localhost:3001"
	@echo "    make web   → http://localhost:3000"
	@echo ""

# ── Tests ──

test: ## Run all tests
	cd api && pnpm test
	cd web && pnpm test

# ── Docs ──

docs: ## Generate OpenAPI spec and serve docs (http://localhost:9090)
	cd api && pnpm run generate-openapi
	@echo "  Serving docs at http://localhost:9090"
	cd docs && python3 -m http.server 9090

# ── Cleanup ──

clean: ## Stop and remove all containers
	docker compose --profile dev down
