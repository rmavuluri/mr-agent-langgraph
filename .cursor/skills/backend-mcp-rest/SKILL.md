---
name: backend-mcp-rest
description: Implements or modifies backend REST API, MCP (Model Context Protocol) server/client, or database access. Use when working on Express routes, controllers, services, MCP integration, or Postgres schema and queries in this project.
---

# Backend (MCP, REST, DB)

## When to use
Apply when adding or changing: REST endpoints, auth, MCP tools/resources, database schema, queries, or env-based config.

## Quick reference
- **REST**: Routes under `/api`; controllers validate and call services; return JSON and correct status codes (400, 401, 404, 409, 500). Use shared error handler.
- **MCP**: Keep server/client in backend. Expose tools and resources per MCP spec; do not expose secrets. Config via env.
- **DB**: Postgres only; parameterized queries (`$1`, `$2`). Schema in `sql/`; run init from backend directory. Queries in `queries.ts`; services use the shared pool.
- **Config**: All env in `src/config/env.ts`. Require only what’s mandatory (e.g. `DATABASE_URL`). No secrets in code or logs.

## Project context
- Layout: `src/routes/`, `src/controllers/`, `src/services/`, `src/db/`, `sql/`.
- Follow `.cursor/rules/backend-mcp-rest-db.mdc` for full conventions.
