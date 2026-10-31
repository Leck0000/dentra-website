import { C, Chip, Halo, PART_H, RIG_W, Slab, roundRect } from './kit';

// 850 nm near-infrared LED ring around the lens, with resistors and a small
// tab carrying the MOSFET drivers.
const RING = { cx: 82, cz: 50, outer: 36, inner: 15 };
const LEDS = [45, 135, 225, 315].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return [RING.cx + Math.cos(a) * 26, RING.cz + Math.sin(a) * 26];
});
const RESISTORS = [0, 90, 180, 270].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return [RING.cx + Math.cos(a) * 26, RING.cz + Math.sin(a) * 26, deg % 180 === 0 ? 90 : 0];
});

export default function NIRLEDs() {
  const { cx, cz, outer, inner } = RING;
  const ring = (props) => (
    <path
      fillRule="evenodd"
      d={`M${cx - outer} ${cz} a${outer} ${outer} 0 1 0 ${outer * 2} 0 a${outer} ${outer} 0 1 0 ${-outer * 2} 0 Z M${cx - inner} ${cz} a${inner} ${inner} 0 1 0 ${inner * 2} 0 a${inner} ${inner} 0 1 0 ${-inner * 2} 0 Z`}
      {...props}
    />
  );

  return (
    <svg viewBox={`0 0 ${RIG_W} ${PART_H}`} width={RIG_W} height={PART_H} aria-hidden="true">
      <Halo cx={104} rx={78} />
      {/* Driver tab with the MOSFETs */}
      <Slab x={108} w={50} d={30} t={3} top={C.board} side={C.boardSide} shape={roundRect(108, 50, 30, 4)}>
        <Chip x={124} z={6} w={10} d={8} />
        <Chip x={140} z={6} w={10} d={8} />
        <rect x={124} y={19} width={26} height={5} rx={1} fill={C.mint2} opacity="0.5" />
      </Slab>
      <Slab x={cx - outer} w={outer * 2} d={outer * 2} t={4} top={C.board} side={C.boardSide} shape={ring}>
        {RESISTORS.map(([rx, rz, rot]) => (
          <g key={`${rx}-${rz}`} transform={`rotate(${rot} ${rx} ${rz})`}>
            <rect x={rx - 4} y={rz - 1.8} width={8} height={3.6} rx={0.8} fill={C.metalDark} />
            <rect x={rx - 1.6} y={rz - 1.8} width={3.2} height={3.6} fill={C.chip} />
          </g>
        ))}
        {LEDS.map(([lx, lz]) => (
          <g key={`${lx}-${lz}`}>
            <circle cx={lx} cy={lz} r={9} fill={C.g1} opacity="0.22" />
            <circle cx={lx} cy={lz} r={5.5} fill={C.mint} />
            <circle cx={lx} cy={lz} r={3} fill={C.g1} />
          </g>
        ))}
      </Slab>
    </svg>
  );
}
