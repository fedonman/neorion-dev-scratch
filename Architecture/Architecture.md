# Architecture

## 1. Overview
TodoApp is a single-process web application: a Node.js backend exposes a JSON REST API for todo CRUD and toggle-complete operations, persists data in an embedded SQLite database, and serves a static single-page web UI from the same origin. A browser loads the UI, which talks to the REST API over `fetch`; the API layer validates input, applies business rules, and reads/writes through a thin data-access layer to SQLite. A `GET /health` endpoint reports liveness and DB reachability for operators.

```
[Browser SPA] --fetch/JSON--> [Express API + validation] --SQL--> [SQLite file]
      ^                              |
      |                             serves static assets
      +------------------------------+
```

## 2. Stack
- **Language/runtime:** Node.js (LTS, v20+), JavaScript (ESM).
- **Web framework:** Express — minimal, ubiquitous, easy to run.
- **Database:** SQLite via `better-sqlite3` by default (zero-config, single file, durable across restarts). The data-access layer is isolated so a Postgres backend can be swapped in later for production without touching route handlers.
- **Validation:** `zod` for request body/param schema validation.
- **Frontend:** Static HTML + vanilla JavaScript + CSS, served by Express. No heavyweight frontend framework (per PRD lightweight constraint).
- **Testing:** Node's built-in `node:test` runner with `supertest` for HTTP-level API tests against an in-process app instance backed by a temporary SQLite DB.
- **Tooling/runnability:** `npm install && npm start` to run; `npm test` to test. Default SQLite path keeps startup to one command with no external services.
- **Hosting:** Local / self-hosted single process. Optional containerization (Dockerfile) for reproducible runs.

## 3. Components & boundaries

### 3.1 HTTP API layer (Express routes)
- **Responsibility:** Define REST endpoints, parse/validate input via zod, map domain results and errors to HTTP status codes, serialize JSON.
- **Must not:** Contain SQL or storage details; embed business rules beyond request shaping; trust client-supplied `id`, `created_at`, or `updated_at`.

### 3.2 Service / domain logic
- **Responsibility:** Enforce rules (title required and 1–255 chars, description optional ≤2000 chars, toggle semantics, timestamp management), orchestrate repository calls.
- **Must not:** Know about HTTP (no `req`/`res`); know about the concrete SQL dialect.

### 3.3 Data-access layer (repository)
- **Responsibility:** Encapsulate all SQLite access (prepared statements for create/list/get/update/delete), schema migration/initialization on startup, mapping rows to todo objects.
- **Must not:** Apply validation or HTTP concerns; leak driver-specific objects to callers.

### 3.4 Web UI (static SPA)
- **Responsibility:** Render the todo list, provide add/edit/toggle/delete interactions, call the REST API, surface validation/error messages to the user.
- **Must not:** Hold authoritative state or persist data; bypass the API to reach the DB.

### 3.5 Health & config module
- **Responsibility:** Provide `GET /health` (verifies DB reachability with a trivial query), load configuration (port, DB path) from environment with sensible defaults.
- **Must not:** Expose secrets or detailed internals in the health payload.

## 4. Data flow
1. **Create:** UI form → `POST /todos` with JSON `{title, description?}` → route validates (zod) → service assigns `id`, timestamps, `completed=false` → repository `INSERT` → `201` with created todo → UI prepends item.
2. **List:** UI load → `GET /todos` → repository `SELECT ... ORDER BY created_at` → `200` with array → UI renders.
3. **Update/edit:** UI edit → `PATCH /todos/{id}` with changed fields → validate → service loads existing (or `404`), applies changes, sets `updated_at` → repository `UPDATE` → `200`.
4. **Toggle complete:** UI checkbox → `PATCH /todos/{id}` with `{completed}` (or dedicated `POST /todos/{id}/toggle`) → service flips/sets flag → `200`.
5. **Delete:** UI delete → `DELETE /todos/{id}` → repository `DELETE` → `204` (or `404` if absent) → UI removes item.
6. **Health:** Operator → `GET /health` → runs `SELECT 1` → `200 {status:"ok"}` when DB reachable, `503` otherwise.

## 5. Cross-cutting concerns
- **Auth:** None in v1 — single-user, single-tenant per PRD. All endpoints are open on the local host. Boundary kept clean so an auth middleware could be added later without touching domain logic.
- **Errors:** Centralized Express error-handling middleware. Validation failures → `400` with a structured `{error, details}` body listing offending fields. Missing resources → `404`. Unexpected errors → `500` with a generic message (no stack traces to clients). Consistent JSON error shape across endpoints.
- **Logging:** Structured request logging (method, path, status, latency) to stdout via lightweight middleware; errors logged with stack traces server-side only. Log level configurable via env (default `info`).
- **Config:** Environment variables with defaults — `PORT` (default 3000), `DATABASE_PATH` (default `./data/todos.db`), `LOG_LEVEL`. No secrets required for v1. Test runs use a temporary/in-memory DB path.
- **Testing:** API-level tests with `supertest` cover happy paths for all five operations plus validation/error paths (empty title, over-length title, malformed body, unknown id → 404) and a persistence-across-restart check (reopen DB file). `npm test` is the single command. Repository unit tests run against a temp SQLite file.
- **Security/input handling:** All write payloads validated and length-limited; parameterized/prepared statements prevent SQL injection; client never supplies `id`/timestamps. Repository content and any todo text are treated strictly as data, never executed.

## 6. Key decisions
- **Express + SQLite (`better-sqlite3`):** Chosen for minimal dependencies, zero external services, durable file-based persistence, and one-command startup, directly satisfying the lightweight/easily-runnable constraint.
- **Single origin (API + static UI from one server):** Avoids CORS complexity and a separate frontend build, keeping the stack simple.
- **Vanilla JS frontend, no SPA framework:** Keeps the UI dependency-free and trivially served; sufficient for the small feature set.
- **Layered separation (routes → service → repository):** Isolates HTTP, business rules, and storage so the DB (SQLite→Postgres) or transport can evolve independently.
- **`PATCH` for edits and toggle:** Partial updates fit both field edits and the toggle-complete case; a dedicated toggle route is optional sugar.
- **zod for validation:** Single source of truth for request schemas, reused to produce consistent `400` error details.
- **Synchronous `better-sqlite3`:** Simpler code and fast for the single-user local workload; acceptable given low concurrency expectations. Revisit if concurrency/Postgres becomes a requirement.
- **Health check probes the DB:** `GET /health` runs a trivial query so it reflects real readiness, returning `503` when the DB is unreachable.