'use client';

import { useState } from 'react';
import Icon from '../components/icon';
import { HomeScreenBadge, PlayBadge } from '../components/store-badges';
import Reveal from './reveal';

const faqs = [
  ['Is DENTRA a diagnosis?', 'No. DENTRA gives general information and screening guidance to help you decide when to see a dentist. It does not diagnose any condition.'],
  ['Does it replace my dentist?', 'No. Think of it as a first step. Always see a licensed dentist for care.'],
  ['What is the DENTRA camera?', 'A small handheld camera for taking photos inside the mouth, built by our capstone team as a prototype. It has only been tested on typodonts (practice models of teeth). It has not been proven for real dental care, and it does not detect or diagnose anything.'],
  ['How do I get it?', 'On Android, DENTRA is coming soon to Google Play. The DENTRA web app works now in any browser. On iPhone, open it in Safari and add it to your Home Screen, as shown above.'],
  ['Are clinic prices and services real?', 'Clinic locations come from real map data. Prices and service lists in the app are estimates, not confirmed by the clinics, so check details with the clinic directly.'],
];

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section" id="faq">
      <div className="wrap faq-wrap">
        <Reveal className="head center">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2">Good questions.</h2>
        </Reveal>
        <div className="faq">
          {faqs.map(([q, a], i) => (
            <div key={q} className={`faq-item${open === i ? ' open' : ''}`}>
              <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                {q}
                <Icon name="plus" size={18} />
              </button>
              <div className="faq-body" inert={open !== i}>
                <p className="muted">{a}</p>
              </div>
            </div>
          ))}
        </div>

        <Reveal className="card cta-final">
          <h2>Get DENTRA on your phone.</h2>
          <p className="muted">Find a dentist near you, understand your options, and get answers in plain language.</p>
          <div className="cta-row">
            <HomeScreenBadge />
            <PlayBadge />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
