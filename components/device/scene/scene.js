// The exploded-view scene: renders the DENTRA camera (model.js) and takes it
// apart as a pure function of scroll position, so scrolling back up puts it
// back together exactly.
//
// Scroll position arrives as f, measured in steps:
//   -1..0   the section scrolls into view; the camera turns in toward the lens
//    0..1   assembled, lights flashing, the app's resting pose
//    s..s+1 step s (1..N): its parts come off, glow, and the leader points at them
//    N+1..  the parts spin back together for the final caption
//
// Client-only. Import it dynamically, so three.js loads only near the section.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { STEPS } from '../steps.js';
import { buildDevice } from './model.js';

const N = STEPS.length;
const TAU = Math.PI * 2;
const FOV = 24;

// Where each part goes once it's off (mm, in its parent's frame), and how it
// turns on the way. Buttons travel `dist` along their own outward normal.
const MOVES = {
  cap: { offset: [0, -40, 0], rot: [0, Math.PI * 0.85, 0] },
  back: { offset: [0, 6, -42], rot: [-0.08, 0.12, 0] },
  front: { offset: [0, -18, 44], rot: [0.08, -0.12, 0], delay: 0.08 },
  capture: { dist: 22, rot: [-0.35, 0, 0] },
  light: { dist: 18, rot: [0.3, 0, 0], delay: 0.12 },
  thumb: { dist: 14, rot: [0, 0, 0.5], delay: 0.24 },
  window: { offset: [0, 5, 38], rot: [0, 0, 0.6] },
  leds: { offset: [0, 3, 25], rot: [0, 0, -0.5] },
  camera: { offset: [0, 1, 13], rot: [0.15, 0, 0] },
  ribbon: { offset: [0, 10, -12], rot: [0.12, 0, 0] },
  board: { offset: [14, -6, 16], rot: [0.1, -0.12, 0] },
  battery: { offset: [14, -30, -34], rot: [0.14, 0.1, 0] },
};
const PARENT = { capture: 'front', light: 'front', thumb: 'front' };

// How far the camera pushes in on each step's parts (0 = whole device in view,
// 1 = only that step's parts). The head parts are about 16 mm across, so they
// get a close-up; big parts stay in context.
const FOCUS = { cap: 0.12, shell: 0, controls: 0.5, window: 0.72, leds: 0.72, camera: 0.72, ribbon: 0.25, board: 0.3, battery: 0 };
const FOCUS_FILL = 0.5;

// How the device is turned (yaw about its length, pitch tipping the tip toward
// the viewer, roll on screen; as DevicePose in the app) at points along f.
// f = 0 is the app's resting pose on the scan screen.
const VIEW = [
  [-1, -2.3, 0.22, -0.1],
  [0, -0.46, 0.42, -0.36],
  [0.8, -0.6, 0.4, -0.4],
  [2, -1.02, 0.3, -0.5],
  [4, -0.92, 0.32, -0.5],
  [7, -0.78, 0.34, -0.48],
  [N + 0.6, -0.66, 0.36, -0.46],
  [N + 1, -0.66, 0.36, -0.46],
  [N + 1.8, -0.46 + TAU, 0.42, -0.36],
  [N + 2, -0.46 + TAU, 0.42, -0.36],
];

const clamp = (x, lo = 0, hi = 1) => (x < lo ? lo : x > hi ? hi : x);
const smooth = (x) => x * x * (3 - 2 * x);
const cubicInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// A small pull back before the part lets go, and a little overshoot as it lands.
const backInOut = (x) => {
  const c = 1.1 * 1.525;
  return x < 0.5 ? (Math.pow(2 * x, 2) * ((c + 1) * 2 * x - c)) / 2 : (Math.pow(2 * x - 2, 2) * ((c + 1) * (x * 2 - 2) + c) + 2) / 2;
};
const window01 = (f, start, rise, end, fall) => clamp((f - start) / rise) * clamp((end - f) / fall);

function viewAt(f) {
  if (f <= VIEW[0][0]) return VIEW[0].slice(1);
  for (let i = 0; i + 1 < VIEW.length; i++) {
    const [f0, ...a] = VIEW[i];
    const [f1, ...b] = VIEW[i + 1];
    if (f <= f1) {
      const t = smooth((f - f0) / (f1 - f0));
      return a.map((v, k) => v + (b[k] - v) * t);
    }
  }
  return VIEW[VIEW.length - 1].slice(1);
}

/** The white LEDs' flash, like the app's capture flash: a quick rise, a slow fade. */
const flash = (t) => (t < 0.08 ? t / 0.08 : Math.exp(-(t - 0.08) * 5));

