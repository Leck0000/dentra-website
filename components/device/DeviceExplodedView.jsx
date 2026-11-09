'use client';

import { useEffect, useRef, useState } from 'react';
import { FINAL, INTRO, STEPS } from './steps';

// Scroll-driven exploded view of the DENTRA camera, in 3D.
//
// The section is a tall scroll track with one sticky, full-height stage. Scroll
// position maps to f, in steps (see scene/scene.js): 0 is the assembled device,
// 1..N take one group of parts off each, N+1 puts it back together for the
// final caption. f is eased toward the scroll position every frame, so the
// motion stays smooth on a jumpy scroll wheel, and it is a pure function of
// scroll, so scrolling back up reverses it exactly.
//
// three.js (scene/) is loaded only as the section nears the viewport. Until it
// is ready, or if WebGL is unavailable, a pre-rendered poster stands in.
// prefers-reduced-motion gets a static exploded picture and a list instead.

const N = STEPS.length;
const SEGMENTS = N + 2;
const STEP_VH = 85; // scroll length of one step

const pad = (n) => String(n).padStart(2, '0');
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

export default function DeviceExplodedView() {
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const anchorRef = useRef(null);
  const leaderRef = useRef(null);
  const dotRef = useRef(null);
  const barRef = useRef(null);
  const stepRef = useRef(0);
  const [step, setStep] = useState(0);
  // poster: three.js not loaded yet; live: the 3D scene is drawing; fallback: no WebGL.
  const [mode, setMode] = useState('poster');

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(pointer: fine)');
    let scene = null;
    let loading = false;
    let disposed = false;
    let raf = 0;
    let running = false;
    let layout = null;
    let q = null;
    let last = 0;
    let slowFrames = 0;
    // Full-bleed canvas: keep phones a little under 2x to save fill rate.
    let dpr = Math.min(window.devicePixelRatio || 1, finePointer.matches ? 1.75 : 1.6);
    const pointer = { x: 0, y: 0 };
    const cleanups = [];

    const measure = () => {
      const stage = stageRef.current.getBoundingClientRect();
      const vp = viewportRef.current.getBoundingClientRect();
      const anchor = anchorRef.current.getBoundingClientRect();
      const track = trackRef.current;
      layout = {
        top: track.getBoundingClientRect().top + window.scrollY,
        height: track.offsetHeight,
        ax: anchor.left - stage.left,
        ay: anchor.top - stage.top,
      };
      // The canvas fills the stage; the device is framed in the viewport column.
      scene?.resize(stage.width, stage.height, dpr, { x: vp.left - stage.left, y: vp.top - stage.top, w: vp.width, h: vp.height });
    };

    // Scroll position in steps: -1..0 while the section scrolls in, then 0..SEGMENTS while pinned.
    const target = () => {
      const { top, height } = layout;
      const vh = window.innerHeight;
      if (window.scrollY < top) return clamp01((window.scrollY - top + vh) / vh) - 1;
      const max = height - vh;
      return max > 0 ? Math.min(clamp01((window.scrollY - top) / max) * SEGMENTS, SEGMENTS - 1e-4) : 0;
    };

    const frame = (now) => {
      raf = running ? requestAnimationFrame(frame) : 0;
      if (!layout) measure();
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
      last = now;

      const goal = target();
      q = q === null ? goal : q + (goal - q) * (1 - Math.exp(-dt * 7));
      if (Math.abs(goal - q) < 1e-4) q = goal;

      barRef.current.style.transform = `scaleX(${clamp01(q / SEGMENTS)})`;
      const next = Math.max(0, Math.min(SEGMENTS - 1, Math.floor(q)));
      if (next !== stepRef.current) {
        stepRef.current = next;
        setStep(next);
      }
      if (!scene) return;

      const anchor = scene.render(q, now / 1000, pointer.x, pointer.y);
      if (anchor) {
        // Leader line from the label to the active part.
        const x1 = anchor.x;
        const y1 = anchor.y;
        const dx = layout.ax - 12 - x1;
        const dy = layout.ay - y1;
        leaderRef.current.style.transform = `translate3d(${x1}px, ${y1}px, 0) rotate(${Math.atan2(dy, dx)}rad) scaleX(${Math.hypot(dx, dy) / 100})`;
        dotRef.current.style.transform = `translate3d(${x1 - 4}px, ${y1 - 4}px, 0)`;
      }

      // Drop to 1x resolution if the device can't keep up.
      slowFrames = dt > 0.034 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 40 && dpr > 1) {
        dpr = 1;
        slowFrames = 0;
        measure();
      }
    };

    const play = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const load = () => {
      if (loading) return;
      loading = true;
      import('./scene/scene.js')
        .then(({ createDeviceScene }) => {
          if (disposed) return;
          scene = createDeviceScene(canvasRef.current, {
            onLost: () => {
              scene = null;
              setMode('fallback');
            },
          });
          layout = null;
          setMode('live');
        })
        .catch(() => {
          if (!disposed) setMode('fallback');
        });
    };

    const start = () => {
      // Load three.js a screen or so before the section arrives.
      const near = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && load(), { rootMargin: '150% 0px' });
      near.observe(trackRef.current);
      // Draw only while the section is on screen.
      const seen = new IntersectionObserver((entries) => (entries.some((e) => e.isIntersecting) ? play() : pause()));
      seen.observe(trackRef.current);
      const ro = new ResizeObserver(() => (layout = null));
      ro.observe(stageRef.current);
      const onResize = () => (layout = null);
      window.addEventListener('resize', onResize);

      const stage = stageRef.current;
      const onMove = (e) => {
        if (!finePointer.matches) return;
        const r = stage.getBoundingClientRect();
        pointer.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
        pointer.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      };
      const onLeave = () => {
        pointer.x = 0;
        pointer.y = 0;
      };
      stage.addEventListener('pointermove', onMove, { passive: true });
      stage.addEventListener('pointerleave', onLeave);

      cleanups.push(() => {
        near.disconnect();
        seen.disconnect();
        ro.disconnect();
        window.removeEventListener('resize', onResize);
        stage.removeEventListener('pointermove', onMove);
        stage.removeEventListener('pointerleave', onLeave);
        pause();
      });
    };
    const stop = () => {
      while (cleanups.length) cleanups.pop()();
    };
    const onPref = () => (reduce.matches ? stop() : start());

    if (!reduce.matches) start();
    reduce.addEventListener('change', onPref);
    return () => {
      disposed = true;
      stop();
      reduce.removeEventListener('change', onPref);
      scene?.dispose();
      scene = null;
    };
  }, []);

  const active = step >= 1 && step <= N ? step - 1 : -1;
  const live =
    step === 0
      ? 'Assembled camera.'
      : active >= 0
        ? `Step ${step} of ${N + 1}: ${STEPS[active].name}. ${STEPS[active].desc}`
        : `Step ${N + 1} of ${N + 1}: ${FINAL.desc}`;
  const poster = mode === 'fallback' && active >= 1 ? '/device/exploded.webp' : '/device/assembled.webp';

  return (
    <section className="device" id="device" data-mode={mode} aria-label="Inside the DENTRA camera, a capstone prototype">
      {/* Pinned, scroll-driven view */}
      <div className="device-track" ref={trackRef} style={{ height: `${SEGMENTS * STEP_VH}vh` }}>
        <div className="device-stage" ref={stageRef}>
          <canvas className="device-canvas" ref={canvasRef} aria-hidden="true" />
          <div className="wrap device-grid">
            <div className="device-viewport" ref={viewportRef} role="img" aria-label="3D model of the DENTRA camera, coming apart as you scroll">
              <img className="device-poster" src={poster} alt="" width="1200" height="1200" decoding="async" />
            </div>

            <div className="device-panel">
              <p className="device-eyebrow">
                The device <span className="device-tag">Capstone prototype</span>
              </p>
              <div className="device-labels">
                <div className={`device-label${step === 0 ? ' on' : ''}`}>
                  <h2 className="device-title">{INTRO.title}</h2>
                  <p className="muted">{INTRO.desc}</p>
                </div>
                {STEPS.map((s, i) => (
                  <div key={s.id} className={`device-label${step === i + 1 ? ' on' : ''}`} aria-hidden="true">
                    <p className="device-count"><b>{pad(i + 1)}</b> / {pad(N + 1)}</p>
                    <h3>{s.name}</h3>
                    <p className="muted">{s.desc}</p>
                  </div>
                ))}
                <div className={`device-label${step === N + 1 ? ' on' : ''}`} aria-hidden="true">
                  <p className="device-count"><b>{pad(N + 1)}</b> / {pad(N + 1)}</p>
                  <h3>{FINAL.name}</h3>
                  <p className="muted">{FINAL.desc}</p>
                </div>
                <span className="device-anchor" ref={anchorRef} aria-hidden="true" />
              </div>
              <div className="device-progress" aria-hidden="true"><span ref={barRef} /></div>
              <p className="visually-hidden" aria-live="polite">{live}</p>
            </div>
          </div>
          <span className={`device-leader${active >= 0 ? ' on' : ''}`} ref={leaderRef} aria-hidden="true" />
          <span className={`device-dot${active >= 0 ? ' on' : ''}`} ref={dotRef} aria-hidden="true" />

          <ol className="visually-hidden">
            {STEPS.map((s) => (
              <li key={s.id}>{s.name}: {s.desc}</li>
            ))}
            <li>{FINAL.desc}</li>
          </ol>
        </div>
      </div>

      {/* prefers-reduced-motion: no pinning, a still exploded view and the parts as a list */}
      <div className="device-static">
        <div className="wrap">
          <p className="device-eyebrow">
            The device <span className="device-tag">Capstone prototype</span>
          </p>
          <h2 className="device-title">{INTRO.title}</h2>
          <img className="device-static-art" src="/device/exploded.webp" alt="The DENTRA camera taken apart: end cap, shell, buttons, lens window, LED ring, camera, ribbon, main board and battery" width="1200" height="1200" loading="lazy" decoding="async" />
          <ol className="device-static-list">
            {STEPS.map(({ id, name, desc }, i) => (
              <li key={id}>
                <p className="device-count"><b>{pad(i + 1)}</b> / {pad(N + 1)}</p>
                <h3>{name}</h3>
                <p className="muted">{desc}</p>
              </li>
            ))}
            <li className="device-static-final">
              <p className="device-count"><b>{pad(N + 1)}</b> / {pad(N + 1)}</p>
              <h3>{FINAL.name}</h3>
              <p className="muted">{FINAL.desc}</p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
