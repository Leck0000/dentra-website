// The DENTRA camera as a set of separable parts, built in three.js.
//
// The shell is a port of the mobile app's own model, so the site shows the same
// device the app does:
//   dentra_mobile/lib/features/scan/rendering/device_model.dart     (shape)
//   dentra_mobile/lib/features/scan/rendering/device_renderer.dart  (lens, LEDs,
//                                                buttons, power switch, name)
// Same splines, neck lean, flat-faced head, seams and colours. Units are
// millimetres: the axis is +y (base at -88, tip at +88) and the lens faces +z.
//
// The app draws one closed shell. Here it is cut where the enclosure comes
// apart (the teal end cap at the base seam, and a front/back split down the
// sides), and the parts inside are added from the app's schematic notes:
// ESP32-S3 board, 2000 mAh cell, OV5640 camera on a ribbon up the neck, and a
// ring of ten LEDs (four NIR among six white) round the lens.
//
// Client-only: it draws textures on <canvas>. Import it dynamically.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const clamp = (x, lo = 0, hi = 1) => (x < lo ? lo : x > hi ? hi : x);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const srgb = (r, g, b) => new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace);

// ---------- Shape: device_model.dart ----------

export const BASE_Y = -88;
export const TIP_Y = 88;
export const HEAD_Y = 80;
const HEAD_R = 8;
const HEAD_D = 5.2;
const CAP_Y = -72;
const BASE_SEAM = -71;
const BAND_BOTTOM = 11;
const BAND_TOP = 13.2;
const SEGMENTS = 72;
const WALL = 1.4; // enclosure wall, for the inside faces once it opens

const WIDTH = [[CAP_Y, 16.2], [-62, 16.9], [-38, 16.6], [-12, 15.4], [6, 13.4], [20, 10.4], [34, 8], [48, 6.6], [58, 6.2], [66, 6.3], [72, 6.9], [77, 7.7], [HEAD_Y, HEAD_R]];
const DEPTH = [[CAP_Y, 11.4], [-62, 12], [-38, 11.8], [-12, 11], [6, 9.6], [20, 7.6], [34, 5.9], [48, 5], [58, 5], [68, 5], [74, 5.1], [HEAD_Y, HEAD_D]];
const SQUARE = [[CAP_Y, 3.2], [6, 3.2], [34, 2.5], [58, 2.5], [68, 4], [TIP_Y, 4]];

const SHELL = srgb(0.955, 0.972, 0.972);
const ACCENT = srgb(0.173, 0.651, 0.643); // AppColors.g2
const SEAM = srgb(0.55, 0.65, 0.67);

/** Smooth curve through keys (Hermite, flat at both ends). */
function spline(keys, y) {
  if (y <= keys[0][0]) return keys[0][1];
  if (y >= keys[keys.length - 1][0]) return keys[keys.length - 1][1];
  let i = 0;
  while (y > keys[i + 1][0]) i++;
  const slope = (k) => (k <= 0 || k >= keys.length - 1 ? 0 : (keys[k + 1][1] - keys[k - 1][1]) / (keys[k + 1][0] - keys[k - 1][0]));
  const [x0, v0] = keys[i];
  const [x1, v1] = keys[i + 1];
  const h = x1 - x0;
  const t = (y - x0) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * v0 + (t3 - 2 * t2 + t) * h * slope(i) + (3 * t2 - 2 * t3) * v1 + (t3 - t2) * h * slope(i + 1);
}

/** The neck leans forward, so the head reaches the teeth ahead of the hand. */
export function lean(y) {
  const t = clamp((y - 6) / 56);
  return 5.5 * t * t * (3 - 2 * t);
}

function radii(y) {
  if (y < CAP_Y) {
    const k = clamp((CAP_Y - y) / (CAP_Y - BASE_Y));
    const s = Math.cbrt(1 - k * k * k);
    return [spline(WIDTH, CAP_Y) * s, spline(DEPTH, CAP_Y) * s];
  }
  if (y <= HEAD_Y) return [spline(WIDTH, y), spline(DEPTH, y)];
  // A flat-faced disc: full depth almost to its rim.
  const k = clamp((y - HEAD_Y) / HEAD_R);
  return [HEAD_R * Math.sqrt(1 - k * k), HEAD_D * Math.pow(1 - Math.pow(k, 5), 0.2)];
}

/** The point on the shell at height y and angle round it (0 = +x side, pi/2 = front), inset under the surface. */
export function surface(y, angle, inset = 0, out = V()) {
  const [a, b] = radii(y);
  const e = 2 / spline(SQUARE, y);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const A = Math.max(a - inset, 0);
  const B = Math.max(b - inset, 0);
  return out.set(A * Math.sign(c) * Math.pow(Math.abs(c), e), y, lean(y) + B * Math.sign(s) * Math.pow(Math.abs(s), e));
}

/** The flat patch touching the shell at height y and angle round it (DeviceModel.patch). */
function patchAt(y, angle) {
  const dy = 0.5;
  const da = 0.04;
  const center = surface(y, angle);
  const right = surface(y, angle - da).sub(surface(y, angle + da)).normalize();
  const up = surface(y + dy, angle).sub(surface(y - dy, angle)).normalize();
  const normal = V().crossVectors(right, up).normalize();
  up.crossVectors(normal, right).normalize();
  return { center, right, up, normal };
}
const frontPatch = (y) => patchAt(y, Math.PI / 2);

/** z of the front of the shell at (x, y), inset under the surface. */
function frontZ(x, y, inset = 0) {
  const [a0, b0] = radii(y);
  const a = Math.max(a0 - inset, 1e-6);
  const b = Math.max(b0 - inset, 0);
  const e = 2 / spline(SQUARE, y);
  const t = clamp(x / a, -1, 1);
  const c = Math.sign(t) * Math.pow(Math.abs(t), 1 / e);
  return lean(y) + b * Math.pow(Math.sqrt(Math.max(0, 1 - c * c)), e);
}

/** p moved onto the shell (along its cross-section), lifted off it by lift. */
function onShell(p, lift = 0, out = V()) {
  const [a, b] = radii(p.y);
  const e = 2 / spline(SQUARE, p.y);
  const dx = p.x / a;
  const dz = (p.z - lean(p.y)) / b;
  const c = Math.sign(dx) * Math.pow(Math.abs(dx), 1 / e);
  const s = Math.sign(dz) * Math.pow(Math.abs(dz), 1 / e);
  return surface(p.y, Math.atan2(s, c), -lift, out);
}

