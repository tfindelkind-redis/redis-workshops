# Makefile for Redis Workshops Testing

.PHONY: help install test test-simple test-fast test-notebook clean docker-start docker-stop

help: ## Show this help message
	@echo "Redis Workshops - Testing Commands"
	@echo "===================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install test dependencies
	@echo "📦 Installing test dependencies..."
	pip install -r tests/requirements.txt

docker-start: ## Start Docker containers for testing
	@echo "🐳 Starting Docker containers..."
	@docker stop test-postgres test-redis 2>/dev/null || true
	@docker rm test-postgres test-redis 2>/dev/null || true
	@docker run -d --name test-postgres \
		-e POSTGRES_PASSWORD=workshop123 \
		-e POSTGRES_USER=workshop \
		-e POSTGRES_DB=workshop \
		-p 5432:5432 \
		postgres:15-alpine
	@docker run -d --name test-redis \
		-p 6379:6379 \
		redis:7-alpine
	@echo "⏳ Waiting for containers..."
	@sleep 5
	@echo "✅ Containers ready"

docker-stop: ## Stop Docker containers
	@echo "🛑 Stopping Docker containers..."
	@docker stop test-postgres test-redis 2>/dev/null || true
	@docker rm test-postgres test-redis 2>/dev/null || true
	@echo "✅ Containers stopped"

test: docker-start ## Run full pytest test suite (requires Docker)
	@echo "🧪 Running full test suite..."
	@pytest tests/test_notebooks.py -v
	@$(MAKE) docker-stop

test-simple: docker-start ## Run simple test runner (no pytest needed)
	@echo "🧪 Running simple test runner..."
	@python3 tests/simple_test_runner.py
	@$(MAKE) docker-stop

test-fast: ## Run tests without Docker (will fail on DB-dependent notebooks)
	@echo "⚡ Running fast tests (no Docker)..."
	@pytest tests/test_notebooks.py::test_notebook_has_cells -v
	@pytest tests/test_notebooks.py::test_notebook_metadata -v

test-notebook: ## Test specific notebook: make test-notebook NB=module-08
	@if [ -z "$(NB)" ]; then \
		echo "❌ Please specify notebook: make test-notebook NB=module-08"; \
		exit 1; \
	fi
	@echo "🧪 Testing $(NB)..."
	@pytest tests/test_notebooks.py -k "$(NB)" -v

test-ci: ## Run tests in CI/CD environment (assumes containers running)
	@echo "🤖 Running CI tests..."
	@pytest tests/test_notebooks.py -v --tb=short

validate: ## Quick validation without execution
	@echo "✅ Validating notebook structure..."
	@pytest tests/test_notebook_advanced.py::test_notebook_with_validation -v

clean: docker-stop ## Clean up test artifacts
	@echo "🧹 Cleaning up..."
	@rm -rf .pytest_cache
	@rm -rf __pycache__
	@rm -rf tests/__pycache__
	@rm -rf .coverage
	@rm -rf htmlcov
	@rm -f /tmp/test-output.ipynb
	@echo "✅ Clean complete"

watch: ## Watch for notebook changes and re-run tests
	@echo "👁️  Watching for changes..."
	@which fswatch > /dev/null || (echo "❌ fswatch not installed. Install with: brew install fswatch" && exit 1)
	@fswatch -o workshops/**/*.ipynb | xargs -n1 -I{} make test

list-notebooks: ## List all discovered notebooks
	@echo "📓 Discovered notebooks:"
	@find workshops/deploy-redis-for-developers-amr -name "*.ipynb" ! -path "*/.ipynb_checkpoints/*" | sort

stats: ## Show notebook statistics
	@echo "📊 Notebook Statistics"
	@echo "======================"
	@echo "Total notebooks: $$(find workshops/deploy-redis-for-developers-amr -name '*.ipynb' ! -path '*/.ipynb_checkpoints/*' | wc -l | tr -d ' ')"
	@echo ""
	@echo "By module:"
	@find workshops/deploy-redis-for-developers-amr -name "*.ipynb" ! -path "*/.ipynb_checkpoints/*" -exec dirname {} \; | sort -u | xargs -I {} sh -c 'echo "  $$(basename {}): $$(find {} -name \"*.ipynb\" | wc -l | tr -d \" \") notebooks"'
