# Todo List REST API

A minimal REST API for managing todo items, built with TypeScript, Node.js, and Express.

## Requirements
- Node.js LTS (>= 18)

## Getting Started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (ts-node)
npm test         # run the test suite
npm run lint     # lint the codebase
npm run build    # compile TypeScript to dist/
```

The server listens on `http://localhost:3000` by default (override with `PORT`).

## Endpoints
- `GET /health` — service health check.
- `GET /todos` — list todos.
- `POST /todos` — create a todo.
- `GET /todos/:id` — get a todo.
- `PUT /todos/:id` — update a todo.
- `DELETE /todos/:id` — delete a todo.

> The default datastore is in-memory and resets on restart. It lives behind a
> `TodoRepository` interface so it can be swapped for a real database later.
