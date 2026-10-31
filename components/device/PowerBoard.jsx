import { C, Chip, Halo, PART_H, RIG_W, Slab, roundRect } from './kit';

// Power board: TP4056 charger, 5 V boost converter, slide switch and fuse.
export default function PowerBoard() {
  const x = 206;
  const w = 96;
  const d = 72;

  return (
    <svg viewBox={`0 0 ${RIG_W} ${PART_H}`} width={RIG_W} height={PART_H} aria-hidden="true">
      <Halo cx={x + w / 2} rx={66} />
      {/* USB-C receptacle sticking out of the right edge */}
      <Slab x={x + w - 8} w={18} d={18} t={6} top={C.metal} side={C.metalDark} shape={roundRect(x + w - 8, 18, 18, 3)} />
      <Slab x={x} w={w} d={d} t={4} top={C.board} side={C.boardSide} shape={roundRect(x, w, d, 6)}>
        {/* Battery pads */}
        <rect x={x + 4} y={10} width={10} height={14} rx={1.5} fill={C.mint2} opacity="0.8" />
        <rect x={x + 4} y={48} width={10} height={14} rx={1.5} fill={C.mint2} opacity="0.8" />
        {/* TP4056 (SOP-8) */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={x + 22 + i * 5} y={8} width={2.4} height={4} fill={C.metalDark} />
            <rect x={x + 22 + i * 5} y={30} width={2.4} height={4} fill={C.metalDark} />
          </g>
        ))}
        <Chip x={x + 20} z={11} w={22} d={20} />
        {/* Fuse */}
        <rect x={x + 50} y={12} width={16} height={8} rx={1.5} fill={C.mint} />
        <rect x={x + 50} y={12} width={3} height={8} fill={C.metalDark} />
        <rect x={x + 63} y={12} width={3} height={8} fill={C.metalDark} />
        {/* Boost converter: inductor and IC */}
        <rect x={x + 50} y={36} width={24} height={24} rx={4} fill="#4f5f64" />
        <circle cx={x + 62} cy={48} r={7} fill="#6B7B80" />
        <Chip x={x + 78} z={40} w={9} d={12} />
        {/* Slide switch */}
        <rect x={x + 20} y={46} width={22} height={14} rx={2} fill={C.metal} />
        <rect x={x + 23} y={49} width={8} height={8} rx={1.5} fill={C.navy} />
        {/* Status LEDs */}
        <circle cx={x + 80} cy={14} r={2.6} fill={C.g1} />
        <circle cx={x + 88} cy={14} r={2.6} fill={C.coral} />
      </Slab>
    </svg>
  );
}
