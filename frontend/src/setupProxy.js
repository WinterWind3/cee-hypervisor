const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Proxy common backend endpoints to the backend service inside Docker
  // This will proxy REST API, websockets and console/vnc endpoints while
  // leaving SPA routes (e.g. /vms) to be handled by the dev server.
  const proxyPaths = [
    '/api',
    '/ws',
    '/socket.io',
    '/novnc',
    '/noVNC',
    '/console'
  ];

  app.use(
    createProxyMiddleware(proxyPaths, {
      target: 'http://cee-backend:8000',
      changeOrigin: true,
      ws: true,
      secure: false,
      logLevel: 'info'
    })
  );
};
