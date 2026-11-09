'use client';

import { useEffect, useState } from 'react';
import Icon from '../components/icon';
import Phone from '../components/phone';
import { HomeScreenBadge, PlayBadge } from '../components/store-badges';

const screens = [
  { name: 'clinics', icon: 'pin', title: 'Clinics nearby', sub: 'Nearest first', alt: 'DENTRA clinic finder showing nearby dental clinics on a map and in a list sorted by distance' },
  { name: 'treatments', icon: 'book', title: 'Treatment library', sub: 'Know what to expect', alt: 'DENTRA treatment library listing common treatments with category and time estimates' },
  { name: 'rabi', icon: 'chat', title: 'AI assistant', sub: 'Plain-language answers', alt: 'The DENTRA AI assistant, with suggested dental questions' },
  { name: 'scan', icon: 'camera', title: 'Guided capture', sub: 'Prototype, demo results', alt: 'DENTRA scan screen introducing the guided nine-photo capture steps (prototype)' },
];

export default function Hero() {
  const [active, setActive] = useState(0);
  const s = screens[active];

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % screens.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero" id="top">
      <div className="wrap hero-in">
        <div className="hero-text rise">
          <p className="eyebrow">Clinics, treatments and answers in one app</p>
          <h1>
            A smarter first step
            <br />
            <span className="grad">before your next dental visit.</span>
          </h1>
          <p className="lead">Find a dentist near you, learn what common treatments involve, and get answers in plain language.</p>
          <div className="hero-cta">
            <HomeScreenBadge />
            <PlayBadge />
          </div>
        </div>

        <div className="hero-visual rise" style={{ animationDelay: '140ms' }}>
          <div className="hero-glow" aria-hidden="true" />
          <Phone screens={screens} active={active} eager />
          <div className="toast" key={active} aria-hidden="true">
            <span className="icon-tile"><Icon name={s.icon} size={18} /></span>
            <div>
              {s.title}
              <span>{s.sub}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
