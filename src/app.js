'use strict';

const express = require('express');

/**
 * App factory: construct and configure the Express application
 * (Architecture §3.1, Test Strategy integration layer).
 *
 * It does NOT call listen() — the returned app is reused by the server entry
 * point (which binds a port) and by in-process supertest API tests.
 *
 * Middleware is mounted in a deliberate order:
 *   1. request logger              — added in a later ticket
 *   2. express.json()              — parse JSON request bodies into req.body
 *   3. routes                      — built-in liveness + pluggable epic routers
 *   4. 404 catch-all + error handler — added in a later ticket
 *
 * @param {Object} [deps] injected dependencies, so tests can supply e.g. a
 *   temp DB path via config or a stub repository.
 * @param {Object} [deps.config] runtime configuration (AppConfig shape).
 * @param {Object} [deps.repository] persistence layer (attached by the data epic).
 * @param {(app: import('express').Express, deps: Object) => void} [deps.routes]
 *   hook used by AUTH/TODOS epics to attach their routers.
 * @returns {import('express').Express} a configured Express app (not listening).
 */
function createApp(deps = {}) {
  const app = express();

  // 1. Request logger middleware — added in a later ticket.

  // 2. Parse JSON request bodies into req.body.
  app.use(express.json());

  // 3. Routes.
  // Liveness check, so the server is exercisable before epics add their APIs.
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Pluggable route mounting: AUTH/TODOS epics attach their routers here,
  // after body parsing and before the 404/error handlers.
  if (typeof deps.routes === 'function') {
    deps.routes(app, deps);
  }

  // 4. 404 catch-all + error handler — added in a later ticket.

  return app;
}

module.exports = { createApp };
