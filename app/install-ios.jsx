'use client';

import { useEffect, useState } from 'react';
import Reveal from './reveal';

// Set to the DENTRA web app's address to show an "Open the web app" button.
const WEB_APP_URL = null;

const steps = [
  { title: 'Open DENTRA in Safari', body: 'Go to the DENTRA web app in Safari on your iPhone.' },
  { title: 'Tap Share', body: 'Tap the Share button, the square with an arrow. On newer iOS versions, tap ••• first, then Share.' },
  { title: 'Tap Add to Home Screen', body: 'Scroll down the list and tap Add to Home Screen.' },
  { title: 'Tap Add', body: 'Keep the name DENTRA. If you see Open as Web App, leave it on. Then tap Add.' },
  { title: 'Open it like an app', body: 'DENTRA now has its own icon on your Home Screen. Tap it and it opens full screen, without the browser bars.' },
];

const Svg = ({ children, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const ShareIcon = ({ size }) => <Svg size={size}><path d="M12 3v12M8 7l4-4 4 4M6 11v9h12v-9" /></Svg>;
const Tooth = ({ size = 18 }) => (
  <Svg size={size}>
    <path d="M7 3C4.5 3 3 5 3 7.5c0 3 1.5 4.5 2 7.5s1 6 2.5 6 1.5-4 2.5-6 1-2 2-2 1 0 2 2 1 6 2.5 6 2-3 2.5-6 2-4.5 2-7.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z" />
  </Svg>
);

function Demo({ step }) {
  return (
    <div className="phone ios-demo" aria-hidden="true">
      <div className="phone-notch" />
      <div className="phone-screen ios-screen">
        <div className={`ios-page${step === 4 ? ' gone' : ''}`}>
          <div className="ios-app">
            <span className="brand-mark ios-mark"><Tooth size={26} /></span>
            <b>DENTRA</b>
            <i /><i /><i className="short" />
          </div>
          <div className="ios-bar">
            <span className={`ios-url${step === 0 ? ' hl' : ''}`}>DENTRA web app</span>
            <div className="ios-tools">
              <Svg><path d="M15 6l-6 6 6 6" /></Svg>
              <Svg><path d="M9 6l6 6-6 6" /></Svg>
              <span className={`ios-share${step === 1 ? ' hl' : ''}`}><ShareIcon /></span>
              <Svg><path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" /></Svg>
              <Svg><rect x="4" y="4" width="12" height="12" rx="2" /><path d="M8 20h12V8" /></Svg>
            </div>
          </div>
        </div>

        <div className={`ios-sheet${step === 2 ? ' on' : ''}`}>
          <span className="ios-grab" />
          <div className="ios-row">Copy</div>
          <div className="ios-row">Add to Reading List</div>
          <div className="ios-row">Add Bookmark</div>
          <div className="ios-row hl">Add to Home Screen <b>+</b></div>
          <div className="ios-row">Find on Page</div>
        </div>

        <div className={`ios-add${step === 3 ? ' on' : ''}`}>
          <div className="ios-add-head">
            <span>Cancel</span>
            <b>Add to Home Screen</b>
            <span className="hl">Add</span>
          </div>
          <div className="ios-add-card">
            <span className="brand-mark"><Tooth /></span>
            <div>
              <b>DENTRA</b>
              <small>DENTRA web app</small>
            </div>
          </div>
          <div className="ios-add-card ios-toggle">
            Open as Web App <span className="ios-switch" />
          </div>
        </div>

        <div className={`ios-home${step === 4 ? ' on' : ''}`}>
          {Array.from({ length: 15 }, (_, i) =>
            i === 9 ? (
              <span key={i} className="ios-icon dentra">
                <span className="brand-mark"><Tooth size={20} /></span>
                <small>DENTRA</small>
              </span>
            ) : (
              <span key={i} className="ios-icon"><span /></span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function InstallIOS() {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setStep((s) => (s + 1) % steps.length), 3200);
    return () => clearInterval(id);
  }, [auto]);

  return (
    <section className="section tint" id="install">
      <div className="wrap install">
        <Reveal>
          <p className="eyebrow">On iPhone</p>
          <h2 className="h2">Add DENTRA to your Home Screen.</h2>
          <p className="muted sim-lead">iPhone users get DENTRA as a web app. Add it once and it opens from its own icon, like any other app.</p>
          <ol className="steps">
            {steps.map((s, i) => (
              <li key={s.title}>
                <button
                  className={i === step ? 'on' : ''}
                  aria-pressed={i === step}
                  onClick={() => {
                    setAuto(false);
                    setStep(i);
                  }}
                >
                  <span className="step-n">{i + 1}</span>
                  <span>
                    <b>{s.title}</b>
                    <span className="muted">{s.body}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {WEB_APP_URL && (
            <a href={WEB_APP_URL} className="btn install-open">Open the web app</a>
          )}
        </Reveal>
        <Reveal delay={120} className="install-visual">
          <div className="ring" />
          <Demo step={step} />
        </Reveal>
      </div>
    </section>
  );
}
