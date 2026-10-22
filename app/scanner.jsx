'use client';

import { useEffect, useRef, useState } from 'react';
import Reveal from './reveal';

const specs = [
  ['Camera', 'Raspberry Pi Camera Module 3 NoIR'],
  ['Light', '850 nm near-infrared LEDs around the lens'],
  ['Computer', 'Raspberry Pi Zero 2 W'],
  ['Power', '18650 battery with USB charging, power switch and fuse'],
  ['Body', '3D-printed, with an optical window at the tip'],
  ['Hygiene', 'A disposable sleeve for every use'],
];

const labels = ['Camera module', 'NIR LEDs', 'Pi Zero 2 W', '18650 battery', 'Charging board'];

export default function Scanner() {
  const canvas = useRef(null);
  const labelRefs = useRef([]);
  const api = useRef(null);
  const [ready, setReady] = useState(false);
  const [inside, setInside] = useState(false);

  useEffect(() => {
    let inst;
    let cancelled = false;
    import('./three/scanner').then(({ mountScanner }) => {
      if (cancelled || !canvas.current) return;
      try {
        inst = mountScanner(canvas.current, { labels: labelRefs.current, onReady: () => setReady(true) });
      } catch {
        return;
      }
      api.current = inst;
    });
    return () => {
      cancelled = true;
      api.current = null;
      inst?.dispose();
    };
  }, []);

  useEffect(() => {
    api.current?.setOpen(inside);
  }, [inside, ready]);

  return (
    <section className="section" id="scanner">
      <div className="wrap scanner">
        <Reveal className={`scanner-stage${ready ? ' ready' : ''}`}>
          <div className="scanner-canvas" ref={canvas} role="img" aria-label={`3D model of the DENTRA scanner, ${inside ? 'opened to show the parts inside' : 'closed'}`} />
          <div className="inside-labels" aria-hidden="true">
            {labels.map((l, i) => (
              <div key={l} ref={(el) => (labelRefs.current[i] = el)} className="callout tag">
                <b>{i + 1}</b>
                <em>{l}</em>
              </div>
            ))}
          </div>
          <p className="drag-hint">Drag to turn</p>
        </Reveal>
        <Reveal delay={100}>
          <p className="eyebrow">DENTRA Scanner</p>
          <h2 className="h2">A camera made for your mouth.</h2>
          <p className="muted sim-lead">
            A handheld near-infrared camera our team designed alongside the app, to capture clearer and more consistent photos of each tooth.
          </p>
          <div className="seg" role="group" aria-label="Scanner view">
            {['Outside', 'Inside'].map((v) => (
              <button key={v} className={(v === 'Inside') === inside ? 'on' : ''} aria-pressed={(v === 'Inside') === inside} onClick={() => setInside(v === 'Inside')}>
                {v}
              </button>
            ))}
          </div>
          <dl className="specs">
            {specs.map(([k, val]) => (
              <div key={k}><dt>{k}</dt><dd>{val}</dd></div>
            ))}
          </dl>
          <p className="note">A capstone research prototype, tested on model teeth. It takes photos; it doesn’t diagnose.</p>
        </Reveal>
      </div>
    </section>
  );
}
