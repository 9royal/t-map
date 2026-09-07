import http from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', 'dist');
const port = Number(process.env.PORT || 4173);

if (!existsSync(path.join(root, 'index.html'))) {
  console.error('找不到 dist/index.html；請先執行 npm run build。');
  process.exit(1);
}

const types = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg'
};

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
    const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
    let file = path.join(root, safePath === '/' ? 'index.html' : safePath);
    if (!file.startsWith(root)) throw new Error('Invalid path');
    if (!existsSync(file) || (await stat(file)).isDirectory()) file = path.join(root, 'index.html');
    res.setHeader('Content-Type', types[path.extname(file).toLowerCase()] || 'application/octet-stream');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    createReadStream(file).pipe(res);
  } catch {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`T map v1.02 local preview: http://127.0.0.1:${port}`);
});
