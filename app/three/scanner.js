import * as THREE from 'three';
import { createSpin, createStage, glowTexture, reducedMotion } from './stage';

// The DENTRA scanner, modeled along +X: body from the charging port (-X) to the camera head (+X).
const HW = 0.2; // body half-width (z)
const HH = 0.16; // body half-height (y)
const BR = 0.12; // body corner radius
const BODY_START = -1.7;
const BODY_LEN = 2.6;

function halfSection(top) {
  const s = new THREE.Shape();
  const v = top ? 1 : -1;
  s.moveTo(-HW, 0);
  s.lineTo(-HW, v * (HH - BR));
  s.absarc(-HW + BR, v * (HH - BR), BR, Math.PI, top ? Math.PI / 2 : Math.PI * 1.5, top);
  s.lineTo(HW - BR, v * HH);
  s.absarc(HW - BR, v * (HH - BR), BR, top ? Math.PI / 2 : Math.PI * 1.5, top ? 0 : Math.PI * 2, top);
  s.lineTo(HW, 0);
  s.closePath();
  return s;
}

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  return s;
}

function stadium(len, w) {
  const s = new THREE.Shape();
  const r = w / 2;
  const a = len / 2 - r;
  s.moveTo(-a, -r);
  s.lineTo(a, -r);
  s.absarc(a, 0, r, -Math.PI / 2, Math.PI / 2);
  s.lineTo(-a, r);
  s.absarc(-a, 0, r, Math.PI / 2, Math.PI * 1.5);
  return s;
}

// Extrude a cross-section (in the YZ plane) along +X
function alongX(shape, length, { bevel = 0.08, size = 0.03 } = {}) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: length,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: size,
    bevelSegments: 8,
    curveSegments: 24,
  });
  g.rotateY(Math.PI / 2);
  return g;
}

// A flat shape lying on a surface that faces +Y
function onTop(shape) {
  return new THREE.ShapeGeometry(shape, 24).rotateX(-Math.PI / 2);
}

function box(w, h, d, mat, x, y, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}

function cylinderX(r, len, mat, x, y, z = 0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 32), mat);
  m.rotation.z = Math.PI / 2;
  m.position.set(x, y, z);
  return m;
}

