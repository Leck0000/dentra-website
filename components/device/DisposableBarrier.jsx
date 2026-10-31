import { C, Halo, PART_H, RIG_W, Slab } from './kit';

// Thin, clear single-use cover that slips over the tip of the housing.
export default function DisposableBarrier() {
  const d = 112;
  const r = 56;
  const shape = (props) => <path d={`M${18 + r} 0 H162 V${d} H${18 + r} A${r} ${r} 0 0 1 ${18 + r} 0 Z`} {...props} />;

  return (
    <svg viewBox={`0 0 ${RIG_W} ${PART_H}`} width={RIG_W} height={PART_H} aria-hidden="true">
      <Halo cx={92} rx={86} />
      <Slab x={18} w={144} d={d} t={6} top="rgba(255, 255, 255, 0.55)" side="rgba(178, 237, 231, 0.6)" edge={C.g2} shape={shape}>
        {/* Open end of the sleeve */}
        <line x1={162} y1={4} x2={162} y2={d - 4} stroke={C.g2} strokeWidth="1.4" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        {/* Window area and film creases */}
        <circle cx={82} cy={56} r={31} fill="rgba(255, 255, 255, 0.35)" stroke={C.g1} strokeOpacity="0.7" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        <path d="M120 16 Q132 56 120 96 M138 12 Q148 56 138 100" fill="none" stroke={C.g2} strokeOpacity="0.25" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </Slab>
    </svg>
  );
}
