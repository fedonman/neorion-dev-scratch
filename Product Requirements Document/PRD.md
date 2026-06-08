# Todo List REST API — Product Requirements

## Summary
A small, well-structured REST API that lets clients create, read, update, and delete todo items. It is intended as a foundation that a build crew grows feature-by-feature from tickets.

## Problem & Goals
Users and client applications need a simple, predictable HTTP interface to manage a todo list. The goals are:

- Provide CRUD operations over todo items via REST.
- Return consistent JSON payloads and standard HTTP status codes.
- Be trivially runnable and testable locally.
- Keep the storage layer abstracted so the in-memory store can be replaced with a real database later.

## Non-Goals
- Authentication / authorization (deferred to a later ticket).
- Multi-user accounts, sharing, or permissions.
- A web/mobile front-end.
- Real persistent database integration (in-memory store is the initial default).
- Pagination, search, and bulk operations (future scope).

## Target Users
- Front-end / mobile developers integrating a todo feature.
- Internal services needing a lightweight task store.

## Key Use Cases
1. **Create a todo** — `POST /todos` with `{ title, completed? }` returns the created item with an `id`.
2. **List todos** — `GET /todos` returns all items.
3. **Get one todo** — `GET /todos/:id` returns a single item or `404`.
4. **Update a todo** — `PUT /todos/:id` updates `title`/`completed`, or `404` if missing.
5. **Delete a todo** — `DELETE /todos/:id` removes an item, returning `204` or `404`.
6. **Health check** — `GET /health` returns service status for liveness probes.

## Success Metrics
- All endpoints return correct status codes and shapes for valid and invalid input.
- p95 request latency < 50ms for in-memory operations under light local load.
- Test suite passes (`npm test`) with the smoke test green on a fresh clone.

## Constraints
- JSON over HTTP only.
- Stateless service; no session storage.
- Node.js LTS runtime.
- Datastore abstracted behind a repository interface for future swap.
