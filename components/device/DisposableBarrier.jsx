import { Halo, PART_H, RIG_W } from './kit';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Clear single-use sleeve over the wand's head, rendered from the 3D model
// (scripts/render-device.mjs) with the same camera as the housing.
export default function DisposableBarrier() {
  return (
    <svg viewBox={`0 0 ${RIG_W} ${PART_H}`} width={RIG_W} height={PART_H} aria-hidden="true">
      <Halo cx={84} rx={74} />
      <image href={`${base}/device/barrier.webp`} x="0" y="0" width={RIG_W} height={PART_H} />
    </svg>
  );
}
