'use client';

import { useEffect, useRef, useState } from 'react';
import useScrollProgress from './use-scroll-progress';

const steps = [
  { n: 'Tooth anatomy', title: 'Know your teeth.', body: 'Every tooth is built in layers. Keep scrolling to take one apart, or drag it to turn it around.' },
  { n: '01 · Enamel', title: 'The hard outer shell.', body: 'Enamel covers the crown and is the hardest substance in your body. It does not grow back, so daily brushing and fluoride help protect it.' },
  { n: '02 · Dentin', title: 'The layer underneath.', body: 'Dentin is softer and slightly yellow. When enamel wears thin, dentin can make a tooth feel sensitive to hot or cold.' },
  { n: '03 · Pulp', title: 'The living center.', body: 'The pulp holds the nerves and blood vessels. Decay that reaches it may need treatment such as a root canal. A dentist can tell you.' },
  { n: '04 · Gums and root', title: 'What holds it in place.', body: 'Gums seal around the tooth while the root anchors it in the jaw. Gentle brushing along the gumline and flossing help keep them healthy.' },
];

const labels = ['Enamel', 'Dentin', 'Pulp', 'Gums'];

export default function ToothAnatomy() {
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
    import('./three/tooth').then(({ mountTooth }) => {
      if (cancelled || !canvas.current) return;
      try {
        inst = mountTooth(canvas.current, { labels: labelRefs.current, onReady: () => setReady(true) });
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
    <section className={`inside${ready ? ' ready' : ''}`} id="anatomy" ref={section}>
      <div className="inside-sticky">
        <div className="inside-grid" />
        <div className="inside-canvas" ref={canvas} role="img" aria-label="3D model of a molar cut open to show enamel, dentin, pulp and gums" />
        {!ready && (
          <div className="inside-wait">
            <div className="skeleton" />
          </div>
        )}
        <div className="inside-labels" aria-hidden="true">
          {labels.map((l, i) => (
            <div key={l} ref={(el) => (labelRefs.current[i] = el)} className={`callout${step === i + 1 ? ' on' : ''}`}>
              <b>{i + 1}</b>
              <em>{l}</em>
            </div>
          ))}
        </div>
        <div className="wrap inside-ui">
          <div className="card inside-card fade-up" key={step}>
            <span className="inside-n">{s.n}</span>
            <h2>{s.title}</h2>
            <p className="muted">{s.body}</p>
          </div>
          <ol className="rail" aria-hidden="true">
            {steps.map((x, i) => (
              <li key={x.n}>
                <span style={{ '--f': Math.min(1, Math.max(0, progress * steps.length - i)) }} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
