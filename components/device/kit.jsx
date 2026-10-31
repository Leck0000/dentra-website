import { useId } from 'react';

// Shared drawing helpers for the device parts.
//
// Every part is drawn in the same 360 x PART_H box, in an oblique view: the
// footprint (x across, z into the screen) is squashed vertically by K, and
// thickness hangs below it. All parts put their footprint centre on y = CY, so
// the exploded view only has to move them up and down.

export const RIG_W = 360;
export const PART_H = 92;
export const CY = 36;
export const K = 0.45;

export const C = {
  mint: '#E8F8F7',
  mint2: '#B2EDE7',
  g1: '#4DD8C8',
  g2: '#2CA6A4',
  teal: '#1f7f7d',
  navy: '#1A2E35',
  board: '#1E3F47',
  boardSide: '#132a30',
  chip: '#0F1E23',
  metal: '#C9D3D2',
  metalDark: '#9AA8A7',
  coral: '#F4A261',
};

// SVG ids must be unique per instance (the part can render twice: pinned and
// reduced-motion views), and React's ids contain characters url(#...) dislikes.
export function useSvgId(name) {
  return `${name}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

// A flat slab seen from above-front. `shape` draws the footprint outline in
// footprint space (x, z with z from 0 to d); Slab draws it twice (bottom and
// top face) plus the band between them. Children are drawn on the top face, in
// footprint space.
export function Slab({ x, w, d, t, top, side, edge = 'none', shape, children }) {
  const y = CY - (d * K) / 2;
  const outline = (props) =>
    shape ? shape(props) : <rect x={x} y={0} width={w} height={d} rx={Math.min(d / 2, 999)} {...props} />;
  return (
    <g>
      <g transform={`translate(0 ${y + t}) scale(1 ${K})`}>{outline({ fill: side })}</g>
      <rect x={x} y={y + (d * K) / 2} width={w} height={t} fill={side} />
      <g transform={`translate(0 ${y}) scale(1 ${K})`}>
        {outline({ fill: top, stroke: edge, strokeWidth: 1.4, vectorEffect: 'non-scaling-stroke' })}
        {children}
      </g>
    </g>
  );
}

// Rounded-rectangle footprint helper for Slab's `shape` prop.
export const roundRect = (x, w, d, r) => (props) => <rect x={x} y={0} width={w} height={d} rx={r} {...props} />;

// Soft teal glow under the active part. CSS fades it in via .is-active.
export function Halo({ cx, rx }) {
  return <ellipse className="device-halo" cx={cx} cy={CY + 8} rx={rx} ry={rx * 0.32} fill="rgba(77, 216, 200, 0.28)" />;
}

// A small IC package with a highlight, in footprint space.
export function Chip({ x, z, w, d, fill = C.chip }) {
  return (
    <g>
      <rect x={x} y={z} width={w} height={d} rx={2} fill={fill} />
      <rect x={x + 2} y={z + 2} width={w - 4} height={Math.max(2, d * 0.18)} rx={1} fill="#ffffff" opacity="0.08" />
    </g>
  );
}
