import { C, CY, Halo, PART_H, RIG_W, useSvgId } from './kit';

// 18650 lithium-ion cell lying along the handle.
export default function Battery18650() {
  const wrap = useSvgId('cell-wrap');
  const x = 116;
  const len = 182;
  const r = 20;
  const top = CY - r;

  return (
    <svg viewBox={`0 0 ${RIG_W} ${PART_H}`} width={RIG_W} height={PART_H} aria-hidden="true">
      <defs>
        <linearGradient id={wrap} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7FE6DA" />
          <stop offset="0.35" stopColor={C.g1} />
          <stop offset="0.8" stopColor={C.g2} />
          <stop offset="1" stopColor={C.teal} />
        </linearGradient>
      </defs>
      <Halo cx={x + len / 2} rx={104} />
      {/* Body */}
      <rect x={x} y={top} width={len} height={r * 2} fill={`url(#${wrap})`} />
      <ellipse cx={x} cy={CY} rx={8} ry={r} fill={C.teal} />
      {/* Label band */}
      <rect x={x + 56} y={top} width={64} height={r * 2} fill={C.navy} opacity="0.88" />
      <text x={x + 88} y={CY + 4} textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="1.5" fill="#fff">18650</text>
      {/* Highlight */}
      <rect x={x + 4} y={top + 7} width={len - 8} height={3} rx={1.5} fill="#fff" opacity="0.45" />
      {/* Positive end cap and terminal */}
      <ellipse cx={x + len} cy={CY} rx={8} ry={r} fill={C.metal} />
      <ellipse cx={x + len + 2} cy={CY} rx={4} ry={8} fill={C.metalDark} />
      <ellipse cx={x + len + 3} cy={CY} rx={3} ry={6} fill={C.metal} />
    </svg>
  );
}
