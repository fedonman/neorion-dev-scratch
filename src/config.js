// AppConfig: single source of truth for runtime settings (NFR-023, System Design §1).
// Loaded from environment variables with sensible defaults. Pure and side-effect-free
// so callers and tests can pass an explicit env override. No secrets handled (NFR-010).

const DEFAULTS = Object.freeze({
  PORT: 3000,
  DATABASE_PATH: './data/todos.db',
  LOG_LEVEL: 'info',
});

function parsePort(value) {
  if (value === undefined || value === '') {
    return DEFAULTS.PORT;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || String(parsed) !== String(value).trim() || parsed <= 0) {
    throw new Error(`Invalid PORT "${value}": expected a positive integer`);
  }
  return parsed;
}

/**
 * Build the AppConfig shape { port:int, databasePath:string, logLevel:string }.
 * @param {Object} [env=process.env] environment source; injectable for tests.
 */
function loadConfig(env = process.env) {
  return {
    port: parsePort(env.PORT),
    databasePath: env.DATABASE_PATH || DEFAULTS.DATABASE_PATH,
    logLevel: env.LOG_LEVEL || DEFAULTS.LOG_LEVEL,
  };
}

export { loadConfig, DEFAULTS };
