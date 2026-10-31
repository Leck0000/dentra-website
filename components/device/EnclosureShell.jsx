import { C, CY, Halo, K, PART_H, RIG_W, Slab, roundRect, useSvgId } from './kit';

// 3D-printed housing, drawn as the top shell with the optical window at the tip.
export default function EnclosureShell() {
  const top = useSvgId('shell-top');
  const glass = useSvgId('shell-glass');
  const d = 100;
  const t = 22;
  const y = CY - (d * K) / 2;

  return (
    <svg viewBox={`0 0 ${RIG_W} ${PART_H}`} width={RIG_W} height={PART_H} aria-hidden="true">
      <defs>
        <linearGradient id={top} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F6FDFC" />
          <stop offset="1" stopColor="#D6F3EF" />
        </linearGradient>
        <radialGradient id={glass} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#2f5560" />
          <stop offset="1" stopColor={C.chip} />
        </radialGradient>
      </defs>
      <Halo cx={180} rx={170} />
      <Slab x={30} w={300} d={d} t={t} top={`url(#${top})`} side="#A6E0D9" edge="#9ED9D2" shape={roundRect(30, 300, d, 50)}>
        <rect x={40} y={8} width={280} height={84} rx={42} fill="none" stroke={C.g2} strokeOpacity="0.18" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        {/* Optical window */}
        <circle cx={82} cy={50} r={27} fill={C.navy} />
        <circle cx={82} cy={50} r={20} fill={`url(#${glass})`} />
        <circle cx={82} cy={50} r={27} fill="none" stroke={C.g2} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <path d="M68 40 A18 18 0 0 1 92 34" fill="none" stroke={C.g1} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" vectorEffect="non-scaling-stroke" />
        {/* Power button */}
        <rect x={196} y={42} width={30} height={16} rx={8} fill="#CDEFEA" stroke="#9ED9D2" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {/* Grip ridges */}
        {[258, 270, 282, 294].map((gx) => (
          <line key={gx} x1={gx} y1={30} x2={gx} y2={70} stroke={C.g2} strokeOpacity="0.28" strokeWidth="1.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        ))}
      </Slab>
      {/* USB-C charging port on the front edge */}
      <rect x={292} y={y + (d * K) / 2 + t / 2 - 3} width={18} height={6} rx={3} fill={C.navy} opacity="0.75" />
      {/* Top sheen */}
      <ellipse cx={170} cy={CY - 12} rx={92} ry={4} fill="#fff" opacity="0.55" />
    </svg>
  );
}
