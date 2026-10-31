import { C, Halo, PART_H, RIG_W } from './kit';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

// The housing: a render of the 3D wand model (scripts/render-device.mjs), drawn
// from the same oblique camera as the SVG parts. Optical window at the tip.
// It is a styled concept, not the real 3D-printed prototype, so it carries a
// visible "Concept render" label.
export default function EnclosureShell() {
  return (
    <svg viewBox={`0 0 ${RIG_W} ${PART_H}`} width={RIG_W} height={PART_H} aria-hidden="true">
      <Halo cx={180} rx={168} />
      <image href={`${base}/device/shell.webp`} x="0" y="0" width={RIG_W} height={PART_H} />
      <g transform="translate(244 63)">
        <rect width="86" height="17" rx="8.5" fill="#fff" stroke={C.mint2} strokeWidth="0.8" />
        <text x="43" y="11.8" textAnchor="middle" fontSize="10" fontWeight="600" fill={C.teal} fontFamily="inherit">
          Concept render
        </text>
      </g>
    </svg>
  );
}
