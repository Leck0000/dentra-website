'use client';

import { useState } from 'react';
import Icon from '../components/icon';
import { HomeScreenBadge, PlayBadge } from '../components/store-badges';
import Reveal from './reveal';

const faqs = [
  ['Is DENTRA a diagnosis?', 'No. DENTRA gives general information and screening guidance to help you decide when to see a dentist. It does not diagnose any condition.'],
  ['Does it replace my dentist?', 'No. Think of it as a first step. Always see a licensed dentist for care.'],
  ['What is the DENTRA scanner?', 'A handheld camera our capstone team built as a research prototype. It has been tested on typodont (artificial teeth) models only, has not been clinically validated, and is not for sale.'],
  ['How do I get it?', 'On Android, DENTRA is coming soon to Google Play. On iPhone, open the DENTRA web app in Safari and add it to your Home Screen, as shown above.'],
  ['Are clinic prices and services real?', 'Clinic locations come from real map data. Service lists in the app are estimates, so confirm details with the clinic directly.'],
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
          <p className="muted">Screen at home, understand your options and find a dentist nearby.</p>
          <div className="cta-row">
            <HomeScreenBadge />
            <PlayBadge />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
