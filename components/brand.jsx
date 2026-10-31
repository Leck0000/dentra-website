const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

// The DENTRA "D" app-icon tile (same art as the favicon and the web app's
// Home Screen icon). Decorative: callers put the name next to it.
export function BrandMark({ className = '' }) {
  return <img src={`${base}/brand-mark.png`} alt="" width="32" height="32" className={`brand-logo ${className}`} />;
}

export default function Brand() {
  return (
    <a href="#top" className="brand">
      <BrandMark />
      DENTRA
    </a>
  );
}
