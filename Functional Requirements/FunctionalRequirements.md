# Functional Requirements

_Each requirement is testable and traceable to a use case or PRD goal. Priority follows MoSCoW: **must** = required for v1, **should** = strongly desired, **could** = nice-to-have within scope._

---

## Use-case reference key

| ID | Use case |
|---|---|
| UC-001 | Add a todo |
| UC-002 | View todos |
| UC-003 | Edit a todo |
| UC-004 | Toggle complete |
| UC-005 | Delete a todo |
| UC-006 | Reject invalid input |
| UC-007 | Monitor health |
| PRD | PRD goal (no specific use case) |

---

## Requirements table

| ID | Requirement | Use case | Priority |
|---|---|---|---|
| FR-001 | `POST /todos` shall accept a JSON body containing `title` (required) and `description` (optional), create a new todo item, and return `201` with the created todo object including server-assigned `id`, `completed` (`false`), `created_at`, and `updated_at`. | UC-001 | must |
| FR-002 | `GET /todos` shall return `200` with a JSON array of all stored todo items ordered by `created_at` ascending. | UC-002 | must |
| FR-003 | `GET /todos` shall return an empty array (`[]`) — not an error — when no todos exist. | UC-002 | must |
| FR-004 | `PATCH /todos/{id}` shall accept a JSON body with one or more of `title`, `description`, or `completed`, apply only the supplied fields to the identified todo, update `updated_at` to the current timestamp, and return `200` with the full updated todo object. | UC-003, UC-004 | must |
| FR-005 | `DELETE /todos/{id}` shall delete the identified todo and return `204` with no body. | UC-005 | must |
| FR-006 | The API shall return `404` with a structured JSON error body when any operation targets a `{id}` that does not exist in the database. | UC-003, UC-004, UC-005 | must |
| FR-007 | `POST /todos` shall reject a request where `title` is absent, null, or an empty string with a `400` response containing a structured `{error, details}` JSON body identifying the offending field. | UC-006 | must |
| FR-008 | `POST /todos` shall reject a request where `title` exceeds 255 characters with a `400` response containing a structured `{error, details}` JSON body. | UC-006 | must |
| FR-009 | `POST /todos` shall reject a request where `description` exceeds 2000 characters with a `400` response containing a structured `{error, details}` JSON body. | UC-006 | must |
| FR-010 | `PATCH /todos/{id}` shall reject a request where `title` is present but empty or exceeds 255 characters, returning `400` with a structured `{error, details}` JSON body. | UC-006 | must |
| FR-011 | `PATCH /todos/{id}` shall reject a request where `description` is present but exceeds 2000 characters, returning `400` with a structured `{error, details}` JSON body. | UC-006 | must |
| FR-012 | All write endpoints (`POST /todos`, `PATCH /todos/{id}`) shall reject a malformed (non-parseable) JSON request body with a `400` response. | UC-006 | must |
| FR-013 | The API shall never accept or reflect client-supplied `id`, `created_at`, or `updated_at` values; these fields are always server-assigned and ignored if present in request bodies. | PRD | must |
| FR-014 | `GET /health` shall return `200` with a JSON body `{"status": "ok"}` when the server is running and the database is reachable. | UC-007 | must |
| FR-015 | `GET /health` shall return `503` with a JSON body indicating an unhealthy state when the database is not reachable. | UC-007 | must |
| FR-016 | All todo data shall be persisted to a durable storage file (SQLite by default) such that all todos created before a server process restart are retrievable via `GET /todos` after the server restarts against the same database path. | PRD | must |
| FR-017 | The database schema shall be initialised or migrated automatically on server startup; no manual schema setup step shall be required. | PRD | must |
| FR-018 | The web UI shall display the full list of current todos (title, completion status) on page load by calling `GET /todos`. | UC-002 | must |
| FR-019 | The web UI shall provide a form or input control that allows a user to enter a title and optional description and submit it to create a new todo, with the new item appearing in the list without a full page reload. | UC-001 | must |
| FR-020 | The web UI shall provide an inline edit control that allows a user to modify the title and/or description of an existing todo and persist the change via `PATCH /todos/{id}`, updating the displayed item in place. | UC-003 | must |
| FR-021 | The web UI shall provide a checkbox or toggle control per todo item that calls the API to flip the `completed` state and reflects the new state immediately in the UI. | UC-004 | must |
| FR-022 | The web UI shall provide a delete control per todo item that calls `DELETE /todos/{id}` and removes the item from the displayed list upon success. | UC-005 | must |
| FR-023 | The web UI shall display a clear, user-readable error message when the API returns a `400` validation error (e.g., empty or over-length title), without losing the user's input. | UC-006 | must |
| FR-024 | The entire application (server, database, and static UI) shall start with a single documented command (e.g., `npm start`) from a clean checkout after `npm install`. | PRD | must |
| FR-025 | Automated tests shall cover the happy path for each of the five core API operations: create, list, update (field edit), toggle-complete, and delete. | PRD | must |
| FR-026 | Automated tests shall cover validation error paths: empty title, over-length title, over-length description, and malformed JSON body on write endpoints. | PRD | must |
| FR-027 | Automated tests shall cover the `404` path for update, toggle, and delete operations on a non-existent `id`. | PRD | must |
| FR-028 | Automated tests shall include a persistence check that writes a todo, restarts (or re-opens) the database, and confirms the todo is still retrievable. | PRD | must |
| FR-029 | All automated tests shall be executable via the single command `npm test`. | PRD | must |
| FR-030 | Unexpected server-side errors shall return `500` with a generic JSON error message; stack traces shall not be included in HTTP responses. | PRD | should |
| FR-031 | The server shall emit structured request logs (method, path, status, latency) to stdout; the log level shall be configurable via the `LOG_LEVEL` environment variable (default `info`). | PRD | should |

---

## Gaps & assumptions

1. **Toggle endpoint shape:** The architecture notes both `PATCH /todos/{id}` with `{completed}` and an optional dedicated `POST /todos/{id}/toggle`. FR-004 covers the `PATCH` form; a separate toggle route is treated as optional sugar (could priority) and is not given its own FR to avoid duplicating requirements without explicit PRD mandate.
2. **`GET /todos/{id}`** (single-item fetch): Not explicitly listed as a use case or PRD goal. Assumed not required for v1; the UI reads from the list endpoint. No FR created.
3. **List filtering/sorting by completion status:** Not mentioned in the PRD. No FR created; noted as a potential v2 feature.
4. **`completed` field semantics in PATCH:** Assumed that sending `{"completed": true}` or `{"completed": false}` explicitly sets the value (idempotent set), while a dedicated toggle route would flip it. FR-004 covers the set semantic.
5. **Title length lower bound on PATCH:** Assumed the same rule as POST (non-empty, ≥ 1 character) applies when `title` is provided in a PATCH body (FR-010).
6. **Ordering of `GET /todos`:** Architecture specifies `ORDER BY created_at`; direction assumed ascending (oldest first) as the natural inbox order (FR-002 states this).
