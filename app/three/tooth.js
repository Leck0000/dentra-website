import * as THREE from 'three';
import { createSpin, createStage, glowTexture, reducedMotion } from './stage';

// A molar built from lathed (radius, height) profiles, cut open by a quarter so its layers show.
const PHI0 = Math.PI / 2;
const PHI = Math.PI * 1.5;

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const curve = (pts, n) =>
  new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r, y)))
    .getPoints(n)
    .map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));

const OUTER = curve([[0.52, 0.15], [0.6, 0.3], [0.68, 0.5], [0.7, 0.7], [0.66, 0.92], [0.55, 1.1], [0.36, 1.19], [0.14, 1.17], [0, 1.14]], 48);
const DENTIN = curve([[0.02, -1.52], [0.16, -1.4], [0.3, -1], [0.4, -0.5], [0.47, 0], [0.5, 0.2], [0.58, 0.45], [0.6, 0.7], [0.54, 0.9], [0.4, 1], [0.15, 0.98], [0, 0.96]], 96);
const PULP = curve([[0, -1.42], [0.04, -1.3], [0.08, -0.8], [0.14, -0.2], [0.22, 0.25], [0.26, 0.55], [0.2, 0.75], [0.08, 0.8], [0, 0.78]], 64);
const GUM = curve([[0.49, -0.34], [0.6, -0.3], [0.69, -0.08], [0.64, 0.12], [0.55, 0.18], [0.505, 0.05], [0.49, -0.34]], 64);

// Four cusps on the biting surface, with a groove where they meet
const cusp = (r, theta, y) => 0.075 * (0.5 + 0.5 * Math.cos(4 * theta)) * smooth(0.55, 1.05, y) * Math.min(1, r / 0.45);

function displace(geo, polar) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const { r, theta } = polar(p.getX(i), p.getZ(i));
    p.setY(i, y + cusp(r, theta, y));
  }
  geo.computeVertexNormals();
}

function layer(profile, { color, roughness = 0.45, clearcoat = 0, cusps = true }) {
  const mat = new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    clearcoat,
    clearcoatRoughness: 0.12,
    side: THREE.DoubleSide,
    transparent: true,
    emissive: '#2CA6A4',
    emissiveIntensity: 0,
  });
  const capMat = mat.clone();
  capMat.color.multiplyScalar(0.92);
  capMat.roughness = 0.85;
  capMat.clearcoat = 0;

  const group = new THREE.Group();
  const lathe = new THREE.LatheGeometry([...profile, profile[0]], 120, PHI0, PHI);
  if (cusps) displace(lathe, (x, z) => ({ r: Math.hypot(x, z), theta: Math.atan2(x, z) }));
  group.add(new THREE.Mesh(lathe, mat));

  // Flat faces where the quarter was cut away
  for (const phi of [PHI0, PHI0 + PHI]) {
    const cap = new THREE.ShapeGeometry(new THREE.Shape(profile), 1);
    if (cusps) displace(cap, (x) => ({ r: x, theta: phi }));
    const mesh = new THREE.Mesh(cap, capMat);
    mesh.rotation.y = phi - Math.PI / 2;
    group.add(mesh);
  }
  group.userData = { mats: [mat, capMat], opacity: 1, glow: 0 };
  return group;
}

function anchor(group, x, y, z) {
  const a = new THREE.Object3D();
  a.position.set(x, y, z);
  group.add(a);
  return a;
}

export function mountTooth(container, { labels, onReady }) {
  const stage = createStage(container, { fov: 30, position: [0, 1.1, 9.2], target: [0, 0.1, 0] });
  const { scene, camera } = stage;
  const still = reducedMotion();

  const fill = new THREE.DirectionalLight('#ffffff', 0.8);
  fill.position.set(2, 0, 6);
  scene.add(fill);

  const enamel = layer([...OUTER, ...DENTIN.filter((p) => p.y >= 0.15).reverse()], { color: '#f7fbfa', roughness: 0.18, clearcoat: 1 });
  const dentin = layer([...DENTIN, ...[...PULP].reverse()], { color: '#efd9ad', roughness: 0.55 });
  const pulp = layer(PULP, { color: '#e98a73', roughness: 0.4, clearcoat: 0.3 });
  const gum = layer(GUM, { color: '#f0a49b', roughness: 0.45, clearcoat: 0.4, cusps: false });
  const layers = [enamel, dentin, pulp, gum];
  layers.forEach((g, i) => g.children.forEach((m) => (m.renderOrder = [2, 1, 0, 3][i])));

  const anchors = [
    anchor(enamel, 0, 0.78, 0.64),
    anchor(dentin, 0, 0.1, 0.34),
    anchor(pulp, 0, -0.2, 0.07),
    anchor(gum, 0.6, -0.08, 0),
  ];

  const tooth = new THREE.Group();
  tooth.add(...layers);
  const rig = new THREE.Group();
  rig.add(tooth);
  scene.add(rig);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 2.6),
    new THREE.MeshBasicMaterial({ map: glowTexture('44,166,164', 0.4), transparent: true, depthWrite: false, toneMapped: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.85;
  rig.add(shadow);

  // Sit beside the copy on wide screens, above it on phones
  stage.onResize = (w, h) => {
    const aspect = w / h;
    rig.position.x = aspect > 1.15 ? Math.min(1.5, (aspect - 1) * 1.2) : 0;
    rig.position.y = aspect < 0.9 ? 0.5 : 0;
    rig.scale.setScalar(aspect < 0.7 ? 0.72 : 1);
  };

  let progress = 0;
  const spin = createSpin(container);
  const v = new THREE.Vector3();
  let first = true;

  stage.start((dt, time) => {
    spin.update(dt);
    const f = progress * 5;
    const step = Math.min(4, Math.floor(f));
    const e = smooth(0.35, 1.1, f);

    enamel.position.y = 0.62 * e;
    gum.position.y = -0.42 * e;

    const k = Math.min(1, dt * 6);
    layers.forEach((g, i) => {
      // The last step is gums and root, and the root is dentin
      const on = step === 0 || step === i + 1 || (step === 4 && g === dentin);
      const d = g.userData;
      d.opacity += ((on ? 1 : 0.2) - d.opacity) * k;
      d.glow += ((on && step > 0 ? 0.22 : 0) - d.glow) * k;
      for (const m of d.mats) {
        m.opacity = d.opacity;
        m.emissiveIntensity = d.glow;
        m.depthWrite = d.opacity > 0.97;
      }
    });

    const sway = still ? 0 : Math.sin(time * 0.4) * 0.08;
    tooth.rotation.y = -Math.PI / 4 + (progress - 0.4) * 0.9 + spin.rot + sway + spin.tiltY;
    tooth.rotation.x = 0.12 + spin.tiltX;

    scene.updateMatrixWorld();
    const w = container.clientWidth;
    const h = container.clientHeight;
    anchors.forEach((a, i) => {
      const el = labels[i];
      if (!el) return;
      v.setFromMatrixPosition(a.matrixWorld).project(camera);
      el.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`;
    });

    if (first) {
      first = false;
      onReady?.();
    }
  });

  return {
    setProgress(p) {
      progress = p;
    },
    dispose() {
      spin.dispose();
      stage.dispose();
    },
  };
}
