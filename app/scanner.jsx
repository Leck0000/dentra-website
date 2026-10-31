'use client';

import { useEffect, useRef, useState } from 'react';
import Reveal from './reveal';
import useScrollProgress from './use-scroll-progress';

const specs = [
  ['Camera', 'Raspberry Pi Camera Module 3 NoIR'],
  ['Light', '850 nm near-infrared LEDs around the lens'],
  ['Computer', 'Raspberry Pi Zero 2 W'],
  ['Power', '18650 battery with USB charging, power switch and fuse'],
  ['Body', '3D-printed, with an optical window at the tip'],
  ['Hygiene', 'A disposable sleeve for every use'],
];

const labels = ['Camera module', 'NIR LEDs', 'Pi Zero 2 W', '18650 battery', 'Charging board'];

const steps = [
  {
    n: '01 · Outside',
    title: 'A camera made for your mouth.',
    body: 'The DENTRA scanner is a handheld near-infrared camera our team designed alongside the app, to capture clearer and more consistent photos of each tooth.',
  },
  {
    n: '02 · Camera',
    title: 'The eye of the scanner.',
    body: 'A Raspberry Pi Camera Module 3 NoIR sits at the tip, sensitive to near-infrared so it sees through enamel to reveal subsurface structure without visible glare.',
  },
  {
    n: '03 · NIR LEDs',
    title: 'Light that penetrates.',
    body: 'Eight 850 nm near-infrared LEDs ring the lens, flooding the tooth with light that passes through enamel but scatters in dentin — the same principle dentists use in transillumination.',
  },
  {
    n: '04 · Pi Zero 2 W',
    title: 'Brains in a tiny package.',
    body: 'The Raspberry Pi Zero 2 W runs the capture stack, handles Wi-Fi transfer to the phone, and manages power — all in a board smaller than a stick of gum.',
  },
  {
    n: '05 · Battery',
    title: 'Power for a full clinic day.',
    body: 'A single 18650 cell delivers enough capacity for hundreds of captures. USB-C charging with a hardware fuse and power switch keeps it safe and simple.',
  },
  {
    n: '06 · Inside view',
    title: 'Every part has a purpose.',
    body: 'From the charging board at the base to the camera module at the tip, the scanner packs a complete imaging system into a form factor that fits in one hand.',
  },
];

export default function Scanner() {
  const section = useRef(null);
  const canvas = useRef(null);
  const labelRefs = useRef([]);
  const api = useRef(null);
  const [ready, setReady] = useState(false);
  const progress = useScrollProgress(section);
  const step = Math.min(steps.length - 1, Math.floor(progress * steps.length));
  const s = steps[step];

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
    api.current?.setProgress(progress);
  }, [progress, ready]);

  return (
    <section className={`scanner-section${ready ? ' ready' : ''}`} id="scanner" ref={section}>
      <div className="wrap scanner">
        <div className="scanner-stage-wrapper">
          <Reveal className="scanner-stage">
            <div className="scanner-canvas" ref={canvas} role="img" aria-label={`3D model of the DENTRA scanner, ${progress > 0.5 ? 'opened to show the parts inside' : 'closed'}`} />
            {!ready && (
              <div className="scanner-wait">
                <div className="skeleton" />
              </div>
            )}
            <div className="inside-labels" aria-hidden="true">
              {labels.map((l, i) => (
                <div key={l} ref={(el) => (labelRefs.current[i] = el)} className={`callout tag${step === i + 1 ? ' on' : ''}`}>
                  <b>{i + 1}</b>
                  <em>{l}</em>
                </div>
              ))}
            </div>
            <p className="drag-hint">Drag to turn</p>
          </Reveal>
        </div>
        <div className="scanner-content">
          <Reveal delay={100}>
            <p className="eyebrow">DENTRA Scanner</p>
            <h2 className="h2">{s.title}</h2>
            <p className="muted sim-lead">{s.body}</p>
            <dl className="specs">
              {specs.map(([k, val]) => (
                <div key={k}><dt>{k}</dt><dd>{val}</dd></div>
              ))}
            </dl>
            <p className="note">A capstone research prototype, tested on model teeth. It takes photos; it doesn&apos;t diagnose.</p>
            <ol className="scanner-rail" aria-hidden="true">
              {steps.map((x, i) => (
                <li key={x.n}>
                  <span style={{ '--f': Math.min(1, Math.max(0, progress * steps.length - i)) }} />
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
