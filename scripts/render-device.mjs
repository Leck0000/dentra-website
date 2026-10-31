// Builds the DENTRA scanner wand as a real 3D model (three.js), then renders it
// to transparent images for the exploded view and exports a .glb.
//
// three.js is NOT a site dependency; this script runs it in headless Edge only.
//   npm i --no-save three@0.170.0 playwright-core@1.48.2   (or set DEPS_DIR to a
//   folder where they are installed), then: node scripts/render-device.mjs
//
// Outputs
//   public/device/shell.webp, public/device/barrier.webp  (360 x 92 rig units at 4x)
//   assets/device/dentra-scanner.glb                      (source model)
//
// The camera matches components/device/kit.jsx: orthographic, looking down at
// asin(K) = 26.7 degrees, rig x 0..360 across, the wand axis on y = CY (36).
// Design units are rig units: tip at x = 30, back end at x = 330.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(process.env.DEPS_DIR ? path.join(process.env.DEPS_DIR, 'x.js') : import.meta.url);
const threeDir = path.dirname(path.dirname(req.resolve('three')));
const { chromium } = req('playwright-core');
const EDGE = process.env.BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const SCALE = 4;

const page = /* html */ `<!doctype html><meta charset="utf-8">
<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<script type="module">
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

const W = 360 * ${SCALE}, H = 92 * ${SCALE};
const K = 0.45, X0 = 30, LEN = 300;
const TEAL = 0x2ca6a4, MINT = 0x4dd8c8;

// Radius profile along the axis, s = distance from the tip.
const profile = new THREE.SplineCurve([
  [0, 0], [0.8, 5.5], [3, 9.2], [7, 11.4], [14, 12.4], [40, 12.8], [80, 13.2], [110, 13.9],
  [124, 15.2], [134, 16.6], [150, 18.6], [185, 21.3], [230, 22.8], [265, 22.6], [286, 21],
  [296, 17.5], [299.4, 11], [300, 0],
].map(([s, r]) => new THREE.Vector2(s, r)));
const samples = profile.getSpacedPoints(300);
const rAt = (s) => samples.reduce((a, p) => (Math.abs(p.x - s) < Math.abs(a.x - s) ? p : a)).y;
// The head is a little flatter than it is wide.
const flat = (s) => (s < 140 ? 0.8 + 0.2 * Math.pow(s / 140, 1.5) : 1);

// Lathe around the axis, laid along +X with the tip at x = X0; +Y is the top.
function lathe(points, segments = 128) {
  const g = new THREE.LatheGeometry(points.map((p) => new THREE.Vector2(Math.max(p.y, 0), p.x)), segments);
  g.rotateZ(-Math.PI / 2);
  const pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const s = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    uv.setXY(i, s / LEN, 0.5 + Math.atan2(z, y) / (2 * Math.PI)); // u along, v around (0.5 = top)
    pos.setXYZ(i, s + X0, y * flat(s), z);
  }
  g.computeVertexNormals();
  return g;
}

// Surface details painted in (s, angle) space: optical window, wordmark, status light.
const tex = document.createElement('canvas');
tex.width = 2048; tex.height = 512;
const c = tex.getContext('2d');
const U = tex.width / LEN, V = tex.height / (2 * Math.PI);
c.fillStyle = '#f3f6f6'; c.fillRect(0, 0, tex.width, tex.height);
const vy = (a) => tex.height / 2 + a * V;
// window: s 8..36, +-0.48 rad around the top
c.fillStyle = '#0d1a1e';
c.beginPath(); c.roundRect(8 * U, vy(-0.5), 30 * U, 1.0 * V, 30); c.fill();
const glass = c.createLinearGradient(8 * U, 0, 36 * U, 0);
glass.addColorStop(0, 'rgba(77,216,200,0.35)'); glass.addColorStop(1, 'rgba(77,216,200,0.05)');
c.fillStyle = glass; c.beginPath(); c.roundRect(10 * U, vy(-0.42), 26 * U, 0.84 * V, 24); c.fill();
// wordmark along the handle (glyph height compensated for the handle radius)
c.save(); c.translate(198 * U, vy(0)); c.scale(1, -(V / 22.5) / U); // v runs opposite to text-up
c.fillStyle = '#c3cccc'; c.font = '600 ' + (3.6 * U) + 'px sans-serif'; c.textBaseline = 'middle';
c.letterSpacing = (1.6 * U) + 'px'; c.fillText('DENTRA', 0, 0); c.restore();
// status light near the back end
c.fillStyle = '#4dd8c8'; c.beginPath(); c.ellipse(282 * U, vy(0), 1.6 * U, 1.6 * U * (V / 22.6) / U, 0, 0, Math.PI * 2); c.fill();
const map = new THREE.CanvasTexture(tex); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;

const shell = new THREE.Group(); shell.name = 'shell';
const body = new THREE.Mesh(lathe(samples), new THREE.MeshPhysicalMaterial({ map, color: 0xeef2f2, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.18 }));
body.name = 'body'; shell.add(body);
const ringR = rAt(129);
const ring = new THREE.Mesh(new THREE.TorusGeometry(ringR, 0.95, 16, 160),
  new THREE.MeshPhysicalMaterial({ color: MINT, emissive: TEAL, emissiveIntensity: 0.55, roughness: 0.3 }));
ring.rotation.y = Math.PI / 2; ring.position.x = X0 + 129; ring.scale.set(1, flat(129), 1);
ring.name = 'accent-ring'; shell.add(ring);
const button = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.MeshPhysicalMaterial({ color: 0xe6ecec, roughness: 0.25, clearcoat: 0.8 }));
button.scale.set(10, 2.4, 6.5); button.position.set(X0 + 160, rAt(160) - 1.1, 0); button.name = 'button'; shell.add(button);

// Disposable barrier: a clear sleeve over the head, open at the back.
const sleevePts = samples.filter((p) => p.x <= 104).map((p) => new THREE.Vector2(p.x - 1.4 * (1 - Math.min(1, p.y / 12)), p.y + 1.4));
const barrier = new THREE.Group(); barrier.name = 'barrier';
const film = new THREE.Mesh(lathe(sleevePts), new THREE.MeshPhysicalMaterial({
  color: 0xffffff, transparent: true, opacity: 0.34, roughness: 0.08, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false,
}));
const rim = new THREE.Mesh(new THREE.TorusGeometry(rAt(104) + 1.4, 0.45, 16, 160),
  new THREE.MeshPhysicalMaterial({ color: 0xb2ede7, transparent: true, opacity: 0.75, roughness: 0.2 }));
rim.rotation.y = Math.PI / 2; rim.position.x = X0 + 104; rim.scale.set(1, flat(104), 1);
barrier.add(film, rim);

const scene = new THREE.Scene();
scene.add(shell, barrier);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.5; // keep contrast so the white body has form
const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-100, 320, 120); scene.add(key);
const fill = new THREE.DirectionalLight(0xd8f4f1, 0.5); fill.position.set(200, -60, 260); scene.add(fill);

const phi = Math.asin(K);
const cam = new THREE.OrthographicCamera(-180, 180, 36, -56, 1, 4000);
cam.position.set(180, Math.sin(phi) * 1000, Math.cos(phi) * 1000); cam.lookAt(180, 0, 0);

const shot = (showShell, showBarrier) => {
  shell.visible = showShell; barrier.visible = showBarrier;
  renderer.render(scene, cam);
  return renderer.domElement.toDataURL(showShell && showBarrier ? 'image/png' : 'image/webp', 0.92);
};
const out = { shell: shot(true, false), barrier: shot(false, true), preview: shot(true, true) };
shell.visible = barrier.visible = true;
new GLTFExporter().parse(scene, (glb) => {
  let bin = ''; const bytes = new Uint8Array(glb);
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  out.glb = btoa(bin); window.__out = out;
}, (e) => { window.__out = { error: String(e) }; }, { binary: true });
</script>`;

const server = http.createServer((rq, rs) => {
  if (rq.url === '/') return rs.writeHead(200, { 'content-type': 'text/html' }).end(page);
  const file = path.join(threeDir, decodeURIComponent(rq.url.replace(/^\/three\//, '')));
  if (!rq.url.startsWith('/three/') || !fs.existsSync(file)) return rs.writeHead(404).end();
  rs.writeHead(200, { 'content-type': 'text/javascript' }).end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(0, r));

const browser = await chromium.launch({ executablePath: EDGE, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const tab = await browser.newPage();
tab.on('pageerror', (e) => console.error('page error:', e.message));
await tab.goto(`http://localhost:${server.address().port}/`);
await tab.waitForFunction(() => window.__out, null, { timeout: 120000 });
const out = await tab.evaluate(() => window.__out);
await browser.close();
server.close();
if (out.error) throw new Error(out.error);

const write = (rel, dataUrl) => {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(dataUrl.split(',').pop(), 'base64'));
  console.log(`${rel}  ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
};
write('public/device/shell.webp', out.shell);
write('public/device/barrier.webp', out.barrier);
write('assets/device/dentra-scanner.glb', out.glb);
if (process.env.PREVIEW) write(path.relative(root, process.env.PREVIEW), out.preview);
