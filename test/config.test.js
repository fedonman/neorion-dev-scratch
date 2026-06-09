import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig, DEFAULTS } from '../src/config.js';

test('applies defaults when env vars are unset', () => {
  const config = loadConfig({});
  assert.equal(config.port, 3000);
  assert.equal(config.databasePath, './data/todos.db');
  assert.equal(config.logLevel, 'info');
});

test('env vars override the defaults', () => {
  const config = loadConfig({
    PORT: '8080',
    DATABASE_PATH: '/var/lib/todos.db',
    LOG_LEVEL: 'debug',
  });
  assert.equal(config.port, 8080);
  assert.equal(config.databasePath, '/var/lib/todos.db');
  assert.equal(config.logLevel, 'debug');
});

test('PORT is parsed as an integer', () => {
  const config = loadConfig({ PORT: '5000' });
  assert.equal(config.port, 5000);
  assert.equal(typeof config.port, 'number');
  assert.ok(Number.isInteger(config.port));
});

test('rejects a non-integer PORT', () => {
  assert.throws(() => loadConfig({ PORT: 'not-a-number' }), /Invalid PORT/);
  assert.throws(() => loadConfig({ PORT: '3000.5' }), /Invalid PORT/);
});

test('DEFAULTS are exposed and frozen', () => {
  assert.equal(DEFAULTS.PORT, 3000);
  assert.equal(DEFAULTS.DATABASE_PATH, './data/todos.db');
  assert.equal(DEFAULTS.LOG_LEVEL, 'info');
});
