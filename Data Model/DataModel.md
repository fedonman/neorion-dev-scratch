# Data Model

## Entities

### `todos`

The sole persistent entity. Represents a single task item created by the user.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY`, not null | UUID v4, assigned server-side on creation. Client never supplies this. |
| `title` | `TEXT` | `NOT NULL`, length 1–255 chars | Required short description of the task. Validated by the service layer. |
| `description` | `TEXT` | nullable, max 2 000 chars | Optional longer notes for the task. |
| `completed` | `INTEGER` | `NOT NULL`, default `0` | Boolean flag stored as SQLite integer: `0` = incomplete, `1` = complete. |
| `created_at` | `TEXT` | `NOT NULL` | ISO-8601 UTC timestamp (`YYYY-MM-DDTHH:mm:ss.sssZ`), assigned server-side on insert. Never updated. |
| `updated_at` | `TEXT` | `NOT NULL` | ISO-8601 UTC timestamp, initially equal to `created_at`; updated server-side on every `UPDATE`. |

**Relationships:** None. There is a single entity with no foreign keys in v1 (no users, tags, or subtasks).

**Index:** A secondary index on `created_at` supports the default list ordering (`ORDER BY created_at ASC`) efficiently as the table grows.

---

## DDL sketch (SQLite via `better-sqlite3`)

```sql
-- Schema initialized by the repository layer on startup (CREATE TABLE IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS todos (
  id          TEXT    NOT NULL PRIMARY KEY,          -- UUID v4, server-assigned
  title       TEXT    NOT NULL                       -- 1–255 chars, enforced in service layer
                      CHECK(length(title) >= 1
                        AND length(title) <= 255),
  description TEXT    DEFAULT NULL                   -- optional, ≤2000 chars
                      CHECK(description IS NULL
                        OR length(description) <= 2000),
  completed   INTEGER NOT NULL DEFAULT 0             -- 0 = false, 1 = true
                      CHECK(completed IN (0, 1)),
  created_at  TEXT    NOT NULL,                      -- ISO-8601 UTC, server-assigned
  updated_at  TEXT    NOT NULL                       -- ISO-8601 UTC, server-maintained
);

CREATE INDEX IF NOT EXISTS idx_todos_created_at
  ON todos (created_at ASC);
```

> **Note — Postgres compatibility:** When the data-access layer is swapped to Postgres, the column types map directly: `TEXT → TEXT`, `INTEGER (0/1) → BOOLEAN`, ISO-8601 strings → `TIMESTAMPTZ`. The `CHECK` constraints remain valid SQL. The only required change is the driver import and connection string in the repository module.

---

## JSON representation (API surface)

The repository maps each row to a plain JavaScript object before returning it to the service/route layers. `completed` is surfaced as a native boolean in JSON.

```jsonc
{
  "id":          "c1f2e3d4-5678-4abc-9def-000000000001",  // string (UUID v4)
  "title":       "Buy groceries",                          // string, 1–255 chars
  "description": "Milk, eggs, bread",                      // string | null
  "completed":   false,                                     // boolean
  "created_at":  "2024-05-01T10:00:00.000Z",               // ISO-8601 UTC string
  "updated_at":  "2024-05-01T10:00:00.000Z"                // ISO-8601 UTC string
}
```

**Row → object mapping responsibilities (repository layer):**
- `completed`: `INTEGER` `0`/`1` ↔ JS `false`/`true` (cast on read; written as `0`/`1`).
- `description`: `NULL` ↔ JS `null`.
- `id`, `created_at`, `updated_at`: passed through as strings; no conversion needed.
