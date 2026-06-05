# Test Framework Template Makefile
#
# Usage:
#   make install TARGET=/path/to/your/project [NAME=project-name]
#   make install TARGET=/home/user/src/my-app NAME=my-app
#
# After installation, in your project:
#   cd cicd/tests && npm install
#   npm test
#   npm test -- --no-llm

SHELL := /bin/bash
.PHONY: install help uninstall check up down clean status

COMPOSE := docker compose

# Default values
NAME ?= my-project
TARGET ?=

# Template source directory
TEMPLATE_DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

help:
	@echo "Test Framework Template"
	@echo ""
	@echo "Usage:"
	@echo "  make install TARGET=/path/to/project [NAME=project-name]"
	@echo ""
	@echo "Examples:"
	@echo "  make install TARGET=/home/user/src/my-app NAME=my-app"
	@echo "  make install TARGET=../my-project NAME=my-project"
	@echo ""
	@echo "Options:"
	@echo "  TARGET  - Required. Path to your project"
	@echo "  NAME    - Optional. Project name (default: my-project)"
	@echo ""
	@echo "After installation:"
	@echo "  cd <TARGET>/cicd/tests && npm install"
	@echo "  npm test              # Run all tests"
	@echo "  npm test -- --no-llm  # Run without LLM judge"
	@echo "  npm run list          # List available tests"
	@echo ""
	@echo "Stack lifecycle (this repo's step-store):"
	@echo "  make up        # Start Postgres+pgvector and the MCP server"
	@echo "  make down      # Stop the stack"
	@echo "  make clean     # Stop and wipe to a fresh empty state (drops the volume)"
	@echo "  make status    # Show whether the stack is up and healthy"

# ─── Stack lifecycle (STORY-003) ────────────────────────────────────────────
# Operate the local step-store stack: Postgres + pgvector + the MCP server.

up:
	$(COMPOSE) up -d --build
	@echo "Waiting for Postgres..."
	@until $(COMPOSE) exec -T db pg_isready -U stepstore -d stepstore >/dev/null 2>&1; do sleep 1; done
	@$(COMPOSE) exec -T db psql -U stepstore -d stepstore < step-store/schema.sql >/dev/null
	@echo "Stack up: Postgres+pgvector and MCP server (HTTP :3000)."

down:
	$(COMPOSE) down

clean:
	$(COMPOSE) down -v
	@echo "Stack reset: containers and the pgdata volume removed (empty state)."

status:
	@echo "Containers:"
	@$(COMPOSE) ps --format '  {{.Service}}: {{.State}} ({{.Health}})' 2>/dev/null | grep . || echo "  (stack is down)"
	@printf "Postgres:         "; $(COMPOSE) exec -T db pg_isready -U stepstore -d stepstore >/dev/null 2>&1 && echo "reachable" || echo "down"
	@printf "MCP (HTTP :3000): "; node -e "fetch('http://localhost:3000/').then(()=>process.exit(0)).catch(()=>process.exit(1))" >/dev/null 2>&1 && echo "responding" || echo "down"

check:
ifndef TARGET
	$(error TARGET is required. Usage: make install TARGET=/path/to/project)
endif

