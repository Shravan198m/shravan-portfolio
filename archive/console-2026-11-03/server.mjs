import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.pdf':'application/pdf','.json':'application/json'};
const portFlag = process.argv.indexOf('--port');
const requestedPort = Number(portFlag >= 0 ? process.argv[portFlag + 1] : 4174);
if (!Number.isInteger(requestedPort) || requestedPort < 1024 || requestedPort > 65535) throw new Error('Choose a port between 1024 and 65535.');
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, {'Allow':'GET, HEAD'}); res.end(); return; }
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep) || pathname.includes('\0')) { res.writeHead(403); res.end(); return; }
    const relative = path.relative(root,file);
    if (relative.startsWith('qa' + path.sep) || relative.startsWith('.') || ['server.mjs','package.json','start.ps1'].includes(relative)) { res.writeHead(404); res.end(); return; }
    const info = await stat(file);
    if (!info.isFile()) throw new Error('Not a file');
    const headers = {'Content-Type':types[path.extname(file).toLowerCase()] || 'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
    let start = 0, end = info.size - 1, status = 200;
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!match || (!match[1] && !match[2])) { res.writeHead(416, {'Content-Range':`bytes */${info.size}`}); res.end(); return; }
      if (!match[1]) start = Math.max(0, info.size - Number(match[2]));
      else { start = Number(match[1]); if (match[2]) end = Math.min(end,Number(match[2])); }
      if (start > end || start >= info.size) { res.writeHead(416, {'Content-Range':`bytes */${info.size}`}); res.end(); return; }
      headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
      status = 206;
    }
    headers['Content-Length'] = end - start + 1;
    res.writeHead(status, headers);
    if (req.method === 'HEAD') { res.end(); return; }
    const stream = createReadStream(file,{start,end});
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  } catch { if (!res.headersSent) res.writeHead(404, {'Content-Type':'text/plain'}); res.end('Not found'); }
});
let port = requestedPort;
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE' && port < requestedPort + 20 && port < 65535) server.listen(++port,'127.0.0.1');
  else { console.error(error.message); process.exitCode = 1; }
});
server.listen(port,'127.0.0.1',() => console.log(`SVM Portfolio Console\nLocal: http://127.0.0.1:${port}\nServing: ${root}\nPress Ctrl+C to stop.`));
