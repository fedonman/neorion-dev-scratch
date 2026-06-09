# Product Requirements Document

## 1. Summary
TodoApp is a lightweight, self-hostable web application that lets a single user (or small team) capture, organize, and track personal tasks. It consists of a backend server exposing a REST API for managing todo items, a database providing durable persistence so data survives restarts, and a simple browser-based UI for adding, editing, completing, and deleting todos. The product targets developers and individuals who want a minimal, easily runnable task manager that can be started locally with one or two commands and extended over time.

## 2. Problem & goals
- **Problem:** People need a simple, reliable way to track tasks, but many existing tools are heavyweight, require accounts/cloud sync, or lose data on restart. There is a need for a minimal todo app that is easy to run, stores data durably, and exposes a clean API for automation and UI use.
- **Goals:**
  - Provide a REST API to **create, list, update, toggle-complete, and delete** todo items.
  - Persist todos in a **database** so they survive server restarts.
  - Ship a **simple web UI** to add, edit, complete, delete, and view todos.
  - Enforce **input validation** on all write operations (e.g., non-empty title, length limits).
  - Expose a **health-check endpoint** for liveness/readiness monitoring.
  - Include **automated tests** covering API behavior and validation.
  - Use a **lightweight, easily runnable stack** that starts with minimal setup.
- **Non-goals:**
  - User accounts, authentication, authorization, or multi-tenant isolation (single-user assumed for v1).
  - Real-time collaboration, sharing, or multi-device sync.
  - Mobile native apps; the UI is browser-based only.
  - Advanced task features: subtasks, tags, recurring tasks, reminders/notifications, attachments.
  - Offline-first / PWA support.
  - Internationalization and theming beyond basic defaults.

## 3. Target users & personas
- **Solo developer / self-hoster (primary):** Wants to clone the repo, run one command, and have a working todo app with an API they can script against. Values simplicity, clear docs, and a clean REST contract.
- **Individual end user:** Uses the web UI to jot down and check off daily tasks. Values speed, clarity, and that their data is not lost.
- **Integrator / automation author (secondary):** Calls the REST API from scripts or other tools to create or query todos programmatically.

## 4. Key use cases
_Headline journeys (to be expanded in docs/Use Cases):_
1. **Add a todo** — User enters a title (and optional description) in the UI; the item is created via `POST /todos` and appears in the list.
2. **View todos** — User opens the app and sees the current list of todos with their completion status (`GET /todos`).
3. **Edit a todo** — User changes the title/description of an existing item (`PUT/PATCH /todos/{id}`).
4. **Toggle complete** — User marks a todo done or not done (`PATCH /todos/{id}` or dedicated toggle), reflected immediately in the UI.
5. **Delete a todo** — User removes an item (`DELETE /todos/{id}`), and it disappears from the list.
6. **Reject invalid input** — User submits an empty or over-long title; the API returns a validation error and the UI shows a clear message.
7. **Monitor health** — An operator or orchestrator polls `GET /health` to confirm the service (and its DB connection) is up.

## 5. Success metrics
- **Functional completeness:** 100% of the five core API operations (create, list, update, toggle, delete) implemented and passing automated tests.
- **Durability:** Todos persist across a full server restart in 100% of test runs.
- **Validation coverage:** All write endpoints reject invalid input (empty title, title exceeding max length, malformed body) with appropriate 4xx responses, verified by tests.
- **Reliability:** `GET /health` returns healthy status when the DB is reachable; returns a non-200 when it is not.
- **Test coverage:** Automated tests cover all API endpoints' happy paths and key validation/error paths.
- **Runnability:** A new user can start the full stack (server + DB + UI) with a single documented command from a clean checkout.
- **Performance (target, not hard SLA):** Typical CRUD API responses under ~200 ms locally for a small dataset.

## 6. Constraints & assumptions
- **Assumptions:**
  - Single-user, single-tenant; no authentication required for v1 (todos are not user-scoped).
  - A todo item has at minimum: `id`, `title` (required), `description` (optional), `completed` (boolean), `created_at`, and `updated_at`.
  - Title is required and length-limited (e.g., 1–255 chars); description is optional and length-limited (e.g., ≤2000 chars).
  - A lightweight relational database (default: SQLite for zero-config local runs; Postgres as an optional production target) is acceptable for persistence.
  - The REST API uses JSON request/response bodies and standard HTTP status codes (201 create, 200 read/update, 204 delete, 400 validation, 404 not found).
  - The web UI is a simple single-page interface served by or alongside the backend; no heavy frontend framework is mandated.
  - Deployment is local/self-hosted; cloud hosting is out of scope for v1.
- **Constraints:**
  - Stack must be lightweight and easily runnable (minimal dependencies, one-command startup, documented setup).
  - Must include automated tests runnable via a standard command.
  - Must expose a health-check endpoint.
  - Data must survive server restarts (durable persistence, not in-memory).
- **Note:** The provided brief contained only product requirements; no embedded instructions were treated as directives.
