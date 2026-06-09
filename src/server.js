// Process entry point (FR-024, NFR-020, NFR-004, NFR-024).
// Loads config, builds the app, begins listening, and shuts down gracefully
// on SIGTERM/SIGINT, allowing in-flight requests up to ~5s before forced exit.

import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './config.js';
import { createApp } from './app.js';

// Hard cap on graceful shutdown: stop accepting connections, then force exit
// if in-flight requests have not drained within this window (NFR-024).
const SHUTDOWN_TIMEOUT_MS = 5000;

async function start() {
  const config = loadConfig();

  // Repository initialization hook (FOUNDATION / data epic).
  // Once the repository exists, this becomes:
  //   await repository.initialize(config.databasePath);
  // A failure here (e.g. an invalid DB path) rejects start() and exits non-zero.

  const app = createApp(config);

  await new Promise((resolve, reject) => {
    const server = app.listen(config.port);

    server.once('listening', () => {
      console.log(`Server listening on port ${config.port}`);
      registerShutdownHandlers(server);
      resolve(server);
    });

    // A bind failure (port in use, no permission, etc.) surfaces here.
    server.once('error', reject);
  });
}

function registerShutdownHandlers(server) {
  let shuttingDown = false;

  const shutdown = (signal) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    console.log(`Received ${signal}, shutting down gracefully`);

    const forceTimer = setTimeout(() => {
      console.error('Timed out waiting for connections to close, forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    // Don't let the timer itself keep the event loop alive.
    forceTimer.unref();

    // Stop accepting new connections; exit once in-flight requests finish.
    server.close((err) => {
      clearTimeout(forceTimer);
      if (err) {
        console.error(`Error during shutdown: ${err.message}`);
        process.exit(1);
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Run only when this module is the process entry point (not when imported by tests).
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start().catch((err) => {
    console.error(`Fatal startup error: ${err.message}`);
    process.exit(1);
  });
}

export { start };
