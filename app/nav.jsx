'use client';

import { useEffect, useState } from 'react';
import Brand from '../components/brand';
import { PlayBadge } from '../components/store-badges';

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
        <Brand />
        <nav className="nav-links" aria-label="Primary">
          <a href="#device">The device</a>
          <a href="#how">How it works</a>
          <a href="#clinics">Find a dentist</a>
          <a href="#treatments">Treatments</a>
          <a href="#install">iPhone</a>
          <a href="#faq">FAQ</a>
        </nav>
        <PlayBadge small />
      </div>
    </header>
  );
}