/** Heights of the rings, denser where the shape curves (DeviceModel._stations). */
function stations() {
  const out = [];
  for (let k = 23; k >= 1; k--) out.push(CAP_Y - (CAP_Y - BASE_Y) * Math.sin(((k / 24) * Math.PI) / 2));
  for (let y = CAP_Y; y < 6; y += 3) out.push(y);
  for (let y = 6; y < 62; y += 2) out.push(y);
  for (let y = 62; y < HEAD_Y; y += 1) out.push(y);
  for (let k = 0; k < 28; k++) out.push(HEAD_Y + HEAD_R * Math.sin(((k / 28) * Math.PI) / 2));
  return out;
}

const colorAt = (y) => (y < BASE_SEAM || (y > BAND_BOTTOM && y < BAND_TOP) ? ACCENT : SHELL);

/** The rings from base to tip: a seam is a thin groove with a hard colour change either side. */
function rings() {
  const seams = [BASE_SEAM, BAND_BOTTOM, BAND_TOP];
  const out = [];
  let next = 0;
  for (const y of stations()) {
    while (next < seams.length && seams[next] - 0.7 < y) {
      const at = seams[next++];
      out.push({ y: at - 0.3, inset: 0, color: colorAt(at - 0.5) });
      out.push({ y: at - 0.14, inset: 0.28, color: SEAM });
      out.push({ y: at + 0.14, inset: 0.28, color: SEAM });
      out.push({ y: at + 0.3, inset: 0, color: colorAt(at + 0.5) });
    }
    if (seams.some((at) => Math.abs(y - at) < 0.7)) continue;
    out.push({ y, inset: 0, color: colorAt(y) });
  }
  return out;
}

// ---------- Mesh building ----------

const _a = V();
const _b = V();
const _c = V();
const _n = V();
const _t = V();
const _m = V();
const _o = V();

/** Indexed triangles that orient themselves: out(centroid, target) says which way is outside. */
class Mesher {
  constructor(withColor = false) {
    this.pos = [];
    this.col = withColor ? [] : null;
    this.idx = [];
  }
  vert(p, color = SHELL) {
    this.pos.push(p.x, p.y, p.z);
    if (this.col) this.col.push(color.r, color.g, color.b);
    return this.pos.length / 3 - 1;
  }
  tri(a, b, c, out) {
    const P = this.pos;
    _a.fromArray(P, a * 3);
    _b.fromArray(P, b * 3);
    _c.fromArray(P, c * 3);
    _n.subVectors(_b, _a).cross(_t.subVectors(_c, _a));
    if (_n.lengthSq() < 1e-10) return;
    _m.addVectors(_a, _b).add(_c).multiplyScalar(1 / 3);
    if (_n.dot(out(_m, _o)) < 0) this.idx.push(a, c, b);
    else this.idx.push(a, b, c);
  }
  quad(a, b, c, d, out) {
    this.tri(a, b, c, out);
    this.tri(a, c, d, out);
  }
  grid(rows, closed, out) {
    for (let k = 0; k + 1 < rows.length; k++) {
      const A = rows[k];
      const B = rows[k + 1];
      const n = A.length;
      for (let j = 0; j < (closed ? n : n - 1); j++) {
        const j1 = (j + 1) % n;
        this.quad(A[j], B[j], B[j1], A[j1], out);
      }
    }
  }
  fan(row, pole, closed, out) {
    const n = row.length;
    for (let j = 0; j < (closed ? n : n - 1); j++) this.tri(row[j], row[(j + 1) % n], pole, out);
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    if (this.col) g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.setIndex(this.idx);
    g.computeVertexNormals();
    return g;
  }
}

// Outward for the outer skin: away from the axis at the same height (or past the ends).
const outward = (m, o) => {
  const y = clamp(m.y, BASE_Y + 5, TIP_Y - 5);
  return o.set(m.x, m.y - y, m.z - lean(y));
};
const inward = (m, o) => outward(m, o).negate();
const toward = (x, y, z) => (_m2, o) => o.set(x, y, z);

// The front shell's openings, in its own x/y: the lens window and two buttons.
const HOLES = [
  { cx: 0, cy: HEAD_Y, hx: 6.45, hy: 6.45 },
  { cx: 0, cy: -5, hx: 6.55, hy: 12.25 },
  { cx: 0, cy: -28, hx: 6.25, hy: 6.25 },
];

function roundRectOutline({ cx, cy, hx, hy }, n = 72) {
  const r = Math.min(hx, hy);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    pts.push([cx + (hx - r) * Math.sign(c) + r * c, cy + (hy - r) * Math.sign(s) + r * s]);
  }
  return pts;
}

function roundRectShape(hx, hy, r) {
  const s = new THREE.Shape();
  s.moveTo(-hx + r, -hy);
  s.lineTo(hx - r, -hy);
  s.absarc(hx - r, -hy + r, r, -Math.PI / 2, 0);
  s.lineTo(hx, hy - r);
  s.absarc(hx - r, hy - r, r, 0, Math.PI / 2);
  s.lineTo(-hx + r, hy);
  s.absarc(-hx + r, hy - r, r, Math.PI / 2, Math.PI);
  s.lineTo(-hx, -hy + r);
  s.absarc(-hx + r, -hy + r, r, Math.PI, Math.PI * 1.5);
  return s;
}

/** Half the shell above the base seam: the outside, the inside, and the cut faces. */
function shellHalf(isFront) {
  const list = rings().filter((r) => r.y > BASE_SEAM);
  const n = SEGMENTS / 2;
  const a0 = isFront ? 0 : Math.PI;
  const angles = Array.from({ length: n + 1 }, (_, j) => a0 + (Math.PI * j) / n);
  const tip = V(0, TIP_Y, lean(TIP_Y));
  const p = V();

  const outer = new Mesher(true);
  const rowsO = list.map((r) => angles.map((a) => outer.vert(surface(r.y, a, r.inset, p), r.color)));
  outer.grid(rowsO, false, outward);
  outer.fan(rowsO[rowsO.length - 1], outer.vert(tip), false, outward);

  const innerYs = list.filter((r, i) => i === 0 || r.inset === 0).map((r) => r.y);
  const inner = new Mesher();
  const rowsI = innerYs.map((y) => angles.map((a) => inner.vert(surface(y, a, WALL, p))));
  const topY = innerYs[innerYs.length - 1];
  inner.grid(rowsI, false, inward);
  inner.fan(rowsI[rowsI.length - 1], inner.vert(V(0, topY, lean(topY))), false, inward);

  const rim = new Mesher();
  // Along the bottom edge, where the end cap meets it.
  const y0 = list[0];
  const bottom = [
    angles.map((a) => rim.vert(surface(y0.y, a, y0.inset, p))),
    angles.map((a) => rim.vert(surface(y0.y, a, WALL, p))),
  ];
  rim.grid(bottom, false, toward(0, -1, 0));
  // Down both sides, where the halves meet.
  for (const a of [a0, a0 + Math.PI]) {
    const o = list.map((r) => rim.vert(surface(r.y, a, r.inset, p)));
    const i = list.map((r) => rim.vert(surface(r.y, a, WALL, p)));
    o.push(rim.vert(tip));
    i.push(rim.vert(V(0, topY, lean(topY))));
    rim.grid([o, i], false, toward(0, 0, isFront ? -1 : 1));
  }
  // The walls of the openings in the front.
  if (isFront) {
    for (const h of HOLES) {
      const pts = roundRectOutline(h);
      const top = pts.map(([x, y]) => rim.vert(V(x, y, frontZ(x, y, 0))));
      const low = pts.map(([x, y]) => rim.vert(V(x, y, frontZ(x, y, WALL))));
      rim.grid([low, top], true, (m, o) => o.set(h.cx - m.x, h.cy - m.y, 0));
    }
  }
  return { outer: outer.build(), inner: inner.build(), rim: rim.build() };
}

