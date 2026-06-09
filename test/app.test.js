'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

test('createApp returns a configured Express app that does not listen', () => {
  const app = createApp();
  // An Express app is a request-handler function exposing the app API.
  assert.equal(typeof app, 'function');
  assert.equal(typeof app.listen, 'function');
  assert.equal(typeof app.use, 'function');
});

test('a request can be issued against the app in-process via supertest', async () => {
  const app = createApp({ config: { databasePath: ':memory:' } });
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: 'ok' });
});

test('express.json() parses JSON request bodies into req.body', async () => {
  // The route is attached through the pluggable hook and echoes req.body,
  // which proves express.json() ran before routes were mounted.
  const app = createApp({
    config: { databasePath: ':memory:' },
    routes: (a) => {
      a.post('/echo', (req, res) => res.json(req.body));
    },
  });

  const res = await request(app)
    .post('/echo')
    .set('Content-Type', 'application/json')
    .send({ title: 'buy milk', done: false });

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { title: 'buy milk', done: false });
});

test('injected dependencies (e.g. a temp DB path) reach route hooks', async () => {
  const tempDbPath = '/tmp/neorion-test-todos.db';
  const app = createApp({
    config: { databasePath: tempDbPath },
    routes: (a, deps) => {
      a.get('/db', (req, res) => res.json({ databasePath: deps.config.databasePath }));
    },
  });

  const res = await request(app).get('/db');
  assert.equal(res.status, 200);
  assert.equal(res.body.databasePath, tempDbPath);
});
