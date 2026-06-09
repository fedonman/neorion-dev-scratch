# Style Guide

## Brand

### Voice / tone
- **Direct and minimal.** Every label, button, placeholder, and error message says exactly what it means — no marketing language, no filler.
- **Action-oriented.** Use imperative verbs: *Add todo*, *Save*, *Delete*, *Mark complete* — not *Submit*, *Confirm action*, or *Click here*.
- **Friendly, not casual.** Sentence case throughout (not ALL CAPS, not Title Case Every Word). Avoid exclamation marks except in genuine success moments (e.g., *All done!* when the list is empty).
- **Precise on errors.** Validation messages name the exact problem and how to fix it:  
  - ✅ `Title is required.`  
  - ✅ `Title must be 255 characters or fewer (currently 261).`  
  - ❌ `Invalid input.`
- **Neutral on empty states.** Empty list: *No todos yet. Add one above.* — factual, not enthusiastic.

### Colors
> No brand palette was supplied; use these accessible defaults. Override via CSS custom properties when a brand palette is defined.

| Token | Default value | Usage |
|---|---|---|
| `--color-bg` | `#f8f9fa` | Page background |
| `--color-surface` | `#ffffff` | Card / list item background |
| `--color-border` | `#dee2e6` | Input borders, dividers |
| `--color-text-primary` | `#212529` | Body text, labels |
| `--color-text-secondary` | `#6c757d` | Placeholder, secondary metadata |
| `--color-accent` | `#4263eb` | Primary button, focus ring, checkbox accent |
| `--color-danger` | `#e03131` | Delete button, error messages |
| `--color-success` | `#2f9e44` | Completed-state text/strikethrough tint |
| `--color-focus-ring` | `rgba(66,99,235,0.35)` | `:focus-visible` outline |

Contrast must meet WCAG AA (≥ 4.5 : 1 for normal text) in all foreground/background combinations.

### Typography
- **Font stack:** `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` — no web font download required.
- **Base size:** `16px` (1 rem). Do not set `font-size` on `<html>` below 16 px.
- **Scale (rem):** `0.75` (meta/timestamp) · `0.875` (secondary text) · `1` (body/label) · `1.25` (section heading) · `1.5` (page title).
- **Line height:** `1.5` for body copy; `1.2` for headings.
- **Weight:** `400` normal · `600` emphasis/headings/button labels. Avoid `700`+ except page title.
- **Completed todos:** strike through the title with `text-decoration: line-through` and apply `--color-text-secondary`.

---

## UI conventions

### Layout & structure
- Single column, centered, max-width `640 px`, `1 rem` horizontal padding on mobile.
- Page order (top → bottom): page title → add-todo form → filter/sort controls (if any) → todo list → footer (optional).
- No sidebar, no modal dialogs in v1. Inline editing only.

### Components

#### Add-todo form
- Title input: `<input type="text">`, placeholder `*Todo title*`, `aria-label="Todo title"`, `required`, `maxlength="255"`.
- Description input: `<textarea>`, placeholder `Description (optional)`, `aria-label="Description"`, `maxlength="2000"`.
- Submit button label: **Add todo**.
- On submit error: show error text immediately below the offending field (not as a page-level alert).

#### Todo list item
- Checkbox (`<input type="checkbox">`) → toggles `completed`; `aria-label="Mark '{title}' complete"`.
- Title text: plain `<span>` with line-through style when completed.
- **Edit** and **Delete** action buttons per item.
- Show `created_at` as a relative or short absolute date in secondary text (`--color-text-secondary`, `0.75 rem`).
- Editing state: replace the title `<span>` with an `<input>` in-place; show **Save** and **Cancel** buttons.

#### Buttons
- Primary (Add todo, Save): `background: var(--color-accent)`, white text, `0.5 rem 1 rem` padding, `4 px` border-radius.
- Danger (Delete): `background: var(--color-danger)`, white text, same padding.
- Ghost (Cancel, Edit): transparent background, `--color-accent` or `--color-text-secondary` text, same padding, `1 px` border.
- All buttons must have a visible `:focus-visible` ring using `--color-focus-ring`.
- Disabled state: `opacity: 0.5`, `cursor: not-allowed`.

#### Error messages
- `role="alert"` on the container so screen readers announce them.
- Color: `--color-danger`; prepend the ⚠ character or a visually equivalent icon.
- Dismiss automatically when the field value changes or the form is reset.

### Interaction feedback
- Disable the **Add todo** button while the API request is in-flight; re-enable on settle.
- Optimistic UI is not required; wait for a successful API response before updating the list.
- On API error (5xx or network failure), show a generic non-blocking banner: `Something went wrong. Please try again.`

### Accessibility
- All interactive elements reachable and operable via keyboard.
- Color is never the sole indicator of state (e.g., completed items use both strikethrough *and* color).
- `<img>` elements (if any) must have `alt` text.
- Use semantic HTML: `<main>`, `<ul>` / `<li>` for the list, `<form>`, `<button>` (not `<div onclick>`).

---

## Code conventions