export function createDeviceScene(canvas, { onLost } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.02;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new RoomEnvironment();
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;
  scene.environmentIntensity = 0.55;
  envScene.dispose?.();
  pmrem.dispose();

  // A large soft key from the upper left, a cool fill, and a mint rim behind
  // so the white shell separates from the pale page.
  const key = new THREE.DirectionalLight(0xffffff, 2.3);
  key.position.set(-300, 420, 380);
  const fill = new THREE.DirectionalLight(0xd8f4f1, 0.7);
  fill.position.set(420, -60, 260);
  const rim = new THREE.DirectionalLight(0x4dd8c8, 1.6);
  rim.position.set(220, 260, -420);
  scene.add(key, fill, rim, new THREE.HemisphereLight(0xffffff, 0xcfeeea, 0.35));

  const camera = new THREE.PerspectiveCamera(FOV, 1, 10, 6000);
  const root = new THREE.Group();
  scene.add(root);

  const device = buildDevice();

  // Rig each part: mover (at pivot + offset, turns about its own centre) >
  // holder (at -pivot) > meshes in model millimetres.
  const stepOf = new Map();
  STEPS.forEach((s, i) => s.parts.forEach((id) => stepOf.set(id, i + 1)));
  const rigs = [];
  const box = new THREE.Box3();
  for (const [id, move] of Object.entries(MOVES)) {
    const part = device.parts.get(id);
    box.makeEmpty();
    part.holder.traverse((o) => {
      if (!o.isMesh) return;
      o.geometry.computeBoundingBox();
      box.union(o.geometry.boundingBox);
    });
    const pivot = box.getCenter(new THREE.Vector3());
    const corners = [];
    for (let i = 0; i < 8; i++) {
      corners.push(new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z));
    }
    const mover = new THREE.Group();
    mover.position.copy(pivot);
    part.holder.position.copy(pivot).negate();
    mover.add(part.holder);
    const offset = move.dist ? part.dir.clone().multiplyScalar(move.dist) : new THREE.Vector3(...move.offset);
    rigs.push({
      id,
      part,
      mover,
      pivot,
      offset,
      corners,
      world: corners.map((c) => c.clone()),
      rot: move.rot || [0, 0, 0],
      delay: move.delay || 0,
      step: stepOf.get(id),
      parent: PARENT[id],
      phase: rigs.length * 1.9,
      sep: 0,
    });
  }
  for (const r of rigs) (r.parent ? device.parts.get(r.parent).holder : root).add(r.mover);

  // Dashed assembly paths from where each part sat to where it is now.
  const pathGeo = new THREE.BufferGeometry();
  const pathPos = new Float32Array(rigs.length * 6);
  pathGeo.setAttribute('position', new THREE.BufferAttribute(pathPos, 3));
  const pathMat = new THREE.LineDashedMaterial({ color: 0x2ca6a4, dashSize: 2.6, gapSize: 2.2, transparent: true, opacity: 0, depthWrite: false });
  const paths = new THREE.LineSegments(pathGeo, pathMat);
  paths.frustumCulled = false;
  scene.add(paths);

  const anchorPart = STEPS.map((s) => device.parts.get(s.anchor || s.parts[0]));
  const ledStep = stepOf.get('leds');

  let width = 1;
  let height = 1;
  let frameAspect = 1;
  const pts = [];
  // Each step's corner points (the same vectors as in pts, updated in place).
  const stepPts = Array.from({ length: N + 2 }, (_, s) => rigs.filter((r) => r.step === s).flatMap((r) => r.world));
  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();
  const pointer = { x: 0, y: 0 };

  function fit(points, aspect, fillAmount) {
    const tanY = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const tanX = tanY * aspect;
    let tx = 0;
    let ty = 0;
    let D = 700;
    // Recentre and rescale a few times: perspective shifts the outline a
    // little each time the camera moves (as fitPose in the app).
    for (let pass = 0; pass < 4; pass++) {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (const p of points) {
        const d = D - p.z;
        if (d < 1) continue;
        const x = (p.x - tx) / d;
        const y = (p.y - ty) / d;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      if (minX > maxX) break;
      tx += ((minX + maxX) / 2) * D;
      ty += ((minY + maxY) / 2) * D;
      D = Math.max(D * Math.max((maxX - minX) / 2 / (fillAmount * tanX), (maxY - minY) / 2 / (fillAmount * tanY)), 120);
    }
    return { tx, ty, D };
  }

  function toScreen(v) {
    tmp2.copy(v).project(camera);
    return { x: (tmp2.x * 0.5 + 0.5) * width, y: (-tmp2.y * 0.5 + 0.5) * height };
  }

  /**
   * Draws the scene at scroll position f (in steps) and time t (seconds).
   * Returns the active step's leader anchor in canvas pixels, or null.
   */
  function render(f, t, px = 0, py = 0) {
    pointer.x += (px - pointer.x) * 0.08;
    pointer.y += (py - pointer.y) * 0.08;

    // Parts: off in their step, back on in the final one (last off, first on).
    let open = 0;
    for (const r of rigs) {
      const off = backInOut(clamp((f - (r.step - 0.2 + r.delay)) / 0.65));
      const back = cubicInOut(clamp((f - (N + 1) + 0.02 - (N - r.step) * 0.03) / 0.55));
      const sep = off * (1 - back);
      r.sep = sep;
      if (r.id === 'front') open = clamp(sep);
      const drift = clamp(sep) * (f > 0 ? 1 : 0);
      r.mover.position.copy(r.pivot).addScaledVector(r.offset, sep);
      r.mover.position.y += Math.sin(t * 0.9 + r.phase) * 0.7 * drift;
      r.mover.position.z += Math.cos(t * 0.7 + r.phase) * 0.5 * drift;
      r.mover.rotation.set(r.rot[0] * sep, r.rot[1] * sep, r.rot[2] * sep);
      // In focus while its step is on screen.
      r.part.glow.value = 0.45 * window01(f, r.step - 0.05, 0.35, r.step + 1, 0.2);
    }

    // Turn: the scripted view, a slow sway like the app's, and the pointer.
    const [yaw0, pitch0, roll] = viewAt(f);
    const sway = Math.sin(t * 0.5) * (0.12 - 0.07 * open);
    const yaw = yaw0 + sway + pointer.x * 0.16;
    const pitch = pitch0 + Math.sin(t * 0.37) * 0.024 + pointer.y * 0.08;
    root.rotation.set(pitch, yaw, roll, 'ZXY');
    root.updateMatrixWorld(true);

    // Lights: flashing while assembled, steady while the LED ring is in focus,
    // and one flash as it clicks back together.
    let lit = flash(t % 4.6) * (1 - clamp((f - 0.35) / 0.35));
    lit = Math.max(lit, 0.9 * window01(f, ledStep, 0.3, ledStep + 1, 0.25));
    const done = f - (N + 1.78);
    if (done > 0) lit = Math.max(lit, flash(done * 1.6) * (f < N + 2 ? 1 : 0));
    device.setLit(lit);

    // Frame everything that's on screen.
    pts.length = 0;
    for (const r of rigs) {
      const m = r.part.holder.matrixWorld;
      for (let i = 0; i < 8; i++) pts.push(r.world[i].copy(r.corners[i]).applyMatrix4(m));
    }
    const aspect = frameAspect;
    const enter = f < 0 ? smooth(clamp(f + 1)) : 1;
    const all = fit(pts, aspect, (0.56 + 0.28 * enter) * (1 + 0.05 * open));
    // Push in on the step on screen, easing from the last step's framing.
    const s = clamp(Math.floor(f + 0.2), 0, N + 1);
    const k = smooth(clamp((f - s + 0.2) / 0.5));
    const focusOn = (step) => {
      const amount = step >= 1 && step <= N ? FOCUS[STEPS[step - 1].id] || 0 : 0;
      return { amount, at: amount ? fit(stepPts[step], aspect, FOCUS_FILL) : all };
    };
    const a = focusOn(s - 1);
    const b = focusOn(s);
    const amount = a.amount + (b.amount - a.amount) * k;
    const mix = (key) => {
      const focus = a.at[key] + (b.at[key] - a.at[key]) * k;
      return all[key] + (focus - all[key]) * amount;
    };
    const tx = mix('tx');
    const ty = mix('ty');
    const D = mix('D');
    const bob = 3 * Math.sin(t * 0.8) * (1 - 0.6 * open);
    camera.position.set(tx, ty - bob, D);
    camera.near = Math.max(10, D - 500);
    camera.far = D + 500;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    // Assembly paths, faded in once things start coming apart.
    let any = 0;
    for (let i = 0; i < rigs.length; i++) {
      const r = rigs[i];
      const parent = r.parent ? device.parts.get(r.parent).holder : root;
      const from = parent.localToWorld(tmp.copy(r.pivot));
      pathPos.set([from.x, from.y, from.z], i * 6);
      const to = r.sep > 0.04 ? r.mover.getWorldPosition(tmp) : from;
      pathPos.set([to.x, to.y, to.z], i * 6 + 3);
      if (r.sep > 0.04) any = 1;
    }
    pathGeo.attributes.position.needsUpdate = true;
    paths.computeLineDistances();
    pathMat.opacity = any ? 0.5 * clamp(open * 1.5) : 0;

    renderer.render(scene, camera);

    // The leader anchor for the step on screen.
    const step = Math.floor(f);
    if (step >= 1 && step <= N) {
      const part = anchorPart[step - 1];
      return toScreen(part.holder.localToWorld(tmp.copy(part.anchor)));
    }
    return null;
  }

  const onContextLost = (e) => {
    e.preventDefault();
    onLost?.();
  };
  canvas.addEventListener('webglcontextlost', onContextLost);

  return {
    render,
    /**
     * The canvas is w x h CSS pixels. `frame` ({ x, y, w, h } inside it) is
     * where the device is framed; parts may run past it to the canvas edges.
     */
    resize(w, h, dpr, frame = { x: 0, y: 0, w, h }) {
      width = Math.max(1, w);
      height = Math.max(1, h);
      frameAspect = Math.max(1, frame.w) / Math.max(1, frame.h);
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = frameAspect;
      camera.setViewOffset(Math.max(1, frame.w), Math.max(1, frame.h), -frame.x, -frame.y, width, height);
      camera.updateProjectionMatrix();
    },
    dispose() {
      canvas.removeEventListener('webglcontextlost', onContextLost);
      device.dispose();
      pathGeo.dispose();
      pathMat.dispose();
      scene.environment?.dispose();
      renderer.dispose();
    },
  };
}
