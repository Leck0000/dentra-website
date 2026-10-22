// Builds sharper 2x copies of the app screenshots for retina screens and 3D textures.
// Usage: node scripts/enhance-screens.mjs
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const src = path.resolve('public/screens');
const out = path.join(src, '2x');
await mkdir(out, { recursive: true });

for (const file of await readdir(src)) {
  if (!file.endsWith('.webp')) continue;
  const input = sharp(path.join(src, file));
  const { width, height } = await input.metadata();
  await input
    .resize(width * 2, height * 2, { kernel: 'lanczos3' })
    .sharpen({ sigma: 0.9, m1: 0.6, m2: 2.2 })
    .modulate({ saturation: 1.04 })
    .webp({ quality: 90, effort: 6, smartSubsample: true })
    .toFile(path.join(out, file));
  console.log(`2x/${file}  ${width * 2}x${height * 2}`);
}
