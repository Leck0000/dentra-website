import { C, Chip, Halo, PART_H, RIG_W, Slab, roundRect, useSvgId } from './kit';

// Raspberry Pi Camera Module 3 NoIR: small board, lens, and ribbon cable.
export default function CameraModule() {
  const lens = useSvgId('cam-lens');
  const d = 64;

  return (
    <svg viewBox={`0 0 ${RIG_W} ${PART_H}`} width={RIG_W} height={PART_H} aria-hidden="true">
      <defs>
        <radialGradient id={lens} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#3d6f78" />
          <stop offset="0.55" stopColor="#14262c" />
          <stop offset="1" stopColor="#05090b" />
        </radialGradient>
      </defs>
      <Halo cx={110} rx={80} />
      {/* Ribbon cable */}
      <Slab x={108} w={74} d={22} t={1.5} top={C.mint2} side="#8fd3cb" shape={roundRect(108, 74, 22, 2)}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={112} y1={5 + i * 4} x2={178} y2={5 + i * 4} stroke={C.g2} strokeOpacity="0.3" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        ))}
      </Slab>
      <Slab x={50} w={64} d={d} t={5} top={C.board} side={C.boardSide} shape={roundRect(50, 64, d, 6)}>
        {[[56, 6], [108, 6], [56, 58], [108, 58]].map(([hx, hz]) => (
          <circle key={`${hx}-${hz}`} cx={hx} cy={hz} r={3.2} fill={C.chip} stroke={C.mint2} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <Chip x={64} z={14} w={36} d={36} />
        <circle cx={82} cy={32} r={13} fill={`url(#${lens})`} stroke="#2a3d43" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <circle cx={78} cy={27} r={3} fill="#fff" opacity="0.45" />
        <rect x={104} y={22} width={8} height={20} rx={1} fill="#2B4A52" />
      </Slab>
    </svg>
  );
}