/** The teal end cap below the base seam, open at the top. */
function endCapGeometry() {
  const list = rings().filter((r) => r.y < BASE_SEAM);
  const angles = Array.from({ length: SEGMENTS }, (_, j) => (2 * Math.PI * j) / SEGMENTS);
  const p = V();

  const outer = new Mesher(true);
  const rowsO = list.map((r) => angles.map((a) => outer.vert(surface(r.y, a, r.inset, p), r.color)));
  outer.grid(rowsO, true, outward);
  outer.fan(rowsO[0], outer.vert(V(0, BASE_Y, lean(BASE_Y)), ACCENT), true, outward);

  const ys = list.filter((r, i) => i === list.length - 1 || r.inset === 0).map((r) => r.y);
  const inner = new Mesher();
  const rowsI = ys.map((y) => angles.map((a) => inner.vert(surface(y, a, WALL, p))));
  inner.grid(rowsI, true, inward);
  inner.fan(rowsI[0], inner.vert(V(0, ys[0], 0)), true, inward);

  const rim = new Mesher();
  const top = list[list.length - 1];
  rim.grid(
    [angles.map((a) => rim.vert(surface(top.y, a, top.inset, p))), angles.map((a) => rim.vert(surface(top.y, a, WALL, p)))],
    true,
    toward(0, 1, 0),
  );
  return { outer: outer.build(), inner: inner.build(), rim: rim.build() };
}

/** A grid on the shell around a patch frame, for printed art. UVs run 0-1 with v = 1 at the top edge. */
function decalGeometry({ center, right, up }, w, h, lift = 0.05, nu = 24, nv = 6) {
  const pos = [];
  const uv = [];
  const idx = [];
  const p = V();
  for (let j = 0; j <= nv; j++) {
    for (let i = 0; i <= nu; i++) {
      p.copy(center).addScaledVector(right, (i / nu - 0.5) * w).addScaledVector(up, (0.5 - j / nv) * h);
      onShell(p, lift, p);
      pos.push(p.x, p.y, p.z);
      uv.push(i / nu, 1 - j / nv);
    }
  }
  for (let j = 0; j < nv; j++) {
    for (let i = 0; i < nu; i++) {
      const a = j * (nu + 1) + i;
      const b = a + nu + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  // Whether this winding faces out depends on the frame's handedness; flip it if not.
  const mid = Math.floor(pos.length / 6);
  const n = V().fromBufferAttribute(g.attributes.normal, mid);
  const c = V().fromBufferAttribute(g.attributes.position, mid);
  if (n.dot(outward(c, V())) < 0) {
    for (let k = 0; k < idx.length; k += 3) [idx[k + 1], idx[k + 2]] = [idx[k + 2], idx[k + 1]];
    g.setIndex(idx);
    g.computeVertexNormals();
  }
  return g;
}

/** Places geometry built flat (x right, y up, z out) onto a patch frame. */
function onFrame(geometry, { center, right, up, normal }, along = 0) {
  const m = new THREE.Matrix4().makeBasis(right, up, normal);
  m.setPosition(center.clone().addScaledVector(normal, along));
  return geometry.applyMatrix4(m);
}

const box = (w, h, d, r = 0.2, seg = 2) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3));
const at = (g, x, y, z) => g.translate(x, y, z);
const zCylinder = (r0, r1, h, seg = 40) => new THREE.CylinderGeometry(r1, r0, h, seg).rotateX(Math.PI / 2);
const merged = (list) => mergeGeometries(list.map((g) => (g.index ? g.toNonIndexed() : g)));

// ---------- Textures (drawn like DeviceArt, in millimetres) ----------

function canvasTexture(wMm, hMm, pxPerMm, draw, { transparent = false } = {}) {
  const c = document.createElement('canvas');
  c.width = Math.round(wMm * pxPerMm);
  c.height = Math.round(hMm * pxPerMm);
  const g = c.getContext('2d');
  g.scale(pxPerMm, pxPerMm);
  if (!transparent) {
    g.fillStyle = '#000';
    g.fillRect(0, 0, wMm, hMm);
  }
  draw(g, wMm, hMm);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const NAVY = '#1A2E35';
const G1 = '#4DD8C8';
const G2 = '#2CA6A4';
const DEEP_TEAL = '#17807D';

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

/** DeviceArt.captureButton: the one teal control, where the thumb rests. */
function captureTexture() {
  return canvasTexture(13.6, 25, 24, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#5DE0D0');
    grad.addColorStop(0.55, G2);
    grad.addColorStop(1, DEEP_TEAL);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    const top = g.createLinearGradient(0, 0, 0, h / 2);
    top.addColorStop(0, 'rgba(255,255,255,0.26)');
    top.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = top;
    roundRect(g, 0.9, 0.9, w - 1.8, h / 2, w / 2);
    g.fill();
    g.strokeStyle = '#fff';
    g.fillStyle = '#fff';
    g.lineWidth = 0.85;
    g.beginPath();
    g.arc(w / 2, h / 2, 3.1, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.arc(w / 2, h / 2, 1.5, 0, Math.PI * 2);
    g.fill();
  });
}

/** DeviceArt.lightButton: a small white disc with a sun on it. */
function lightTexture() {
  return canvasTexture(13, 13, 24, (g, w) => {
    const grad = g.createLinearGradient(0, 0, w, w);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(1, '#DCEBEA');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, w);
    const c = w / 2;
    g.strokeStyle = DEEP_TEAL;
    g.lineWidth = 0.72;
    g.lineCap = 'round';
    g.beginPath();
    g.arc(c, c, 1.55, 0, Math.PI * 2);
    g.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      g.beginPath();
      g.moveTo(c + Math.cos(a) * 2.75, c + Math.sin(a) * 2.75);
      g.lineTo(c + Math.cos(a) * 3.85, c + Math.sin(a) * 3.85);
      g.stroke();
    }
  });
}

