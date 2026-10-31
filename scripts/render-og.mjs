// Renders public/og.png (1200 x 630 social share image) from HTML.
//   npm i --no-save playwright-core@1.48.2   (or set DEPS_DIR), then: node scripts/render-og.mjs
// Copy must follow DENTRA_app_context.md section 4: no scan/AI-screening claims.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(process.env.DEPS_DIR ? path.join(process.env.DEPS_DIR, 'x.js') : import.meta.url);
const { chromium } = req('playwright-core');
const EDGE = process.env.BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const data = (rel, type) => `data:${type};base64,${fs.readFileSync(path.join(root, rel)).toString('base64')}`;
const mark = data('public/brand-mark.png', 'image/png');
const screen = data('public/screens/2x/clinics.webp', 'image/webp');

const html = /* html */ `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;800&display=block" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; font-family: Outfit, sans-serif;
    background: linear-gradient(135deg, #5DE0D0, #2CA6A4); color: #fff; position: relative; }
  .glow { position: absolute; right: -120px; top: -160px; width: 760px; height: 760px; border-radius: 50%;
    background: radial-gradient(closest-side, rgba(255,255,255,0.28), transparent); }
  .copy { position: absolute; left: 80px; top: 92px; width: 600px; }
  .brand { display: flex; align-items: center; gap: 16px; font-size: 30px; font-weight: 800; letter-spacing: 0.1em; }
  .brand img { width: 60px; height: 60px; border-radius: 16px; box-shadow: 0 0 0 3px rgba(255,255,255,0.55); }
  h1 { margin-top: 48px; font-size: 66px; line-height: 1.02; font-weight: 800; letter-spacing: -0.035em; }
  p { margin-top: 26px; font-size: 26px; line-height: 1.4; font-weight: 500; color: rgba(255,255,255,0.9); }
  .phone { position: absolute; right: 96px; top: 64px; width: 300px; height: 612px; padding: 12px;
    border-radius: 50px; background: #1b272b; box-shadow: 0 40px 90px rgba(10,40,45,0.35); }
  .phone div { width: 100%; height: 100%; border-radius: 40px; overflow: hidden; background: #fff; }
  .phone img { width: 100%; display: block; }
  .notch { position: absolute; top: 24px; left: 50%; transform: translateX(-50%); width: 92px; height: 26px;
    border-radius: 14px; background: #000; }
</style></head><body>
  <div class="glow"></div>
  <div class="copy">
    <div class="brand"><img src="${mark}" alt="">DENTRA</div>
    <h1>A smarter first step before your next dental visit.</h1>
    <p>Find a dentist near you. Learn what treatments involve. Get answers in plain language.</p>
  </div>
  <div class="phone"><div><img src="${screen}" alt=""></div><span class="notch"></span></div>
</body></html>`;

const browser = await chromium.launch({ executablePath: EDGE });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const out = path.join(root, 'public/og.png');
await page.screenshot({ path: out });
await browser.close();
console.log(`public/og.png  ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
