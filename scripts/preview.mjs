import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const directory = path.resolve('out');
const port = Number(process.env.LUMNI_PREVIEW_PORT || 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};
http
  .createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', 'http://localhost');
      let file = path.resolve(directory, '.' + decodeURIComponent(url.pathname));
      if (!file.startsWith(directory + path.sep) && file !== directory) {
        response.writeHead(403);
        response.end();
        return;
      }
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const data = await readFile(file);
      response.writeHead(200, {
        'Content-Type': types[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': url.pathname.startsWith('/_next/static/')
          ? 'public, max-age=31536000, immutable'
          : 'no-cache',
        ...(url.pathname === '/sw.js' ? { 'Service-Worker-Allowed': '/' } : {}),
      });
      response.end(data);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('Not found');
    }
  })
  .listen(port, '127.0.0.1', () =>
    console.log(`Lumni production preview: http://127.0.0.1:${port}`),
  );