/** DeviceArt.wordmark: "DENTRA" as strokes, so it needs no font. */
function wordTexture() {
  return canvasTexture(
    29,
    4.4,
    48,
    (g, w, hh) => {
      g.scale(0.88, 0.88);
      g.translate(w * 0.06, hh * 0.06);
      const h = 4.4;
      const mid = h / 2;
      const gap = 1.75;
      let x = 0;
      g.beginPath();
      // D
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.lineTo(x + 1.1, h);
      g.bezierCurveTo(x + 4.0, h, x + 4.0, 0, x + 1.1, 0);
      g.closePath();
      x += 3.25 + gap;
      // E
      g.moveTo(x + 2.5, 0);
      g.lineTo(x, 0);
      g.lineTo(x, h);
      g.lineTo(x + 2.5, h);
      g.moveTo(x, mid);
      g.lineTo(x + 2.15, mid);
      x += 2.5 + gap;
      // N
      g.moveTo(x, h);
      g.lineTo(x, 0);
      g.lineTo(x + 3.1, h);
      g.lineTo(x + 3.1, 0);
      x += 3.1 + gap;
      // T
      g.moveTo(x, 0);
      g.lineTo(x + 3.1, 0);
      g.moveTo(x + 1.55, 0);
      g.lineTo(x + 1.55, h);
      x += 3.1 + gap;
      // R
      g.moveTo(x, h);
      g.lineTo(x, 0);
      g.lineTo(x + 1.5, 0);
      g.bezierCurveTo(x + 3.45, 0, x + 3.45, 2.5, x + 1.5, 2.5);
      g.lineTo(x, 2.5);
      g.moveTo(x + 1.5, 2.5);
      g.lineTo(x + 2.95, h);
      x += 2.95 + gap;
      // A
      g.moveTo(x, h);
      g.lineTo(x + 1.7, 0);
      g.lineTo(x + 3.4, h);
      g.moveTo(x + 0.62, 2.95);
      g.lineTo(x + 2.78, 2.95);
      g.lineWidth = 0.66;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.strokeStyle = 'rgba(26,46,53,0.72)';
      g.stroke();
    },
    { transparent: true },
  );
}

/** DeviceArt.powerSwitch's slot. */
function slotTexture() {
  return canvasTexture(
    4,
    13,
    32,
    (g, w, h) => {
      g.fillStyle = '#3F5A62';
      roundRect(g, 0, 0, w, h, w / 2);
      g.fill();
    },
    { transparent: true },
  );
}

