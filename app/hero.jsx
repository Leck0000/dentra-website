'use client';

import { useEffect, useState } from 'react';
import Icon from '../components/icon';
import Phone from '../components/phone';
import { HomeScreenBadge, PlayBadge } from '../components/store-badges';

const screens = [
  { name: 'clinics', icon: 'pin', title: 'Clinics nearby', sub: 'Nearest first', alt: 'Clinics Nearby screen listing dental clinics sorted by distance' },
  { name: 'treatments', icon: 'book', title: 'Treatment library', sub: 'Know what to expect', alt: 'Treatments screen with search and category chips' },
  { name: 'rabi', icon: 'chat', title: 'Ask Rabi', sub: 'Plain-language answers', alt: 'Rabi, the DENTRA assistant, with suggested dental questions' },
  { name: 'scan', icon: 'camera', title: 'Guided scan', sub: 'Five views, one at a time', alt: 'Dental Scan screen with five mouth regions to capture' },
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
          <p className="eyebrow">Dental screening, made simple</p>
          <h1>
            A smarter first step
            <br />
            <span className="grad">for your smile.</span>
          </h1>
          <p className="lead">Screen at home. Understand your options. Find a dentist nearby.</p>
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
