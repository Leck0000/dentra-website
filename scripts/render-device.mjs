// Renders the DENTRA camera's 3D scene (components/device/scene/) to still
// images, in headless Chromium, from the same modules the site runs.
//
//   npm i --no-save playwright-core@1.56.1   (or set DEPS_DIR to a folder where
//   playwright or playwright-core is installed), then:
//   node scripts/render-device.mjs
//
// Outputs
//   public/device/assembled.webp  poster while three.js loads, and the no-WebGL fallback
//   public/device/exploded.webp   the reduced-motion and no-WebGL exploded view
//
// FRAMES=<dir> F="0,1.5,2.5" writes PNGs of those scroll positions instead
// (for checking the animation). BROWSER=<path> picks a Chromium/Edge binary.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(process.env.DEPS_DIR ? path.join(process.env.DEPS_DIR, 'x.js') : import.meta.url);
const pw = (() => {
  for (const name of ['playwright-core', 'playwright']) {
    try {
      return req(name);
    } catch {}
  }
  throw new Error('Install playwright-core (npm i --no-save playwright-core) or set DEPS_DIR.');
})();
const threeDir = path.join(root, 'node_modules', 'three');

const W = Number(process.env.W || 1200);
const H = Number(process.env.H || 1200);

const page = /* html */ `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;background:transparent}canvas{display:block}</style>
<canvas id="c" style="width:${W}px;height:${H}px"></canvas>
<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<script type="module">
import { createDeviceScene } from '/components/device/scene/scene.js';
const canvas = document.getElementById('c');
const scene = createDeviceScene(canvas);
scene.resize(${W}, ${H}, 1);
window.shot = (f, t, type) => {
  // Settle the pointer smoothing and draw twice so every state is current.
  for (let i = 0; i < 3; i++) scene.render(f, t);
  return canvas.toDataURL(type, 0.9);
};
window.ready = true;
</script>`;

const types = { '.js': 'text/javascript', '.mjs': 'text/javascript' };
const server = http.createServer((rq, rs) => {
  const url = decodeURIComponent(rq.url.split('?')[0]);
  if (url === '/') return rs.writeHead(200, { 'content-type': 'text/html' }).end(page);
  const file = url.startsWith('/three/') ? path.join(threeDir, url.slice(7)) : url.startsWith('/components/') ? path.join(root, url) : null;
  if (!file || !file.startsWith(root) || !fs.existsSync(file)) return rs.writeHead(404).end();
  rs.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }).end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(0, r));

const browser = await pw.chromium.launch({
  executablePath: process.env.BROWSER || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const tab = await browser.newPage({ viewport: { width: W, height: H } });
const errors = [];
tab.on('pageerror', (e) => errors.push(e.message));
tab.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await tab.goto(`http://localhost:${server.address().port}/`);
await tab.waitForFunction(() => window.ready || false, null, { timeout: 120000 }).catch(() => {});
if (errors.length) {
  await browser.close();
  server.close();
  throw new Error(errors.join('\n'));
}

const write = (file, dataUrl) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(dataUrl.split(',').pop(), 'base64'));
  console.log(`${path.relative(process.cwd(), file)}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
};

if (process.env.FRAMES) {
  const fs_ = (process.env.F || '-0.5,0,1,1.6,2.6,3.6,4.6,5.6,6.6,7.6,8.6,9.6,10.4,10.95').split(',').map(Number);
  for (const f of fs_) write(path.join(process.env.FRAMES, `f${f.toFixed(2)}.png`), await tab.evaluate(([f]) => window.shot(f, 1.3, 'image/png'), [f]));
} else {
  // t = 1.3 s: between flashes, sway near the middle.
  write(path.join(root, 'public/device/assembled.webp'), await tab.evaluate(() => window.shot(0.2, 2.6, 'image/webp')));
  write(path.join(root, 'public/device/exploded.webp'), await tab.evaluate(() => window.shot(9.96, 1.3, 'image/webp')));
}
await browser.close();
server.close();
