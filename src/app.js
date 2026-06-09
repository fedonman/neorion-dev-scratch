import http from 'node:http';

/**
 * App factory: build the HTTP application (System Design §1, FR-024).
 *
 * Returns an http.Server so the entry point can call .listen()/.close()
 * directly. The request handler is intentionally minimal here — routing and
 * the Todo API are added by later epics. It currently answers a liveness
 * check and replies 404 for everything else, so the server is exercisable.
 *
 * @param {Object} [config] runtime configuration (AppConfig shape); reserved
 *   for handlers added by later epics.
 */
function createApp(config) {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  });
}

export { createApp };
