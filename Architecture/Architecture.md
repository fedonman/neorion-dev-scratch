# Architecture — Todo List REST API

## Overview
A single stateless Node.js service exposing a REST API over HTTP. Requests flow through Express middleware to route handlers, which delegate to a service/repository layer that owns the todo data. The default repository is an in-memory implementation behind an interface, so it can later be replaced (e.g. with Postgres) without touching the routes.

## Stack & Why
- **TypeScript** — static typing reduces defects and documents the data model (`Todo`).
- **Node.js + Express** — mainstream, minimal, well-supported HTTP framework; ideal for a small REST service.
- **Jest + Supertest** — standard unit + HTTP-level integration testing for Express apps.
- **ts-node** — run TypeScript directly in development without a separate build step.
- **ESLint** — consistent style and basic static checks.

## Components & Boundaries
- **`src/app.ts`** — builds and configures the Express app (JSON parsing, routes, error handling). Exported separately from server startup so tests can import the app without binding a port.
- **`src/server.ts`** — entrypoint that starts the HTTP listener.
- **`src/routes/`** — HTTP route handlers; translate HTTP <-> service calls, no business logic beyond validation.
- **`src/repositories/todoRepository.ts`** — `TodoRepository` interface + `InMemoryTodoRepository` implementation. This is the swap point for a real database.
- **`src/models/todo.ts`** — the `Todo` type and DTO shapes.

## Data Flow
1. Client sends an HTTP request.
2. Express parses JSON and routes to the matching handler.
3. Handler validates input and calls the repository.
4. Repository performs the operation against its store.
5. Handler maps the result to a JSON response and status code.

## Key Decisions
- **App/server split** so integration tests run against the app in-process via Supertest.
- **Repository interface** isolates storage; in-memory is the default for a greenfield repo.
- **Centralized error handling** middleware to keep handlers thin and responses consistent.
- No CI config is included (out of scope for the skeleton).
