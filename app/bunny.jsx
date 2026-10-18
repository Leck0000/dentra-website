'use client';

import { useEffect, useRef } from 'react';

export default function Bunny() {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (v && window.matchMedia('(prefers-reduced-motion: reduce)').matches) v.pause();
  }, []);

  return (
    <video ref={ref} className="bunny" src="/bunny.webm" autoPlay loop muted playsInline aria-hidden="true" />
  );
}
