# Todo App

A lightweight web-based todo application with a REST API and durable SQLite persistence.

## Stack
- Node.js + Express (REST API)
- better-sqlite3 (durable storage)
- Vanilla HTML/CSS/JS UI served statically
- Vitest + Supertest (automated tests)

## Getting started

```bash
npm install
npm start
```

Then open http://localhost:3000 in your browser.

## Run tests

```bash
npm test
```

## REST API

| Method | Path             | Description              |
|--------|------------------|--------------------------|
| GET    | /health          | Health check             |
| GET    | /api/todos       | List all todos           |
| POST   | /api/todos       | Create a todo            |
| PUT    | /api/todos/:id   | Update a todo's title    |
| PATCH  | /api/todos/:id/toggle | Toggle complete     |
| DELETE | /api/todos/:id   | Delete a todo            |

Todos persist in a SQLite database file (`data/todos.sqlite` by default), so they survive server restarts.
