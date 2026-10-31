import { C, Chip, Halo, PART_H, RIG_W, Slab, roundRect } from './kit';

// Raspberry Pi Zero 2 W, drawn in the brand palette rather than board green.
export default function RaspberryPiZero() {
  const x = 120;
  const w = 182;
  const d = 84;
  const header = Array.from({ length: 20 }, (_, i) => x + 26 + i * 6.6);

  return (
    <svg viewBox={`0 0 ${RIG_W} ${PART_H}`} width={RIG_W} height={PART_H} aria-hidden="true">
      <Halo cx={x + w / 2} rx={104} />
      <Slab x={x} w={w} d={d} t={5} top={C.board} side={C.boardSide} shape={roundRect(x, w, d, 7)}>
        {/* Mounting holes */}
        {[[x + 8, 8], [x + w - 8, 8], [x + 8, d - 8], [x + w - 8, d - 8]].map(([hx, hz]) => (
          <circle key={`${hx}-${hz}`} cx={hx} cy={hz} r={4.2} fill={C.chip} stroke={C.mint2} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        ))}
        {/* 40-pin header pads */}
        {header.map((hx) => (
          <g key={hx}>
            <circle cx={hx} cy={8} r={1.9} fill={C.mint2} opacity="0.85" />
            <circle cx={hx} cy={16} r={1.9} fill={C.mint2} opacity="0.85" />
          </g>
        ))}
        {/* Traces */}
        <path d={`M${x + 14} 46 H${x + 60} L${x + 72} 40 H${x + 86} M${x + 14} 56 H${x + 64} L${x + 74} 62 H${x + 86}`} fill="none" stroke={C.mint2} strokeOpacity="0.22" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {/* Camera connector at the left edge */}
        <rect x={x} y={30} width={10} height={26} rx={1} fill="#2B4A52" />
        <rect x={x + 2} y={33} width={3} height={20} fill={C.mint2} opacity="0.5" />
        {/* System-in-package and wireless shield */}
        <Chip x={x + 70} z={30} w={34} d={34} />
        <rect x={x + 114} y={32} width={30} height={28} rx={2} fill={C.metal} />
        <rect x={x + 116} y={34} width={26} height={5} rx={1} fill="#fff" opacity="0.4" />
        {/* microSD slot */}
        <rect x={x + w - 14} y={30} width={14} height={24} rx={1.5} fill={C.metalDark} />
        {/* Ports on the front edge */}
        {[x + 30, x + 120, x + 146].map((px, i) => (
          <rect key={px} x={px} y={d - 10} width={i === 0 ? 22 : 16} height={10} rx={1.5} fill={C.metal} />
        ))}
      </Slab>
    </svg>
  );
}
