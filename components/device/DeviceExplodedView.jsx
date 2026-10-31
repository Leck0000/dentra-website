'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CY, RIG_W } from './kit';
import { FINAL, STEPS } from './steps';

// Scroll-driven exploded view.
//
// The section is a ~900vh scroll track with one sticky, full-height stage.
// Scroll progress p (0..1 across the track) maps to f = p * SEGMENTS: step 0 is
// the assembled device, steps 1..N lift part N-1 off the stack, and the last
// step is the final caption. Positions are written straight to the DOM in a rAF
// callback (transform only); React state changes only when the step changes.

const N = STEPS.length;
const SEGMENTS = N + 2;
const SPACING = 76; // centre-to-centre gap between separated parts, rig units
const LAYER = 2; // small offset between parts while still stacked
const WINDOW = 0.7; // how much of a step the lift takes, centred on the step change
const TOP_EXT = 30; // shell top above its centre line
const STACK_BOTTOM = 46; // assembled stack bottom below the centre line
const CELL_BOTTOM = 24; // battery bottom below its centre line
const EXTENT = (N - 1) * SPACING + TOP_EXT + CELL_BOTTOM; // fully exploded height

const pad = (n) => String(n).padStart(2, '0');
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (x) => x * x * (3 - 2 * x);

export default function DeviceExplodedView() {
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const viewportRef = useRef(null);
  const rigRef = useRef(null);
  const partRefs = useRef([]);
  const anchorRef = useRef(null);
  const leaderRef = useRef(null);
  const dotRef = useRef(null);
  const barRef = useRef(null);
  const stepRef = useRef(0);
  const [step, setStep] = useState(0);
  // The SVG art never changes; stable elements let React skip it on step changes.
  const art = useMemo(() => STEPS.map(({ id, Part }) => <Part key={id} />), []);
  const staticArt = useMemo(() => STEPS.map(({ id, Part }) => <Part key={id} />), []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let layout = null;
    let ro = null;

    const measure = () => {
      const stage = stageRef.current.getBoundingClientRect();
      const vp = viewportRef.current.getBoundingClientRect();
      const anchor = anchorRef.current.getBoundingClientRect();
      const track = trackRef.current;
      layout = {
        top: track.getBoundingClientRect().top + window.scrollY,
        height: track.offsetHeight,
        s: Math.min((vp.width * 0.92) / RIG_W, (vp.height * 0.88) / EXTENT, 1.6),
        // Rig origin (viewport centre) and label anchor, relative to the stage.
        ox: vp.left - stage.left + vp.width / 2,
        oy: vp.top - stage.top + vp.height / 2,
        ax: anchor.left - stage.left,
        ay: anchor.top - stage.top,
      };
    };

    const frame = () => {
      raf = 0;
      if (!layout) measure();
      const { top, height, s, ox, oy, ax, ay } = layout;
      const max = height - window.innerHeight;
      const p = max > 0 ? clamp01((window.scrollY - top) / max) : 0;
      const f = p * SEGMENTS;

      // Each separation pushes that part and every part above it up one slot.
      const centres = new Array(N);
      let lift = 0;
      let lastSep = 0;
      for (let i = N - 1; i >= 0; i--) {
        const sep = smooth(clamp01((f - (i + 1) + WINDOW / 2) / WINDOW));
        if (i === N - 1) lastSep = sep;
        lift += sep * SPACING;
        centres[i] = i * LAYER * (1 - sep) - lift;
      }
      const bottom = centres[N - 1] + STACK_BOTTOM + (CELL_BOTTOM - STACK_BOTTOM) * lastSep;
      const mid = (centres[0] - TOP_EXT + bottom) / 2;
      const tx = (-RIG_W * s) / 2;
      const ty = -s * mid;

      rigRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
      for (let i = 0; i < N; i++) {
        partRefs.current[i].style.transform = `translate3d(0, ${centres[i] - CY}px, 0)`;
      }
      barRef.current.style.transform = `scaleX(${p})`;

      const next = Math.min(SEGMENTS - 1, Math.floor(f));
      if (next !== stepRef.current) {
        stepRef.current = next;
        setStep(next);
      }

      // Leader line from the label to the active part.
      const active = next - 1;
      if (active >= 0 && active < N) {
        const x1 = ox + tx + STEPS[active].anchorX * s;
        const y1 = oy + ty + centres[active] * s;
        const dx = ax - 12 - x1;
        const dy = ay - y1;
        const len = Math.max(0, Math.hypot(dx, dy));
        leaderRef.current.style.transform = `translate3d(${x1}px, ${y1}px, 0) rotate(${Math.atan2(dy, dx)}rad) scaleX(${len / 100})`;
        dotRef.current.style.transform = `translate3d(${x1 - 4}px, ${y1 - 4}px, 0)`;
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onResize = () => {
      layout = null;
      onScroll();
    };

    const start = () => {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      ro = new ResizeObserver(onResize);
      ro.observe(stageRef.current);
      onResize();
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ro?.disconnect();
      ro = null;
    };
    const onPref = () => (reduce.matches ? stop() : start());

    if (!reduce.matches) start();
    reduce.addEventListener('change', onPref);
    return () => {
      stop();
      reduce.removeEventListener('change', onPref);
    };
  }, []);

  const active = step >= 1 && step <= N ? step - 1 : -1;
  // While a step is active, only the top of the remaining stack stays visible
  // (dimmed, "next up"): dimmed parts overlapping each other read as a smudge.
  const partClass = (i) => {
    if (active === -1) return '';
    if (i === active) return ' is-active';
    return i > active + 1 ? ' is-hidden' : ' is-dim';
  };
  const live =
    step === 0
      ? 'Assembled device.'
      : active >= 0
        ? `Step ${step} of ${N + 1}: ${STEPS[active].name}. ${STEPS[active].desc}`
        : `Step ${N + 1} of ${N + 1}: ${FINAL.desc}`;

  return (
    <section className="device" id="device" aria-label="Inside the DENTRA scanner, a research prototype">
      {/* Pinned, scroll-driven view */}
      <div className="device-track" ref={trackRef}>
        <div className="device-stage" ref={stageRef}>
          <div className="wrap device-grid">
            <div className="device-viewport" ref={viewportRef}>
              <div className="device-rig" ref={rigRef} style={{ transform: `translate3d(${-RIG_W / 2}px, 0, 0)` }}>
                {STEPS.map(({ id, name, z }, i) => (
                  <div
                    key={id}
                    ref={(el) => (partRefs.current[i] = el)}
                    className={`device-part${partClass(i)}`}
                    role="img"
                    aria-label={name}
                    style={{ zIndex: z, transform: `translate3d(0, ${i * LAYER - CY}px, 0)` }}
                  >
                    {art[i]}
                  </div>
                ))}
              </div>
            </div>

            <div className="device-panel">
              <p className="device-eyebrow">
                The device <span className="device-tag">Research prototype</span>
              </p>
              <div className="device-labels">
                <div className={`device-label${step === 0 ? ' on' : ''}`}>
                  <h2 className="device-title">See what&apos;s inside.</h2>
                  <p className="muted">Scroll to open up the DENTRA scanner, one part at a time.</p>
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

      {/* prefers-reduced-motion: no pinning, a static exploded diagram as a list */}
      <div className="device-static">
        <div className="wrap">
          <p className="device-eyebrow">
            The device <span className="device-tag">Research prototype</span>
          </p>
          <h2 className="device-title">See what&apos;s inside.</h2>
          <ol className="device-static-list">
            {STEPS.map(({ id, name, desc }, i) => (
              <li key={id}>
                <div className="device-static-art" aria-hidden="true">{staticArt[i]}</div>
                <div>
                  <p className="device-count"><b>{pad(i + 1)}</b> / {pad(N + 1)}</p>
                  <h3>{name}</h3>
                  <p className="muted">{desc}</p>
                </div>
              </li>
            ))}
            <li className="device-static-final">
              <div>
                <p className="device-count"><b>{pad(N + 1)}</b> / {pad(N + 1)}</p>
                <h3>{FINAL.name}</h3>
                <p className="muted">{FINAL.desc}</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
