'use strict';

const express = require('express');

/**
 * Construct and configure the Express application without binding to a port,
 * so it can be reused by the server entry point and by in-process supertest
 * API tests (Architecture §3.1).
 *
 * Middleware is mounted in a fixed order. Items marked "later" are placeholders
 * for tickets that slot into this order without changing it:
 *   1. request logger        (added in a later ticket)
 *   2. express.json()        body parsing
 *   3. routes                (attached by AUTH/TODOS epics via deps.routers)
 *   4. 404 catch-all + error handler (added in a later ticket)
 *
 * @param {object} [deps] injected dependencies so tests can supply their own
 *   collaborators (e.g. a config pointing at a temp DB path, or a repository).
 * @param {object} [deps.config] application configuration.
 * @param {object} [deps.repository] data-access layer.
 * @param {Array<{path?: string, router: import('express').Router}>} [deps.routers]
 *   routers to mount; AUTH/TODOS epics attach their routers here.
 * @returns {import('express').Express} the configured app. listen() is NOT called.
 */
function createApp(deps = {}) {
  const app = express();

  // Make injected dependencies available to routers/middleware added later.
  app.locals.config = deps.config;
  app.locals.repository = deps.repository;

  // 1. request logger — added in a later ticket.

  // 2. JSON body parsing.
  app.use(express.json());

  // 3. routes — kept pluggable so other epics attach their routers.
  if (Array.isArray(deps.routers)) {
    for (const { path, router } of deps.routers) {
      if (path) {
        app.use(path, router);
      } else {
        app.use(router);
      }
    }
  }

  // 4. 404 catch-all + error handler — added in a later ticket.

  return app;
}

module.exports = { createApp };