### General
- **Language:** JavaScript (ESM — `"type": "module"` in `package.json`). No TypeScript in v1; types are documented via JSDoc where helpful.
- **Encoding:** UTF-8 everywhere. LF line endings (`\n`).
- **Trailing newline:** Every file ends with a single newline character.

### Naming
| Construct | Convention | Example |
|---|---|---|
| Variables & functions | `camelCase` | `createTodo`, `todoId` |
| Classes | `PascalCase` | `TodoRepository` |
| Constants (module-level, truly constant) | `SCREAMING_SNAKE_CASE` | `MAX_TITLE_LENGTH` |
| Files & directories | `kebab-case` | `todo-repository.js`, `src/routes/` |
| SQL column names | `snake_case` | `created_at`, `is_completed` |
| HTTP route params | `camelCase` in JS; `snake_case` in URL | `req.params.id` ← `/todos/:id` |
| Zod schemas | `camelCase` + `Schema` suffix | `createTodoSchema`, `updateTodoSchema` |
| Test files | `<subject>.test.js` co-located or under `tests/` | `todo-routes.test.js` |

### Directory structure
```
.
├── src/
│   ├── app.js              # Express app factory (exported, not listening)
│   ├── server.js           # Entry point: imports app, calls app.listen
│   ├── config.js           # Reads env vars, exports config object
│   ├── routes/
│   │   ├── todos.js        # /todos route handlers
│   │   └── health.js       # /health route handler
│   ├── services/
│   │   └── todo-service.js # Domain logic, validation rules
│   ├── repository/
│   │   └── todo-repository.js  # All SQLite access
│   ├── middleware/
│   │   ├── error-handler.js    # Centralized error middleware
│   │   └── request-logger.js   # Structured request logging
│   └── schemas/
│       └── todo-schemas.js # Zod schemas for request validation
├── public/
│   ├── index.html
│   ├── app.js              # Frontend vanilla JS
│   └── styles.css
├── tests/
│   ├── todo-routes.test.js
│   └── todo-repository.test.js
├── data/                   # SQLite DB files (git-ignored)
├── package.json
└── README.md
```

### Module & import rules
- Use named exports everywhere; avoid default exports except for the Express `app` in `app.js`.
- Import order (enforced by ESLint): (1) Node built-ins, (2) third-party packages, (3) internal modules. One blank line between groups.
- Do not import `req`/`res` types or HTTP concepts into `services/` or `repository/`.

### Functions & style
- Prefer `async`/`await` over raw Promises or callbacks.
- `better-sqlite3` is synchronous — do not wrap its calls in fake `async` functions unless the interface demands it.
- Maximum function length: **30 lines** (soft limit; refactor if exceeded).
- Maximum file length: **200 lines** (soft limit).
- No magic numbers — define named constants for `MAX_TITLE_LENGTH = 255`, `MAX_DESCRIPTION_LENGTH = 2000`, default port, etc.
- Early-return pattern over deeply nested `if`/`else`.

### Error handling
- Route handlers must wrap async logic in `try/catch` and call `next(err)` on failure.
- Service functions throw typed/structured errors (e.g., `{ code: 'NOT_FOUND' }`) that the error-handling middleware maps to HTTP status codes.
- Never swallow errors silently (`catch (err) {}`); always log or re-throw.
- Do not send stack traces in HTTP responses; log them server-side.

### Linting — ESLint (flat config, `eslint.config.js`)
```js
// Minimum required rules
"no-unused-vars": "error"
"no-undef": "error"
"eqeqeq": ["error", "always"]
"no-var": "error"                  // prefer const/let
"prefer-const": "error"
"no-console": "warn"               // use the logger module; console OK in scripts
"import/order": "error"            // enforce import grouping (eslint-plugin-import)
```
Run: `npm run lint` (defined as `eslint src/ tests/`).

### Formatting — Prettier (`.prettierrc`)
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```
Run: `npm run format` (defined as `prettier --write .`).  
CI check: `prettier --check .` — fail the build if formatting is not applied.

### SQL style (in `todo-repository.js`)
- Use prepared statements (`db.prepare(...)`) for every query; never string-interpolate user input.
- SQL keywords in `UPPER CASE`; table/column names in `lower_case`.
- One statement per `db.prepare` call; no multi-statement strings.
- Schema initialization runs in `initializeSchema()`, called once at startup.

### Testing conventions
- Test file names: `<module>.test.js`.
- Use `node:test` with `describe` / `it` blocks. Group by endpoint or behavior.
- Each test file creates its own temporary SQLite database (`:memory:` or `tmp` path); never share state between test files.
- Assertion style: Node's built-in `node:assert/strict`.
- Test names: full sentences describing the behavior — `'POST /todos returns 201 with created todo'`, `'POST /todos returns 400 when title is empty'`.
- No `console.log` in tests; use `assert` for all expectations.
- All tests must pass with `npm test`; no skipped tests committed to `main`.

### Git & commit hygiene
- Commit messages: imperative present tense, ≤ 72 chars: `Add toggle-complete route`, `Fix: return 404 when todo not found`.
- Do not commit `data/`, `.env`, `node_modules/`, or any file matching `.gitignore`.
- `.env.example` is committed; `.env` is not.
