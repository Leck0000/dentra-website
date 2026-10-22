import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const TAU = Math.PI * 2;

export const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function glowTexture(rgb = '44,166,164', alpha = 0.5) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, `rgba(${rgb},${alpha})`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Renderer, studio lighting and a render loop that only runs while the canvas is on screen.
export function createStage(container, { fov = 30, position = [0, 0, 6], target = [0, 0, 0] } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.85;

  scene.add(new THREE.HemisphereLight('#ffffff', '#cfeeea', 0.8));
  const key = new THREE.DirectionalLight('#ffffff', 1.6);
  key.position.set(3, 5, 5);
  const rim = new THREE.DirectionalLight('#4DD8C8', 2.6);
  rim.position.set(-5, 1.5, -3);
  scene.add(key, rim);

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
  camera.position.set(...position);
  camera.lookAt(...target);

  let tick = null;
  let raf = 0;
  let last = 0;

  const stage = {
    renderer,
    scene,
    camera,
    onResize: null,
    start(fn) {
      tick = fn;
      resize();
      ro.observe(container);
      io.observe(container);
    },
    dispose() {
      pause();
      ro.disconnect();
      io.disconnect();
      scene.traverse((o) => {
        o.geometry?.dispose();
        for (const m of [].concat(o.material || [])) {
          for (const k in m) if (m[k]?.isTexture) m[k].dispose();
          m.dispose();
        }
      });
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    stage.onResize?.(w, h);
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((t - last) / 1000, 1 / 30);
    last = t;
    tick?.(dt, t / 1000);
    renderer.render(scene, camera);
  }
  function play() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function pause() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  const ro = new ResizeObserver(resize);
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? play() : pause()), { rootMargin: '120px' });

  return stage;
}

// Drag to spin. Tracks the pointer 1:1, then projects the release velocity forward,
// picks the nearest front-facing turn and settles there on a spring that inherits that velocity.
export function createSpin(el, { sensitivity = 0.011, response = 0.6, damping = 0.8 } = {}) {
  const s = { rot: 0, vel: 0, target: 0, dragging: false, tiltX: 0, tiltY: 0 };
  let hoverX = 0;
  let hoverY = 0;
  let startX = 0;
  let startRot = 0;
  let history = [];

  const down = (e) => {
    s.dragging = true;
    el.setPointerCapture(e.pointerId);
    el.classList.add('grabbing');
    startX = e.clientX;
    startRot = s.rot;
    s.vel = 0;
    history = [[e.clientX, e.timeStamp]];
  };
  const move = (e) => {
    const r = el.getBoundingClientRect();
    hoverX = ((e.clientX - r.left) / r.width - 0.5) * 2;
    hoverY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (!s.dragging) return;
    s.rot = startRot + (e.clientX - startX) * sensitivity;
    history.push([e.clientX, e.timeStamp]);
    while (history.length > 2 && e.timeStamp - history[0][1] > 80) history.shift();
  };
  const up = () => {
    if (!s.dragging) return;
    s.dragging = false;
    el.classList.remove('grabbing');
    const [x0, t0] = history[0];
    const [x1, t1] = history[history.length - 1];
    s.vel = t1 > t0 ? ((x1 - x0) / (t1 - t0)) * 1000 * sensitivity : 0;
    const projected = s.rot + ((s.vel / 1000) * 0.998) / (1 - 0.998);
    s.target = Math.round(projected / TAU) * TAU;
  };
  const leave = () => {
    hoverX = 0;
    hoverY = 0;
  };

  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('pointerleave', leave);

  s.update = (dt) => {
    if (!s.dragging) {
      const w = TAU / response;
      s.vel += (-w * w * (s.rot - s.target) - 2 * damping * w * s.vel) * dt;
      s.rot += s.vel * dt;
    }
    const k = Math.min(1, dt * 6);
    s.tiltY += (hoverX * 0.12 - s.tiltY) * k;
    s.tiltX += (hoverY * 0.08 - s.tiltX) * k;
  };
  s.dispose = () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
    el.removeEventListener('pointerleave', leave);
  };
  return s;
}
