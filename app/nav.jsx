'use client';

import { useEffect, useState } from 'react';
import Icon from '../components/icon';
import PlayButton from '../components/play-button';

export default function Nav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav${solid ? ' solid' : ''}`}>
      <div className="wrap nav-in">
        <a href="#top" className="brand">
          <span className="brand-mark"><Icon name="tooth" size={18} /></span>
          DENTRA
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#device">The device</a>
          <a href="#how">How it works</a>
          <a href="#clinics">Find a dentist</a>
          <a href="#treatments">Treatments</a>
          <a href="#install">iPhone</a>
          <a href="#faq">FAQ</a>
        </nav>
        <PlayButton small />
      </div>
    </header>
  );
}
