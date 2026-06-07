# ai-qa-step-graph — Makefile
#
# Operate the local step-store stack (Postgres + pgvector + the MCP server) and
# run the on-demand checks. Run `make help` for the targets.

SHELL := /bin/bash
.PHONY: help up down clean status query ci

COMPOSE := docker compose

help:
	@echo "ai-qa-step-graph — the step-store MCP server"
	@echo ""
	@echo "Stack lifecycle:"
	@echo "  make up        # Start Postgres+pgvector and the MCP server"
	@echo "  make down      # Stop the stack"
	@echo "  make clean     # Stop and wipe to a fresh empty state (drops the volume)"
	@echo "  make status    # Show whether the stack is up and healthy"
	@echo "  make query Q=\"...\"  # Quick semantic lookup against the store"
	@echo "  make ci        # Run the full check on demand (suite + drift) — the manual merge gate"

# ─── Stack lifecycle (STORY-003) ────────────────────────────────────────────
# Operate the local step-store stack: Postgres + pgvector + the MCP server.

up:
	$(COMPOSE) up -d --build --wait
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

Q ?= log in
query:
	@npm --prefix step-store run --silent query -- "$(Q)"

# The manual merge gate (STORY-002 #42). CI never auto-runs here, so run the
# checks on demand before merging: stand the stack up, run the assert-first
# suite, then the file-only drift/binding gate. Green here + human review is
# the gate — there are no required status checks.
ci: up
	npm --prefix cicd/tests test
	npm --prefix step-store run --silent drift
