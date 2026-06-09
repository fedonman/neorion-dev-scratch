'use strict';

const test = require('node:test');
const assert = require('node:assert');
const express = require('express');
const request = require('supertest');
const { createApp } = require('../src/app');

test('createApp returns a configured Express app that does not listen', () => {
  const app = createApp();
  // An Express app is itself a request-handler function exposing listen().
  assert.strictEqual(typeof app, 'function');
  assert.strictEqual(typeof app.listen, 'function');
});

test('express.json() parses JSON request bodies', async () => {
  const router = express.Router();
  router.post('/echo', (req, res) => res.json({ received: req.body }));

  const app = createApp({ routers: [{ router }] });

  const res = await request(app)
    .post('/echo')
    .set('Content-Type', 'application/json')
    .send({ hello: 'world' });

  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { received: { hello: 'world' } });
});

test('createApp accepts injected dependencies (e.g. config with a temp DB path)', () => {
  const config = { dbPath: '/tmp/neorion-test.db' };
  const app = createApp({ config });
  assert.strictEqual(app.locals.config, config);
});
