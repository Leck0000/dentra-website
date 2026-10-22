import * as THREE from 'three';
import { createSpin, createStage, glowTexture, reducedMotion } from './stage';

// Phone body in world units; the screen matches the 600x1201 screenshots.
const W = 1;
const H = 1.94;
const D = 0.09;
const BEVEL = 0.025;
const R = 0.15;
const SW = W - 0.07;
const SH = H - 0.07;

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

const screenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const screenFragment = /* glsl */ `
  uniform sampler2D uA;
  uniform sampler2D uB;
  uniform float uMix;
  uniform float uReady;
  uniform float uSheen;
  uniform vec2 uSize;
  uniform float uRadius;
  varying vec2 vUv;

  float roundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    float d = roundBox(p, uSize * 0.5, uRadius);
    float aa = fwidth(d);
    float mask = 1.0 - smoothstep(-aa, aa, d);

    vec3 col = mix(texture2D(uA, vUv).rgb, texture2D(uB, vUv).rgb, uMix);
    col = mix(vec3(0.79, 0.93, 0.92), col, uReady);

    // Punch-hole camera
    float hole = length(p - vec2(0.0, uSize.y * 0.5 - 0.05)) - 0.02;
    col = mix(vec3(0.004), col, smoothstep(-aa, aa, hole));

    // A soft band of light across the glass that follows the phone's turn
    float band = 1.0 - smoothstep(0.0, 0.28, abs(vUv.x * 0.8 + vUv.y * 0.6 - uSheen));
    col += band * 0.05;

    gl_FragColor = vec4(col, mask);
    #include <colorspace_fragment>
  }
`;

export function mountPhone(container, { srcs, onReady }) {
  const stage = createStage(container, { fov: 28, position: [0, 0.15, 5], target: [0, -0.06, 0] });
  const { scene, renderer } = stage;
  const still = reducedMotion();

  const phone = new THREE.Group();
  scene.add(phone);

  const front = D / 2 + BEVEL;
  const metal = new THREE.MeshPhysicalMaterial({ color: '#22323a', metalness: 0.75, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.15 });
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedRect(W - 2 * BEVEL, H - 2 * BEVEL, R - BEVEL), {
      depth: D,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 8,
      curveSegments: 32,
    }).center(),
    metal
  );

  const glass = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRect(W - 2 * BEVEL, H - 2 * BEVEL, R - BEVEL), 32),
    new THREE.MeshPhysicalMaterial({ color: '#05080a', roughness: 0.08, clearcoat: 1 })
  );
  glass.position.z = front + 0.001;

  const u = {
    uA: { value: null },
    uB: { value: null },
    uMix: { value: 1 },
    uReady: { value: 0 },
    uSheen: { value: 0.7 },
    uSize: { value: new THREE.Vector2(SW, SH) },
    uRadius: { value: 0.11 },
  };
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(SW, SH),
    new THREE.ShaderMaterial({ uniforms: u, vertexShader: screenVertex, fragmentShader: screenFragment, transparent: true })
  );
  screen.position.z = front + 0.002;

  // Camera bump and side buttons
  const bx = -W / 2 + 0.25;
  const by = H / 2 - 0.25;
  const bump = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedRect(0.32, 0.32, 0.09), { depth: 0.02, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 4, curveSegments: 16 }),
    metal
  );
  bump.position.set(bx, by, -front - 0.03);
  const lensMat = new THREE.MeshPhysicalMaterial({ color: '#0a1114', roughness: 0.05, metalness: 0.2, clearcoat: 1 });
  for (const [dx, dy] of [[-0.065, 0.065], [0.065, -0.065]]) {
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.056, 0.03, 32), lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(bx + dx, by + dy, -front - 0.05);
    phone.add(lens);
  }
  for (const [y, h] of [[0.45, 0.22], [0.16, 0.12]]) {
    const btn = new THREE.Mesh(new THREE.BoxGeometry(0.02, h, 0.045), metal);
    btn.position.set(W / 2 + 0.004, y, 0);
    phone.add(btn);
  }
  phone.add(body, glass, screen, bump);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 0.7),
    new THREE.MeshBasicMaterial({ map: glowTexture('44,166,164', 0.55), transparent: true, depthWrite: false, toneMapped: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -H / 2 - 0.14;
  scene.add(shadow);

  // Mint motes drifting around the phone
  const N = 46;
  const pos = new Float32Array(N * 3);
  const speed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 3.4;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 2.8;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 1.6 - 0.4;
    speed[i] = 0.05 + Math.random() * 0.12;
  }
  const motesGeo = new THREE.BufferGeometry();
  motesGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const motes = new THREE.Points(
    motesGeo,
    new THREE.PointsMaterial({ size: 0.07, map: glowTexture('77,216,200', 1), transparent: true, depthWrite: false, opacity: 0.85 })
  );
  scene.add(motes);

  // Screens: load on demand, cross-fade between them
  const loader = new THREE.TextureLoader();
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const cache = new Map();
  const load = (i) => {
    if (!cache.has(i)) {
      cache.set(
        i,
        loader.loadAsync(srcs[i]).then((tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = aniso;
          return tex;
        })
      );
    }
    return cache.get(i);
  };
  let wanted = 0;
  let disposed = false;
  const show = (tex) => {
    if (!u.uB.value) {
      u.uA.value = u.uB.value = tex;
      u.uMix.value = 1;
      onReady?.();
      return;
    }
    u.uA.value = u.uMix.value > 0.5 ? u.uB.value : u.uA.value;
    u.uB.value = tex;
    u.uMix.value = 0;
  };

  const spin = createSpin(container);
  stage.start((dt, time) => {
    spin.update(dt);
    const sway = still ? 0 : Math.sin(time * 0.5) * 0.12;
    phone.rotation.y = -0.38 + spin.rot + sway + spin.tiltY;
    phone.rotation.x = 0.05 + spin.tiltX;
    phone.position.y = still ? 0 : Math.sin(time * 1.1) * 0.04;
    shadow.material.opacity = 1 - phone.position.y * 3;

    u.uSheen.value = 0.75 + Math.sin(phone.rotation.y) * 0.7;
    u.uMix.value = Math.min(1, u.uMix.value + dt / 0.45);
    if (u.uB.value) u.uReady.value = Math.min(1, u.uReady.value + dt / 0.6);

    if (!still) {
      for (let i = 0; i < N; i++) {
        pos[i * 3 + 1] += speed[i] * dt;
        if (pos[i * 3 + 1] > 1.4) pos[i * 3 + 1] = -1.4;
      }
      motesGeo.attributes.position.needsUpdate = true;
    }
  });

  return {
    setScreen(i) {
      wanted = i;
      load(i).then((tex) => {
        if (!disposed && wanted === i) show(tex);
        srcs.forEach((_, j) => load(j));
      });
    },
    dispose() {
      disposed = true;
      spin.dispose();
      stage.dispose();
      for (const p of cache.values()) p.then((tex) => tex.dispose());
    },
  };
}
