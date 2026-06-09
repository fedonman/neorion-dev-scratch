# Non-Functional Requirements

## TodoApp — NFR Specification

| ID | Category | Requirement | Target / Measure |
|---|---|---|---|
| NFR-001 | Performance | p95 response latency — all CRUD API endpoints (`POST /todos`, `GET /todos`, `PATCH /todos/{id}`, `DELETE /todos/{id}`) under normal single-user load (≤10 concurrent requests, dataset ≤10 000 items) | **p95 < 100 ms** measured at the server (loopback); absolute ceiling **< 200 ms** |
| NFR-002 | Performance | `GET /todos` with up to 10 000 rows in SQLite | Response time **< 200 ms p95**; DB query time **< 50 ms** |
| NFR-003 | Performance | `GET /health` response time | **< 50 ms p95** (trivial `SELECT 1`) |
| NFR-004 | Performance | Server process startup time (from `npm start` to first request accepted) | **< 5 seconds** on a modern dev machine |
| NFR-005 | Security | SQL injection prevention | All DB interactions use **prepared/parameterized statements** via `better-sqlite3`; zero raw string interpolation into queries |
| NFR-006 | Security | Input length enforcement | `title`: 1–255 chars; `description`: 0–2 000 chars; requests exceeding limits rejected with **HTTP 400** before reaching the DB |
| NFR-007 | Security | Untrusted field rejection | Client-supplied `id`, `created_at`, and `updated_at` fields are **silently stripped** by the service layer and never persisted as-is |
| NFR-008 | Security | No sensitive data in error responses | HTTP 5xx responses return a **generic JSON `{error}` message only**; stack traces, file paths, and SQL details are logged **server-side only**, never returned to the client |
| NFR-009 | Security | Health endpoint information exposure | `GET /health` returns only `{status, timestamp}`; DB internals, file paths, and version details are **not included** in the response body |
| NFR-010 | Security | No authentication bypass surface | All endpoints are intentionally open (single-user v1); **no auth tokens or credentials are accepted, stored, or logged** (no attack surface to mis-handle) |
| NFR-011 | Availability | Single-user uptime target (self-hosted, local) | **99% uptime** during active use sessions (planned maintenance excluded; no HA required for v1) |
| NFR-012 | Availability | Recovery from process crash | On unhandled exception the process **exits with a non-zero code** (no silent zombie); a process manager (e.g. `pm2`, Docker restart policy) can recover it; **RTO < 30 seconds** |
| NFR-013 | Availability | Health-check accuracy | `GET /health` must return **HTTP 503** (not 200) within **2 seconds** of the SQLite file becoming unreadable or the DB connection failing |
| NFR-014 | Availability | Data durability across restart | **100%** of todos written with a successful `201` response must be present after a clean or abrupt server restart; verified by automated persistence test |
| NFR-015 | Availability | RPO (Recovery Point Objective) | **RPO = 0** for committed writes — `better-sqlite3` synchronous writes ensure every acknowledged write is flushed to the SQLite file before the response is returned |
| NFR-016 | Availability | RTO (Recovery Time Objective) | **RTO < 30 seconds** — service resumes full operation (DB reconnected, API accepting requests) after process restart without manual intervention |
| NFR-017 | Scalability | Concurrency baseline | Application must handle **≥ 10 simultaneous HTTP requests** without deadlock or data corruption (synchronous `better-sqlite3` serializes DB writes; acceptable for single-user workload) |
| NFR-018 | Scalability | Dataset size | Application must remain within NFR-001/NFR-002 latency targets with up to **10 000 todo records** in the SQLite file |
| NFR-019 | Scalability | Horizontal scaling | **Not required for v1** — single-process, single-file SQLite; architecture documents the seam (repository layer) for future Postgres migration |
| NFR-020 | Operability | One-command startup | `npm install && npm start` from a clean checkout must bring up the full stack (server + DB schema init + static UI) with **zero manual pre-configuration** |
| NFR-021 | Operability | One-command test execution | `npm test` must run the full automated test suite and report pass/fail; exit code **0** on full pass, **non-zero** on any failure |
| NFR-022 | Operability | Structured request logging | Every HTTP request logs **method, path, status code, and latency (ms)** to stdout in a consistent format; log level configurable via `LOG_LEVEL` env var (default `info`) |
| NFR-023 | Operability | Configuration via environment | `PORT` (default `3000`), `DATABASE_PATH` (default `./data/todos.db`), and `LOG_LEVEL` must be **overridable via environment variables** with no code changes |
| NFR-024 | Operability | Graceful shutdown | On `SIGTERM`/`SIGINT` the server stops accepting new connections and allows in-flight requests up to **5 seconds** before forcibly exiting |
| NFR-025 | Operability | Schema auto-migration on startup | The repository layer runs `CREATE TABLE IF NOT EXISTS` (and any future migrations) on startup so the DB schema is **always current** without a manual migration step |
| NFR-026 | Testability | API test coverage | Automated tests must cover **all 5 core API operations** (create, list, update, toggle, delete) — happy paths — plus **validation error paths** (empty title, over-length title, malformed JSON, unknown `id` → 404) |
| NFR-027 | Testability | Persistence test | Test suite must include **at least one test** that writes a todo, reopens the SQLite file with a fresh repository instance, and asserts the record is present |
| NFR-028 | Testability | Test isolation | Each test run uses a **temporary, unique SQLite file** (or `:memory:` where durability is not under test); no shared state between test cases |
| NFR-029 | Testability | Test runtime | `npm test` (full suite) must complete in **< 30 seconds** on a standard developer laptop |

## Notes

- **Latency targets** (NFR-001–NFR-003) are measured at the application layer on loopback (`localhost`); network round-trip to the browser is outside scope for v1.
- **Security posture** (NFR-005–NFR-010) is intentionally minimal for a single-user local tool; if the app is ever exposed beyond localhost, an authentication layer and HTTPS termination must be added before these NFRs are considered sufficient.
- **Scalability** (NFR-017–NFR-019): synchronous `better-sqlite3` is an accepted constraint for single-user load; the NFR documents the known ceiling rather than masking it.
- All NFRs are verifiable: performance targets via `autocannon` or `supertest` timing assertions; security targets via code review + test assertions; availability/durability targets via the automated test suite.