/** DeviceArt._lens, scaled to the lens barrel. */
function lensTexture() {
  const R = 4.7;
  return canvasTexture(
    2 * R,
    2 * R,
    40,
    (g) => {
      const c = R;
      const bezel = g.createLinearGradient(0, 0, 2 * R, 2 * R);
      bezel.addColorStop(0, '#F4F9F9');
      bezel.addColorStop(0.55, '#6F878D');
      bezel.addColorStop(1, '#CFDEDE');
      g.fillStyle = bezel;
      g.beginPath();
      g.arc(c, c, 4.7, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#050C0F';
      g.beginPath();
      g.arc(c, c, 3.95, 0, Math.PI * 2);
      g.fill();
      const coat = g.createRadialGradient(c + 0.45 * 3.4, c + 0.5 * 3.4, 0, c + 0.45 * 3.4, c + 0.5 * 3.4, 0.9 * 3.4 * 1.4);
      coat.addColorStop(0, 'rgba(44,166,164,0.85)');
      coat.addColorStop(0.5, 'rgba(18,58,68,0.55)');
      coat.addColorStop(1, 'rgba(5,12,15,0)');
      g.save();
      g.beginPath();
      g.arc(c, c, 3.4, 0, Math.PI * 2);
      g.clip();
      g.fillStyle = coat;
      g.fillRect(0, 0, 2 * R, 2 * R);
      g.restore();
      g.fillStyle = '#02070A';
      g.beginPath();
      g.arc(c, c, 1.5, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.95)';
      g.beginPath();
      g.arc(c - 1.45, c - 1.55, 0.52, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.55)';
      g.beginPath();
      g.arc(c - 0.5, c - 2.3, 0.2, 0, Math.PI * 2);
      g.fill();
    },
    { transparent: true },
  );
}

/** Seeded random, so the board looks the same on every load. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Board layout (x, y centre in mm on the board's face), shared by the art and the parts.
const BOARD = { x0: -13, x1: 13, y0: -66, y1: 4 };
const PASSIVES = [
  [-4.6, -12, 0], [-4.6, -14.6, 0], [4.6, -12, 0], [4.6, -14.6, 0], [-10.6, -11, 1], [10.6, -11.5, 1],
  [-10.6, -25, 1], [10.4, -22, 0], [-4.2, -21.5, 1], [4.4, -20.5, 1], [-8.8, -61.5, 0], [8.6, -63.6, 0],
  [-11, -40, 1], [11, -40, 1], [-11, -52, 1], [11, -52, 1], [-6, -1.5, 0], [6, -1.5, 0], [-11.2, -32, 1],
  [7.6, -26.5, 0], [-7.4, -26.5, 0], [11.2, -60, 1],
];

function boardTexture() {
  const W = BOARD.x1 - BOARD.x0;
  const H = BOARD.y1 - BOARD.y0;
  // Board mm to canvas mm (y down from the top edge).
  const X = (x) => x - BOARD.x0;
  const Y = (y) => BOARD.y1 - y;
  return canvasTexture(W, H, 16, (g) => {
    g.fillStyle = '#0d4a47';
    g.fillRect(0, 0, W, H);
    const rand = rng(7);
    // Traces: 45-degree runs, a shade lighter than the mask.
    g.lineCap = 'round';
    g.lineJoin = 'round';
    for (let i = 0; i < 46; i++) {
      g.strokeStyle = i % 3 ? 'rgba(30,120,112,0.55)' : 'rgba(18,96,90,0.7)';
      g.lineWidth = i % 5 ? 0.22 : 0.45;
      let x = 1 + rand() * (W - 2);
      let y = 1 + rand() * (H - 2);
      g.beginPath();
      g.moveTo(x, y);
      for (let k = 0; k < 4; k++) {
        const len = 2 + rand() * 9;
        const dir = Math.floor(rand() * 8);
        const a = (dir * Math.PI) / 4;
        x = clamp(x + Math.cos(a) * len, 0.8, W - 0.8);
        y = clamp(y + Math.sin(a) * len, 0.8, H - 0.8);
        g.lineTo(x, y);
      }
      g.stroke();
    }
    // Vias.
    for (let i = 0; i < 60; i++) {
      const x = 1 + rand() * (W - 2);
      const y = 1 + rand() * (H - 2);
      g.fillStyle = '#c9a45a';
      g.beginPath();
      g.arc(x, y, 0.32, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#0a2f2d';
      g.beginPath();
      g.arc(x, y, 0.14, 0, Math.PI * 2);
      g.fill();
    }
    // Pads under the parts.
    const pad = (x, y, w, h) => {
      g.fillStyle = '#d6ad55';
      g.fillRect(X(x) - w / 2, Y(y) - h / 2, w, h);
    };
    for (const [x, y, r] of PASSIVES) {
      const [dx, dy] = r ? [0, 0.75] : [0.75, 0];
      pad(x - dx, y - dy, 0.7, 0.7);
      pad(x + dx, y + dy, 0.7, 0.7);
    }
    for (const sy of [-5, -28]) for (const dx of [-3.4, 3.4]) for (const dy of [-2.3, 2.3]) pad(dx, sy + dy, 1.2, 1);
    // Silkscreen.
    g.strokeStyle = 'rgba(232,243,241,0.85)';
    g.fillStyle = 'rgba(232,243,241,0.9)';
    g.lineWidth = 0.18;
    const outline = (x, y, w, h) => g.strokeRect(X(x) - w / 2, Y(y) - h / 2, w, h);
    outline(0, -5, 7.2, 7.2);
    outline(0, -28, 7.2, 7.2);
    outline(0, -45, 19, 26.5);
    outline(-7.5, -16, 4, 4);
    outline(-7.5, -21.5, 5, 5);
    g.font = '600 1.3px sans-serif';
    g.textBaseline = 'middle';
    g.fillText('SW1', X(4.2), Y(-1.2));
    g.fillText('SW2', X(4.2), Y(-24.3));
    g.fillText('U1', X(-9.6), Y(-31));
    g.fillText('J1', X(5.4), Y(-59.6));
    g.font = '700 1.9px sans-serif';
    g.save();
    g.translate(X(-11.6), Y(-60));
    g.rotate(-Math.PI / 2);
    g.fillText('DENTRA', 0, 0);
    g.restore();
    g.font = '500 1.2px sans-serif';
    g.fillText('PROTOTYPE', X(-12.2), Y(1.9));
  });
}

/** The ESP32-S3 module's own board: a meander antenna at the top, castellated pads down the sides. */
function moduleTexture() {
  return canvasTexture(18, 25.5, 16, (g, w, h) => {
    g.fillStyle = '#1c2a2d';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#c9a45a';
    g.lineWidth = 0.42;
    g.beginPath();
    let x = 2;
    g.moveTo(x, 5.2);
    for (let i = 0; i < 6; i++) {
      g.lineTo(x, 1.2);
      g.lineTo(x + 1.15, 1.2);
      g.lineTo(x + 1.15, 4.4);
      g.lineTo(x + 2.3, 4.4);
      x += 2.3;
    }
    g.stroke();
    g.fillStyle = '#c9a45a';
    for (let i = 0; i < 13; i++) {
      g.fillRect(0, 7.4 + i * 1.27, 0.7, 0.8);
      g.fillRect(w - 0.7, 7.4 + i * 1.27, 0.7, 0.8);
    }
  });
}

/** Etched lettering on the RF shield. */
function canTexture() {
  return canvasTexture(
    15.8,
    17.6,
    20,
    (g, w) => {
      g.fillStyle = 'rgba(70,82,86,0.55)';
      g.textAlign = 'center';
      g.font = '700 2.2px sans-serif';
      g.fillText('ESP32-S3', w / 2, 7.2);
      g.font = '500 1.2px sans-serif';
      g.fillText('Wi-Fi  2.4 GHz', w / 2, 9.6);
      g.strokeStyle = 'rgba(70,82,86,0.4)';
      g.lineWidth = 0.15;
      g.strokeRect(1.4, 11.4, w - 2.8, 4.2);
    },
    { transparent: true },
  );
}

/** The cell's wrap label. */
function batteryTexture() {
  return canvasTexture(21, 44, 18, (g, w, h) => {
    g.fillStyle = '#f2f7f6';
    g.fillRect(0, 0, w, h);
    g.fillStyle = G2;
    g.fillRect(0, 0, w, 9);
    g.fillStyle = '#ffffff';
    g.font = '700 3.2px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('DENTRA', w / 2, 4.6);
    g.fillStyle = NAVY;
    g.font = '800 3.6px sans-serif';
    g.fillText('2000 mAh', w / 2, 19);
    g.font = '600 2.6px sans-serif';
    g.fillStyle = '#4b5f66';
    g.fillText('Li-Po  3.7 V', w / 2, 24.5);
    g.strokeStyle = 'rgba(26,46,53,0.25)';
    g.lineWidth = 0.2;
    g.beginPath();
    g.moveTo(3, 29);
    g.lineTo(w - 3, 29);
    g.stroke();
    g.font = '500 1.5px sans-serif';
    g.fillStyle = '#6B7B80';
    g.fillText('Rechargeable lithium polymer cell', w / 2, 32.5);
    g.fillText('Do not puncture or short-circuit', w / 2, 35);
    g.strokeStyle = '#6B7B80';
    g.lineWidth = 0.25;
    for (const [cx, cy] of [[w / 2 - 4, 39.6], [w / 2, 39.6], [w / 2 + 4, 39.6]]) {
      g.beginPath();
      g.arc(cx, cy, 1.3, 0, Math.PI * 2);
      g.stroke();
    }
  });
}

/** Copper traces down the camera's ribbon. */
function ribbonTexture() {
  return canvasTexture(6.5, 74, 20, (g, w, h) => {
    g.fillStyle = '#c47a26';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(240,184,96,0.75)';
    g.lineWidth = 0.18;
    for (let i = 0; i < 12; i++) {
      const x = 0.7 + (i * (w - 1.4)) / 11;
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }
  });
}

function glowTexture() {
  return canvasTexture(
    10,
    10,
    12.8,
    (g) => {
      const r = g.createRadialGradient(5, 5, 0, 5, 5, 5);
      r.addColorStop(0, 'rgba(255,255,255,1)');
      r.addColorStop(0.35, 'rgba(255,255,255,0.45)');
      r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r;
      g.fillRect(0, 0, 10, 10);
    },
    { transparent: true },
  );
}

/** Maps a texture over an extruded shape's caps, whose UVs are its own x/y in mm. */
function capMap(texture, w, h) {
  texture.repeat.set(1 / w, 1 / h);
  texture.offset.set(0.5, 0.5);
  return texture;
}

// ---------- Materials ----------

const GLOW = new THREE.Color(G1);

/**
 * Every material takes its part's glow (a teal rim light when the part is in
 * focus). Shell materials also fall off toward cool teal at their edges, as in
 * DeviceRenderer, so the white body holds its shape on the pale page. The front
 * shell cuts its openings in the fragment shader.
 */
function material(kind, params, { glow, edge = 0, holes = false, gain = 1 }) {
  const mat = kind === 'physical' ? new THREE.MeshPhysicalMaterial(params) : new THREE.MeshStandardMaterial(params);
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uGlow = glow;
    shader.uniforms.uGlowColor = { value: GLOW };
    let decl = 'uniform float uGlow;\nuniform vec3 uGlowColor;\n';
    if (holes) {
      decl += 'varying vec3 vObjPos;\nfloat sdRound(vec2 p, vec2 c, vec2 h, float r) { vec2 q = abs(p - c) - h + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }\n';
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vObjPos;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjPos = transformed;');
    }
    const cut = holes
      ? HOLES.map((h) => `if (sdRound(vObjPos.xy, vec2(${h.cx.toFixed(2)}, ${h.cy.toFixed(2)}), vec2(${h.hx.toFixed(2)}, ${h.hy.toFixed(2)}), ${Math.min(h.hx, h.hy).toFixed(2)}) < 0.0) discard;`).join('\n')
      : '';
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${decl}`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n${cut}`)
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        float dentraRim = 1.0 - abs(dot(normal, normalize(vViewPosition)));
        ${edge ? `diffuseColor.rgb *= mix(vec3(1.0), vec3(0.62, 0.78, 0.8), ${edge.toFixed(2)} * dentraRim * dentraRim * dentraRim);` : ''}
        // In focus: tint toward teal (white plastic can't get brighter), then light the rim.
        diffuseColor.rgb *= mix(vec3(1.0), vec3(0.74, 0.95, 0.93), clamp(uGlow * ${gain.toFixed(2)}, 0.0, 1.0));`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        totalEmissiveRadiance += uGlowColor * uGlow * ${gain.toFixed(2)} * 1.4 * dentraRim * dentraRim * dentraRim;`,
      );
  };
  mat.customProgramCacheKey = () => `dentra-${kind}-${edge}-${holes ? 1 : 0}-${gain}`;
  return mat;
}

