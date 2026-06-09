# Test Strategy

## Commands

- **install:** `npm install`
- **lint:** `npx eslint src/ public/ --ext .js` _(add an `.eslintrc` with `eslint:recommended`; no separate lint dep beyond `eslint` is required)_
- **test:** `npm test` — runs `node --test` (Node's built-in `node:test` runner) over all `**/*.test.js` files, including API tests via `supertest`
- **build:** _(none required — no compilation or bundling step; vanilla JS frontend is served as static assets directly by Express)_

---

## Layers

### 1. Unit — service & repository logic

**What it covers:**
- `TodoService`: business-rule enforcement — title required, title 1–255 chars, description ≤ 2000 chars, `completed` defaults to `false`, `updated_at` is set on mutations, toggle flips the `completed` flag.
- `TodoRepository`: SQL correctness — `INSERT`, `SELECT … ORDER BY created_at`, `UPDATE`, `DELETE` against a real (temp-file) SQLite instance opened inline in the test; verifies row mapping to todo objects.
- Schema migration/init: asserts the `todos` table is created on first open and survives a second open without error.
- `zod` schemas: unit-tests the validation schemas directly (valid payloads pass, invalid payloads produce expected `ZodError` paths).

**Isolation:** Each test file opens a fresh `better-sqlite3` database in a `tmp` path (e.g., `:memory:` or `os.tmpdir()`-scoped file) and closes/deletes it in `after`; service tests inject a mock/stub repository so no DB is needed.

**Files:** `src/**/*.test.js` co-located with the module under test.

---

### 2. Integration — HTTP API (route → service → repository → SQLite)

**What it covers:**

| Endpoint | Happy-path | Error/edge paths |
|---|---|---|
| `POST /todos` | `201` + created todo body (`id`, `title`, `description`, `completed=false`, `created_at`, `updated_at`) | `400` empty title; `400` title > 255 chars; `400` malformed JSON; `400` missing body |
| `GET /todos` | `200` + array (including empty `[]`); items ordered by `created_at` | — |
| `PATCH /todos/:id` | `200` + updated todo; `updated_at` advances | `400` invalid fields; `404` unknown id |
| `PATCH /todos/:id` (toggle) | `200`; `completed` flips from `false`→`true`→`false` | `404` unknown id |
| `DELETE /todos/:id` | `204` no body | `404` unknown id |
| `GET /health` | `200 {"status":"ok"}` when DB reachable | _(503 path tested by closing DB handle — see below)_ |

**Persistence-across-restart check:** Open a DB file at a known temp path, create a todo via the repository, close and reopen the same file, assert the todo is still present.

**Error-shape contract:** Every `4xx`/`5xx` response is asserted to have `{ error: string, details?: ... }` JSON structure.

**Tooling:** `supertest` spins up the Express app in-process; each test file creates a fresh temp SQLite path, passes it via config/env, and deletes it in `after`.

**Files:** `src/routes/**/*.test.js` or `test/api/*.test.js`.

---

### 3. End-to-end (E2E) — browser UI smoke tests _(lightweight, optional for v1)_

**What it covers:**
- User can load the page and see an empty list (or existing todos).
- User submits the add-todo form → item appears in the list.
- User toggles a todo checkbox → item displays as completed.
- User deletes a todo → item is removed from the list.
- User submits an empty title → UI displays a validation error message.

**Tooling:** Playwright (headless Chromium) against the server started on a dedicated test port with a temp DB. These tests are **optional for v1** and gated behind `npm run test:e2e` (separate script) so `npm test` (unit + integration) stays fast in CI.

**Files:** `test/e2e/*.spec.js`.

---

## Definition of Done

A ticket is **not deliverable** until all of the following are green:

1. **`npm install` succeeds** from a clean checkout with no errors or unresolved peer-dep warnings.
2. **`npm test` passes** — zero failing tests, zero uncaught errors; test output shows all unit and integration test cases as `✔ pass`.
3. **All happy paths covered:** every endpoint listed in the integration layer table has at least one passing test asserting the correct HTTP status and response shape.
4. **All targeted error paths covered:** empty title → `400`, over-length title → `400`, missing/unknown id → `404`, malformed body → `400`; each asserted with the `{ error, details }` JSON shape.
5. **Persistence test passes:** the reopen-and-read test confirms todos survive a simulated restart.
6. **Health-check test passes:** `GET /health` returns `200 { "status": "ok" }` in all integration runs.
7. **No lint errors:** `npx eslint src/ public/ --ext .js` exits `0` (warnings are allowed, errors are not).
8. **No regressions:** all tests that were passing before the ticket started are still passing (no skipped or commented-out tests without an accompanying tracking note).
9. **Manual smoke-check (UI tickets):** Add one todo, toggle it, delete it in a locally running instance — confirms the UI correctly calls the API and reflects state without console errors.
10. **No in-memory-only storage:** the integration persistence test must use a real file-backed SQLite path (not `:memory:`) to validate durability.