install: check
	@echo "NOTE: Consider using agent-driven installation instead."
	@echo "  In your project, tell Claude Code:"
	@echo "    /install $(TEMPLATE_DIR)"
	@echo "  See README.md for details."
	@echo ""
	@echo "Installing test framework to: $(TARGET)"
	@echo "Project name: $(NAME)"
	@echo ""

	@# Create directories
	@mkdir -p "$(TARGET)/cicd/tests/src/judge"
	@mkdir -p "$(TARGET)/cicd/tests/src/reporter"
	@mkdir -p "$(TARGET)/cicd/tests/testcases/build"
	@mkdir -p "$(TARGET)/cicd/tests/testcases/integration"
	@mkdir -p "$(TARGET)/cicd/tests/testcases/e2e"
	@mkdir -p "$(TARGET)/cicd/scripts"
	@mkdir -p "$(TARGET)/cicd/results"
	@mkdir -p "$(TARGET)/.github/workflows"

	@# Copy test framework source
	@cp "$(TEMPLATE_DIR)/cicd/tests/package.json" "$(TARGET)/cicd/tests/"
	@cp "$(TEMPLATE_DIR)/cicd/tests/tsconfig.json" "$(TARGET)/cicd/tests/"
	@cp "$(TEMPLATE_DIR)/cicd/tests/src/"*.ts "$(TARGET)/cicd/tests/src/"
	@cp "$(TEMPLATE_DIR)/cicd/tests/src/judge/"*.ts "$(TARGET)/cicd/tests/src/judge/"
	@cp "$(TEMPLATE_DIR)/cicd/tests/src/reporter/"*.ts "$(TARGET)/cicd/tests/src/reporter/"

	@# Copy example test cases
	@cp "$(TEMPLATE_DIR)/cicd/tests/testcases/build/"*.yml "$(TARGET)/cicd/tests/testcases/build/"
	@cp "$(TEMPLATE_DIR)/cicd/tests/testcases/integration/"*.yml "$(TARGET)/cicd/tests/testcases/integration/"
	@cp "$(TEMPLATE_DIR)/cicd/tests/testcases/e2e/"*.yml "$(TARGET)/cicd/tests/testcases/e2e/"

	@# Copy scripts
	@cp "$(TEMPLATE_DIR)/cicd/scripts/format-results.sh" "$(TARGET)/cicd/scripts/"
	@chmod +x "$(TARGET)/cicd/scripts/format-results.sh"

	@# Copy GitHub workflows
	@cp "$(TEMPLATE_DIR)/.github/workflows/"*.yml "$(TARGET)/.github/workflows/" 2>/dev/null || true

	@# Copy CLAUDE.md if it exists
	@if [ -f "$(TEMPLATE_DIR)/CLAUDE.md" ]; then cp "$(TEMPLATE_DIR)/CLAUDE.md" "$(TARGET)/CLAUDE.md"; fi

	@# Copy Claude skills if they exist
	@if [ -d "$(TEMPLATE_DIR)/.claude/skills" ]; then \
		mkdir -p "$(TARGET)/.claude/skills"; \
		cp -r "$(TEMPLATE_DIR)/.claude/skills/"* "$(TARGET)/.claude/skills/" 2>/dev/null || true; \
	fi

	@# Copy Claude rules if they exist
	@if [ -d "$(TEMPLATE_DIR)/.claude/rules" ]; then \
		mkdir -p "$(TARGET)/.claude/rules"; \
		cp "$(TEMPLATE_DIR)/.claude/rules/"*.md "$(TARGET)/.claude/rules/" 2>/dev/null || true; \
	fi

	@# Create .gitignore for results
	@echo "*" > "$(TARGET)/cicd/results/.gitignore"
	@echo "!.gitignore" >> "$(TARGET)/cicd/results/.gitignore"

	@# Update project name in config
	@sed -i "s/projectName: 'my-project'/projectName: '$(NAME)'/g" "$(TARGET)/cicd/tests/src/config.ts"
	@sed -i "s/sessionPrefix: 'test-session'/sessionPrefix: '$(NAME)-session'/g" "$(TARGET)/cicd/tests/src/config.ts"

	@echo ""
	@echo "========================================"
	@echo "Installation complete!"
	@echo "========================================"
	@echo ""
	@echo "Next steps:"
	@echo "  cd $(TARGET)/cicd/tests"
	@echo "  npm install"
	@echo ""
	@echo "Configure Ollama URL:"
	@echo "  Edit $(TARGET)/cicd/tests/src/config.ts"
	@echo "  Set llm.defaultUrl to your Ollama server"
	@echo ""
	@echo "Run tests:"
	@echo "  npm test              # All tests with LLM judge"
	@echo "  npm test -- --no-llm  # Without LLM judge"
	@echo "  npm run list          # List available tests"
	@echo ""

uninstall:
ifndef TARGET
	$(error TARGET is required. Usage: make uninstall TARGET=/path/to/project)
endif
	@echo "Removing test framework from: $(TARGET)"
	@rm -rf "$(TARGET)/cicd"
	@rm -f "$(TARGET)/.github/workflows/test-pipeline.yml"
	@rm -f "$(TARGET)/.github/workflows/test-suite.yml"
	@rm -f "$(TARGET)/.github/workflows/build.yml"
	@rm -f "$(TARGET)/.github/workflows/test-run.yml"
	@rm -f "$(TARGET)/.github/workflows/test-feature-example.yml"
	@rm -f "$(TARGET)/.github/workflows/ci.yml"
	@echo "Done."
