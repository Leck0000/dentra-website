'use client';

import { useEffect, useRef, useState } from 'react';

// A WebGL phone wearing the real screenshots. The flat phone stays as the
// placeholder until the first screen is on the 3D model, and as the fallback without WebGL.
export default function Phone3D({ srcs, active = 0, label, children }) {
  const ref = useRef(null);
  const api = useRef(null);
  const activeRef = useRef(active);
  const [ready, setReady] = useState(false);
  activeRef.current = active;

  useEffect(() => {
    let inst;
    let cancelled = false;
    import('./three/phone').then(({ mountPhone }) => {
      if (cancelled || !ref.current) return;
      try {
        inst = mountPhone(ref.current, { srcs, onReady: () => setReady(true) });
      } catch {
        return;
      }
      api.current = inst;
      inst.setScreen(activeRef.current);
    });
    return () => {
      cancelled = true;
      api.current = null;
      inst?.dispose();
    };
  }, [srcs]);

  useEffect(() => {
    api.current?.setScreen(active);
  }, [active]);

  return (
    <div className={`stage3d${ready ? ' ready' : ''}`}>
      <div className="stage3d-fallback">{children}</div>
      <div className="stage3d-canvas" ref={ref} role="img" aria-label={label} />
    </div>
  );
}
