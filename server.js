// server.js — paprastas statinis serveris be jokio npm
const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT = process.env.PORT || 5173;
const HOST = '0.0.0.0'; // matomas per LAN/VPN

const MIME = {
  '.html':'text/html; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.mjs':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.gif':'image/gif',
  '.ico':'image/x-icon',
  '.pdf':'application/pdf',
  '.txt':'text/plain; charset=utf-8',
  '.woff':'font/woff',
  '.woff2':'font/woff2'
};

const ROOT = process.cwd();

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  let pathname = decodeURI(parsed.pathname || '/');

  // default – index.html
  if (pathname === '/') pathname = '/index.html';

  // apsauga nuo išeities už katalogo ribų
  const safePath = path.normalize(path.join(ROOT, pathname)).replace(/\\/g, '/');
  if (!safePath.startsWith(ROOT.replace(/\\/g,'/'))) {
    res.writeHead(403); return res.end('Forbidden');
  }

  fs.stat(safePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404); return res.end('Not found');
    }
    const ext = path.extname(safePath).toLowerCase();
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    // paprasti cache headeriai statiniams
    res.setHeader('Cache-Control', 'public, max-age=3600');
    fs.createReadStream(safePath).pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Serving ${ROOT}`);
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Network: http://${getLocalIp()}:${PORT}`);
});

function getLocalIp() {
  const os = require('os');
  for (const ni of Object.values(os.networkInterfaces())) {
    for (const i of ni || []) {
      if (i.family === 'IPv4' && !i.internal) return i.address;
    }
  }
  return '127.0.0.1';
}