// ---------- Parts ----------

/**
 * Builds every part, each in model millimetres inside its own `holder` group.
 * Returns { parts, lit, textures, dispose }, where each part is
 * { id, holder, glow, anchor, dir? }. `lit` (0-1) is how brightly the white
 * LEDs fire.
 */
export function buildDevice() {
  const textures = [];
  const tex = (t) => (textures.push(t), t);
  const parts = new Map();
  const lit = { value: 0 };
  const litMaterials = [];

  const part = (id, anchor) => {
    const p = { id, holder: new THREE.Group(), glow: { value: 0 }, anchor };
    p.holder.name = id;
    parts.set(id, p);
    return p;
  };
  const add = (p, geometry, mat, extra = {}) => {
    const m = new THREE.Mesh(geometry, mat);
    Object.assign(m, extra);
    p.holder.add(m);
    return m;
  };
  const std = (p, params, opts = {}) => material('standard', params, { glow: p.glow, ...opts });
  const phys = (p, params, opts = {}) => material('physical', params, { glow: p.glow, ...opts });

  const wordTex = tex(wordTexture());
  const slotTex = tex(slotTexture());
  const lensTex = tex(lensTexture());
  const glowTex = tex(glowTexture());

  // End cap: the teal base, with the USB-C port in its floor.
  {
    const p = part('cap', V(14, -80, 6));
    const g = endCapGeometry();
    add(p, g.outer, phys(p, { vertexColors: true, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.18 }, { edge: 0.6 }));
    add(p, g.inner, std(p, { color: '#1f8a88', roughness: 0.7 }));
    add(p, g.rim, std(p, { color: '#2aa29f', roughness: 0.5 }, { gain: 1.6 }));
    add(p, at(box(9.2, 3, 3.4, 1.2), 0, BASE_Y + 1.4, 0), std(p, { color: '#0e1b20', roughness: 0.45 }));
  }

  // The two shell halves.
  const shellMat = (p, holes) => phys(p, { vertexColors: true, roughness: 0.36, clearcoat: 0.55, clearcoatRoughness: 0.22 }, { edge: 0.85, holes });
  {
    const p = part('back', V(-15, -20, -6));
    const g = shellHalf(false);
    add(p, g.outer, shellMat(p, false));
    add(p, g.inner, std(p, { color: '#dbe4e4', roughness: 0.75 }));
    add(p, g.rim, std(p, { color: '#eaf0f0', roughness: 0.55 }, { gain: 1.6 }));
  }
  {
    const p = part('front', V(-14.5, -40, 6));
    const g = shellHalf(true);
    add(p, g.outer, shellMat(p, true));
    add(p, g.inner, std(p, { color: '#dbe4e4', roughness: 0.75 }, { holes: true }));
    add(p, g.rim, std(p, { color: '#eaf0f0', roughness: 0.55 }, { gain: 1.6 }));
    // The name reads along the handle, up toward the head.
    const name = frontPatch(-50);
    add(p, decalGeometry({ center: name.center, right: name.up, up: name.right.clone().negate() }, 29, 4.4, 0.04, 30, 4), std(p, { map: wordTex, transparent: true, depthWrite: false, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 }));
    // The power switch's slot, on the side.
    add(p, decalGeometry(patchAt(-30, 0.22), 4, 13, 0.03, 6, 14), std(p, { map: slotTex, alphaTest: 0.5, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }));
  }

  // Controls, on the front: Capture, Light, Power.
  const buttonGeometry = (shape) =>
    new THREE.ExtrudeGeometry(shape, { depth: 0.9, bevelEnabled: true, bevelThickness: 0.45, bevelSize: 0.4, bevelSegments: 3, curveSegments: 32 });
  {
    const f = frontPatch(-5);
    const p = part('capture', f.center.clone().addScaledVector(f.normal, 0.8));
    p.dir = f.normal.clone();
    const g = onFrame(buttonGeometry(roundRectShape(6.4, 12.1, 6.4)), f, -0.55);
    add(p, g, [
      phys(p, { map: tex(capMap(captureTexture(), 13.6, 25)), roughness: 0.28, clearcoat: 0.8 }),
      phys(p, { color: G2, roughness: 0.3, clearcoat: 0.6 }),
    ]);
  }
  {
    const f = frontPatch(-28);
    const p = part('light', f.center.clone().addScaledVector(f.normal, 0.8));
    p.dir = f.normal.clone();
    const disc = new THREE.Shape();
    disc.absarc(0, 0, 6.1, 0, Math.PI * 2);
    const g = onFrame(buttonGeometry(disc), f, -0.55);
    add(p, g, [
      phys(p, { map: tex(capMap(lightTexture(), 13, 13)), roughness: 0.3, clearcoat: 0.7 }, { edge: 0.5 }),
      phys(p, { color: '#eef4f4', roughness: 0.35 }, { edge: 0.5 }),
    ]);
  }
  {
    const f = patchAt(-30, 0.22);
    const p = part('thumb', f.center.clone().addScaledVector(f.up, 2.42));
    p.dir = f.normal.clone();
    const g = onFrame(box(2.9, 6.76, 1.6, 0.6, 3).translate(0, 2.42, 0.2), f);
    add(p, g, phys(p, { color: '#f4f8f8', roughness: 0.3, clearcoat: 0.6 }, { edge: 0.5 }));
  }

  // The round glass window on the head.
  const headZ = lean(HEAD_Y) + HEAD_D;
  {
    const p = part('window', V(6.4, HEAD_Y + 2, headZ + 0.4));
    const prof = [[0, 1.25], [2, 1.22], [4, 1.12], [5.6, 0.95], [6.5, 0.6], [6.75, 0.25], [6.75, -0.6], [0, -0.6]].map(([r, h]) => new THREE.Vector2(r, h));
    const g = new THREE.LatheGeometry(prof, 72).rotateX(Math.PI / 2).translate(0, HEAD_Y, headZ - 0.9);
    add(
      p,
      g,
      phys(p, { color: '#a9dcd6', roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, opacity: 0.3, depthWrite: false, envMapIntensity: 1.6 }, { gain: 2 }),
      { renderOrder: 2 },
    );
  }

  // The ring of ten LEDs round the lens: four NIR among six white (DeviceArt.head).
  {
    const p = part('leds', V(6.1, HEAD_Y, 8));
    const ring = new THREE.Shape();
    ring.absarc(0, 0, 6.1, 0, Math.PI * 2);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 3.25, 0, Math.PI * 2, true);
    ring.holes.push(hole);
    add(p, new THREE.ExtrudeGeometry(ring, { depth: 0.8, bevelEnabled: false, curveSegments: 48 }).translate(0, HEAD_Y, 7.0), std(p, { color: '#12262C', roughness: 0.5 }));
    const nir = new Set([0, 3, 5, 8]);
    const scale = 6.6 / 10.6; // DeviceArt draws the window at 10.6 and scales it to 6.6
    const whiteBase = [];
    const darkBase = [];
    const whiteDome = [];
    const darkDome = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + ((i + 0.5) * 2 * Math.PI) / 10;
      const x = Math.cos(a) * 7.75 * scale;
      const y = HEAD_Y - Math.sin(a) * 7.75 * scale;
      (nir.has(i) ? darkBase : whiteBase).push(at(box(1.5, 1.5, 0.5, 0.15, 1), x, y, 8.05));
      (nir.has(i) ? darkDome : whiteDome).push(at(new THREE.SphereGeometry(0.62, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2).scale(1, 1, 0.8), x, y, 8.3));
    }
    add(p, merged(whiteBase), std(p, { color: '#dfe8e8', roughness: 0.4 }));
    add(p, merged(darkBase), std(p, { color: '#3A5A63', roughness: 0.4 }));
    const ledMat = phys(p, { color: '#f4faf6', emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.15, clearcoat: 1 });
    litMaterials.push(ledMat);
    add(p, merged(whiteDome), ledMat);
    add(p, merged(darkDome), phys(p, { color: '#12262C', roughness: 0.12, clearcoat: 1 }));
    const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: G1, transparent: true, opacity: 0, depthWrite: false }));
    flare.position.set(0, HEAD_Y, 12);
    flare.scale.set(30, 30, 1);
    flare.renderOrder = 3;
    p.holder.add(flare);
    p.flare = flare;
  }

  // OV5640 camera module: board, lens barrel, lens.
  {
    const p = part('camera', V(4.3, HEAD_Y - 3, 5));
    add(p, at(box(8.5, 8.5, 0.9, 0.35), 0, HEAD_Y, 3.05), std(p, { color: '#0E1B20', roughness: 0.5 }));
    add(p, at(zCylinder(3.3, 3.2, 4.1), 0, HEAD_Y, 5.55), std(p, { color: '#16191b', roughness: 0.55 }));
    add(p, at(new THREE.CircleGeometry(3.2, 48), 0, HEAD_Y, 7.61), std(p, { map: lensTex, transparent: true, roughness: 0.2, metalness: 0.2 }));
    add(p, at(new THREE.SphereGeometry(2.3, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2).scale(1, 1, 0.35), 0, HEAD_Y, 7.62), phys(p, { color: '#ffffff', roughness: 0.02, clearcoat: 1, transparent: true, opacity: 0.18, depthWrite: false }), { renderOrder: 1 });
    add(p, at(box(6, 2.2, 1, 0.3), 0, HEAD_Y - 2.6, 2.1), std(p, { color: '#22272a', roughness: 0.5 }));
  }

  // The ribbon up the neck, from the board to the camera.
  {
    const p = part('ribbon', V(3.4, 40, 3.5));
    const zAt = (y) => {
      const s = clamp((y - 2) / 74);
      return lean(y) + 3.0 - 6.2 * s * s * (3 - 2 * s);
    };
    const m = new Mesher();
    const uv = [];
    const half = 3.25;
    const th = 0.11;
    const rows = [[], [], [], []];
    for (let y = 2; y <= 76.01; y += 1.5) {
      const z = zAt(y);
      const dz = (zAt(y + 0.5) - zAt(y - 0.5)) / 1;
      const n = V(0, -dz, 1).normalize();
      const v = (y - 2) / 74;
      for (const [k, sx, sn] of [[0, -half, th], [1, half, th], [2, half, -th], [3, -half, -th]]) {
        rows[k].push(m.vert(V(sx, y, z).addScaledVector(n, sn)));
        uv.push(sx < 0 ? 0 : 1, v);
      }
    }
    const strip = (A, B, out) => {
      for (let i = 0; i + 1 < A.length; i++) m.quad(A[i], A[i + 1], B[i + 1], B[i], out);
    };
    strip(rows[0], rows[1], toward(0, 0, 1));
    strip(rows[2], rows[3], toward(0, 0, -1));
    strip(rows[1], rows[2], toward(1, 0, 0));
    strip(rows[3], rows[0], toward(-1, 0, 0));
    const g = m.build();
    // One uv per vertex, pushed in the same order as the vertices.
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    add(p, g, std(p, { map: tex(ribbonTexture()), roughness: 0.35, metalness: 0.05 }));
    add(p, at(box(7, 4, 0.5, 0.2), 0, 4.5, zAt(4.5)), std(p, { color: '#1b4f8a', roughness: 0.5 }));
  }

  // ESP32-S3 main board: buttons' switches, power slide switch, USB-C, the module.
  {
    const p = part('board', V(13.3, -36, 1.2));
    const s = new THREE.Shape();
    const R = 2;
    s.moveTo(-13 + R, -66);
    s.lineTo(13 - R, -66);
    s.quadraticCurveTo(13, -66, 13, -66 + R);
    s.lineTo(13, -8);
    s.lineTo(9, -2);
    s.lineTo(9, 4 - R);
    s.quadraticCurveTo(9, 4, 9 - R, 4);
    s.lineTo(-9 + R, 4);
    s.quadraticCurveTo(-9, 4, -9, 4 - R);
    s.lineTo(-9, -2);
    s.lineTo(-13, -8);
    s.lineTo(-13, -66 + R);
    s.quadraticCurveTo(-13, -66, -13 + R, -66);
    const pcbTex = tex(boardTexture());
    pcbTex.repeat.set(1 / 26, 1 / 70);
    pcbTex.offset.set(0.5, 66 / 70);
    const pcb = new THREE.ExtrudeGeometry(s, { depth: 1.3, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.15, bevelSegments: 1, curveSegments: 8 }).translate(0, 0, 0.55);
    add(p, pcb, [std(p, { map: pcbTex, roughness: 0.42 }), std(p, { color: '#0b3a38', roughness: 0.5 })]);

    const top = 2.15;
    const metal = [];
    const black = [];
    const grey = [];
    const tan = [];
    // ESP32-S3 module, its RF shield and the shield's lettering.
    add(p, at(box(18, 25.5, 0.8, 0.2, 1), 0, -45, top + 0.4), std(p, { color: '#1c2a2d', roughness: 0.5 }));
    add(p, at(new THREE.PlaneGeometry(18, 25.5), 0, -45, top + 0.81), std(p, { map: tex(moduleTexture()), roughness: 0.45, polygonOffset: true, polygonOffsetFactor: -1 }));
    metal.push(at(box(15.8, 17.6, 2.3, 0.35), 0, -48.6, top + 0.8 + 1.15));
    add(p, at(new THREE.PlaneGeometry(15.8, 17.6), 0, -48.6, top + 0.8 + 2.31), std(p, { map: tex(canTexture()), transparent: true, depthWrite: false, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 }));
    // Tactile switches under Capture and Light.
    for (const y of [-5, -28]) {
      black.push(at(box(6, 6, 2, 0.3), 0, y, top + 1));
      metal.push(at(box(6.2, 6.2, 0.3, 0.1, 1), 0, y, top + 2.15));
      grey.push(at(zCylinder(1.75, 1.75, 1.0, 24), 0, y, top + 2.8));
    }
    // Power slide switch at the edge, under the slider on the shell.
    metal.push(at(box(3.6, 8.6, 3.4, 0.3), 11, -30, top + 1.7));
    black.push(at(box(2, 2.4, 1.6, 0.3), 13.4, -29, top + 1.7));
    // USB-C, through the end cap.
    metal.push(at(box(8.94, 7.35, 3.26, 1.1), 0, -64.9, top + 1.63));
    black.push(at(box(7, 0.3, 1.9, 0.1, 1), 0, -68.55, top + 1.63));
    // Charger, regulator, inductor, ribbon connector.
    black.push(at(box(3, 3, 0.9, 0.1, 1), -7.5, -16, top + 0.45));
    black.push(at(box(2.9, 1.6, 1.1, 0.1, 1), 7.5, -16, top + 0.55));
    grey.push(at(box(4, 4, 2, 0.6), -7.5, -21.5, top + 1));
    black.push(at(box(10, 3.2, 1.4, 0.2), 0, 1.0, top + 0.7));
    for (const [x, y, r] of PASSIVES) {
      const g = at(box(r ? 0.8 : 1.6, r ? 1.6 : 0.8, 0.5, 0.08, 1), x, y, top + 0.25);
      (Math.round(x * 7 + y) % 3 === 0 ? black : tan).push(g);
    }
    add(p, merged(metal), std(p, { color: '#cfd8da', metalness: 1, roughness: 0.32 }));
    add(p, merged(black), std(p, { color: '#1b1f21', roughness: 0.55 }));
    add(p, merged(grey), std(p, { color: '#3d4548', roughness: 0.45 }));
    add(p, merged(tan), std(p, { color: '#b49563', roughness: 0.5 }));
    add(p, at(box(10.4, 1.0, 0.5, 0.15, 1), 0, 2.5, top + 1.4), std(p, { color: '#d9c8a0', roughness: 0.5 }));
    add(p, at(box(1.6, 0.8, 0.6, 0.1, 1), 9.5, -59, top + 0.3), std(p, { color: G1, emissive: G1, emissiveIntensity: 0.8 }));
  }

  // 2000 mAh lithium cell in the handle, behind the board.
  {
    const p = part('battery', V(-12.4, -46, -5));
    add(p, at(box(24, 52, 8, 2.6, 4), 0, -40, -5), std(p, { color: '#c3ccce', metalness: 0.45, roughness: 0.38 }));
    add(p, at(new THREE.PlaneGeometry(21, 44), 0, -40.5, -0.98), std(p, { map: tex(batteryTexture()), roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -1 }));
    add(p, at(box(20, 3.2, 1.8, 0.4), 0, -12.6, -5), std(p, { color: '#d9a13a', roughness: 0.4 }));
  }

  return {
    parts,
    lit,
    /** Sets how brightly the white LEDs fire (0-1). */
    setLit(v) {
      lit.value = v;
      for (const m of litMaterials) m.emissiveIntensity = v * 2.2;
      const flare = parts.get('leds').flare;
      flare.material.opacity = Math.min(1, v * 0.9);
    },
    dispose() {
      for (const p of parts.values()) {
        p.holder.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
          for (const m of ms) m.dispose();
        });
      }
      for (const t of textures) t.dispose();
    },
  };
}
