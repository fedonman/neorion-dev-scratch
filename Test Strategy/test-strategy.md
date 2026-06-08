# Test Strategy — Todo List REST API

## Commands
- **Install:** `npm install`
- **Lint:** `npm run lint`
- **Test:** `npm test`
- **Build:** `npm run build`
- **Dev run:** `npm run dev`

## Test Layers
- **Unit tests** — exercise the repository (`InMemoryTodoRepository`) and any pure helpers/validation in isolation, asserting correct CRUD behavior and edge cases (missing id, empty store).
- **Integration tests** — use Supertest against the in-process Express app to verify routes, status codes, and JSON shapes end-to-end without binding a network port. The included smoke test covers `GET /health`.
- **e2e tests** — (future) run against a started server and a real datastore once persistence is added; out of scope for the initial skeleton.

## What Each Layer Covers Now
- Smoke: `GET /health` returns `200` and `{ status: 'ok' }`. This guarantees the app boots and routing works on a fresh clone.

## Definition of Done
- `npm install` succeeds on a clean checkout.
- `npm run lint` reports no errors.
- `npm test` passes, including the smoke test.
- `npm run build` produces compiled output in `dist/` with no type errors.
- New endpoints ship with at least one integration test and relevant unit tests.