export function mountScanner(container, { labels, onReady }) {
  const stage = createStage(container, { fov: 30, position: [0, 0.3, 6.6], target: [0, 0.1, 0] });
  const { scene, camera } = stage;
  const still = reducedMotion();

  const white = new THREE.MeshPhysicalMaterial({ color: '#f5f7f7', roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.2 });
  const black = new THREE.MeshPhysicalMaterial({ color: '#0b0f11', roughness: 0.15, clearcoat: 1 });
  const grey = new THREE.MeshStandardMaterial({ color: '#9aa5a8', roughness: 0.4 });
  const metal = new THREE.MeshStandardMaterial({ color: '#c9d1d3', metalness: 1, roughness: 0.25 });
  const lensGlass = new THREE.MeshPhysicalMaterial({ color: '#081014', roughness: 0.04, clearcoat: 1, metalness: 0.3 });
  const nir = new THREE.MeshStandardMaterial({ color: '#4a1420', emissive: '#ff4d6d', emissiveIntensity: 0.35, roughness: 0.3 });
  const pcbGreen = new THREE.MeshStandardMaterial({ color: '#1f6b4f', roughness: 0.6 });
  const pcbBlue = new THREE.MeshStandardMaterial({ color: '#24508a', roughness: 0.6 });
  const chip = new THREE.MeshStandardMaterial({ color: '#15191b', roughness: 0.5 });
  const gold = new THREE.MeshStandardMaterial({ color: '#d4a94a', metalness: 1, roughness: 0.3 });
  const wrap = new THREE.MeshPhysicalMaterial({ color: '#2CA6A4', roughness: 0.35, clearcoat: 0.6 });
  const ribbonMat = new THREE.MeshStandardMaterial({ color: '#ece6d6', roughness: 0.7 });
  const clear = new THREE.MeshPhysicalMaterial({
    color: '#dff7f4',
    roughness: 0.05,
    clearcoat: 1,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const device = new THREE.Group();

  // Shell: two halves so the top can lift off
  const bottom = new THREE.Mesh(alongX(halfSection(false), BODY_LEN), white);
  const topShell = new THREE.Group();
  topShell.add(new THREE.Mesh(alongX(halfSection(true), BODY_LEN), white));
  bottom.position.x = BODY_START;
  topShell.children[0].position.x = BODY_START;

  const surface = HH + 0.031;
  const panel = new THREE.Mesh(onTop(stadium(1.05, 0.17)), black);
  panel.position.set(-0.78, surface, 0);
  topShell.add(panel);
  for (const x of [-0.12, -0.03]) {
    const dot = new THREE.Mesh(onTop(new THREE.Shape().absarc(0, 0, 0.018, 0, Math.PI * 2)), grey);
    dot.position.set(x, surface, 0);
    topShell.add(dot);
  }

  const port = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(0.15, 0.055, 0.025), 12), black);
  port.rotation.y = -Math.PI / 2;
  port.position.set(BODY_START - 0.081, -0.02, 0);

  // Neck and camera head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.078, 0.9, 32), white);
  neck.rotation.z = Math.PI / 2;
  neck.position.set(1.33, 0.04, 0);

  const headY = 0.04;
  const head = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedRect(0.38, 0.27, 0.12), { depth: 0.08, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 6, curveSegments: 24 })
      .center()
      .rotateX(-Math.PI / 2),
    white
  );
  head.position.set(1.88, headY, 0);
  const headTop = headY + 0.061;
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.02, 40), metal);
  ring.position.set(1.88, headTop, 0);
  const window_ = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.064, 0.026, 40), lensGlass);
  window_.position.set(1.88, headTop + 0.002, 0);
  device.add(bottom, topShell, port, neck, head, ring, window_);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.016, 16, 12), nir);
    led.position.set(1.88 + Math.cos(a) * 0.115, headTop, Math.sin(a) * 0.09);
    device.add(led);
  }

  // Clear hygiene sleeve over the neck and head
  const sleeve = new THREE.Mesh(alongX(roundedRect(0.34, 0.27, 0.11), 1.12, { bevel: 0.09, size: 0.02 }), clear);
  sleeve.position.set(0.9, headY, 0);
  sleeve.renderOrder = 2;
  device.add(sleeve);

  // Inside: the parts listed on the page
  const parts = new THREE.Group();
  const battery = new THREE.Group();
  battery.add(cylinderX(0.1, 0.62, wrap, -1.12, 0), cylinderX(0.1, 0.03, metal, -0.795, 0), cylinderX(0.06, 0.04, metal, -1.445, 0));
  const board = new THREE.Group();
  board.add(
    box(0.95, 0.02, 0.27, pcbGreen, -0.25, 0.03),
    box(0.17, 0.03, 0.17, chip, -0.32, 0.055),
    box(0.08, 0.025, 0.06, chip, -0.05, 0.05, 0.06),
    box(0.55, 0.035, 0.035, gold, -0.25, 0.058, -0.105)
  );
  const charger = new THREE.Group();
  charger.add(box(0.26, 0.02, 0.2, pcbBlue, -1.58, -0.04), box(0.07, 0.03, 0.07, chip, -1.6, -0.015));
  const ribbon = box(1.5, 0.008, 0.09, ribbonMat, 0.98, 0.045);
  parts.add(battery, board, charger, ribbon);

  const camModule = new THREE.Group();
  const camLens = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.045, 32), chip);
  camLens.position.set(1.88, headY + 0.03, 0);
  camModule.add(box(0.17, 0.016, 0.17, pcbGreen, 1.88, headY), camLens);
  device.add(parts, camModule);

  const anchors = [
    [camModule, 1.88, headY + 0.06, 0],
    [device, 1.88 + 0.115 * Math.cos(Math.PI / 4), headTop, 0.064],
    [board, -0.2, 0.08, -0.12],
    [battery, -1.05, 0.1, 0.1],
    [charger, -1.62, -0.03, -0.1],
  ].map(([parent, x, y, z]) => {
    const a = new THREE.Object3D();
    a.position.set(x, y, z);
    parent.add(a);
    return a;
  });

  const spinner = new THREE.Group();
  device.position.x = -0.15;
  spinner.add(device);
  scene.add(spinner);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 1.6),
    new THREE.MeshBasicMaterial({ map: glowTexture('44,166,164', 0.45), transparent: true, depthWrite: false, toneMapped: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.1;
  scene.add(shadow);

  // Fit the device to the canvas (about 4.2 units long closed, 5.2 open);
  // on tall screens stand it on a steeper diagonal
  let roll = 0.22;
  let room = 5;
  stage.onResize = (w, h) => {
    const visibleH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const portrait = w / h < 0.9;
    roll = portrait ? 1.0 : 0.22;
    room = portrait ? visibleH * 0.93 : (visibleH * w) / h;
  };

  // Open/close on a critically damped spring so it can be reversed mid-way
  let target = 0;
  let open = 0;
  let openVel = 0;
  const spin = createSpin(container);
  const v = new THREE.Vector3();
  let first = true;

  stage.start((dt, time) => {
    spin.update(dt);
    const w = (Math.PI * 2) / 0.55;
    openVel += (-w * w * (open - target) - 2 * w * openVel) * dt;
    open += openVel * dt;
    const e = Math.min(1, Math.max(0, open));

    topShell.position.y = 1.1 * e;
    topShell.position.z = -0.35 * e;
    board.position.set(0, 0.8 * e, -0.1 * e);
    ribbon.position.y = 0.8 * e;
    battery.position.set(0, 0.45 * e, 0.4 * e);
    charger.position.set(-0.2 * e, 0.4 * e, -0.35 * e);
    camModule.position.y = 0.95 * e;
    sleeve.position.x = 0.9 + 0.95 * e;
    clear.opacity = 0.14 * (1 - 0.6 * e);

    spinner.scale.setScalar(Math.min(1.3, room / (4.2 + e)));
    const sway = still ? 0 : Math.sin(time * 0.45) * 0.1;
    spinner.rotation.set(0.5 + 0.35 * e + spin.tiltX, -0.3 + spin.rot + sway + spin.tiltY, roll);
    spinner.position.y = still ? 0 : Math.sin(time * 1.1) * 0.04;

    scene.updateMatrixWorld();
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    anchors.forEach((a, i) => {
      const el = labels[i];
      if (!el) return;
      v.setFromMatrixPosition(a.matrixWorld).project(camera);
      const x = ((v.x + 1) / 2) * cw;
      // Labels near the right edge read leftwards so they stay inside the canvas
      const flip = x > cw * 0.62 ? ' translateX(calc(-100% + 24px))' : '';
      el.classList.toggle('flip', !!flip);
      el.style.transform = `translate(${x}px, ${((1 - v.y) / 2) * ch}px)${flip}`;
      el.style.opacity = e;
    });

    if (first) {
      first = false;
      onReady?.();
    }
  });

  return {
    setOpen(isOpen) {
      target = isOpen ? 1 : 0;
    },
    dispose() {
      spin.dispose();
      stage.dispose();
    },
  };
}
