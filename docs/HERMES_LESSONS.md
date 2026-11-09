# HERMES_LESSONS: read this before touching dentra-website

## 1. What this is
- Promo site for DENTRA, a dental screening app (Android "coming soon" on Google Play; iPhone via web app). Capstone project.
- Read-only: it only promotes. No accounts, no forms, no free-text inputs.
- Next.js 15 App Router, `output: 'export'` (static HTML in `out/`). No server code, no API routes.
- Hosted on Vercel (project `dentra3/dentra-website`); push to `main` deploys to https://getdentra.site/.
- Brand: mint/teal tokens in `app/globals.css` `:root` (`--g1 #4DD8C8`, `--g2 #2CA6A4`, navy `#1A2E35`, body `#6B7B80`, wash `#EAFAF8 -> #F8FDFB`). Font: Outfit via `next/font` in `app/layout.jsx`.

## 2. File map
| What | Where |
|---|---|
| Metadata (OG, Twitter, theme colour), font | `app/layout.jsx`. The ONLY place for `metadata`. |
| Section order + footer disclaimer | `app/page.jsx` (server component) |
| 1 Hero / nav | `app/hero.jsx`, `app/nav.jsx` |
| 2 Device exploded view (3D) | `components/device/` (see 3) |
| 3 How it works | `app/how-it-works.jsx` |
| 4 Find a dentist (SVG map + clinic card) | `app/find-dentist.jsx` |
| 5 Treatments + Rabi | `app/treatments-ai.jsx` |
| 6 Privacy and trust | `app/privacy-trust.jsx` |
| 7 iPhone Home Screen | `app/install-ios.jsx` (URL in `app/config.js`: `WEB_APP_URL`) |
| 8 FAQ + final CTA | `app/faq.jsx` |
| Shared bits | `components/icon.jsx`, `components/phone.jsx`, `components/play-button.jsx` (`PLAY_URL`) |
| Styles (all) | `app/globals.css`, grouped by `/* ---------- Section ---------- */` headers |
| Favicon / OG image / screenshots | `app/icon.svg`, `public/og.png`, `public/screens/` |

`"use client"` only on: nav, hero, find-dentist, treatments-ai, install-ios, faq, reveal, DeviceExplodedView. Keep new static sections server components.
`components/device/scene/*` is client-only (three.js + canvas textures); it is loaded with `import()` from DeviceExplodedView, never imported statically.

## 3. How the exploded view works (`components/device/`)
The device is a real-time three.js model of the DENTRA camera, built from the **mobile app's own model**:
`dentra_mobile/lib/features/scan/rendering/device_model.dart` (shape) and `device_renderer.dart` (lens, LEDs,
buttons, power switch, wordmark). `scene/model.js` ports those splines/colours 1:1 (mm units, axis +y, lens +z).
If the app's model changes, port the change here.

- `steps.js`: single source of truth for step order + copy. Each step lists the 3D `parts` that come off in it
  (ids from `model.js`) and optional `anchor` (part the leader points at). No three.js imports (page imports it).
- `scene/model.js`: builds every part (geometry, canvas textures, materials) inside its own `holder` group.
  Shell = app shell cut at the base seam (teal end cap) and down the sides (front/back halves); the front half
  cuts its window/button openings in the fragment shader (`HOLES`). Internals come from the app's schematic notes:
  ESP32-S3 board, 2000 mAh cell, OV5640 camera, ribbon, ring of 10 LEDs (4 NIR + 6 white, same layout as DeviceArt).
- `scene/scene.js`: renderer, lights, choreography. `MOVES` = where each part goes and how it turns, `VIEW` =
  yaw/pitch/roll keyframes (f = 0 is the app's resting DevicePose), `FOCUS` = close-up amount per step.
  `render(f, t)` is a pure function of scroll position f (in steps), so it reverses exactly:
  -1..0 section scrolls in; 0 assembled (LED flash); step s (1..N) parts come off with ease-in-out-back, glow,
  dashed assembly paths; N+1 parts spin back together. Camera auto-fits all parts (`fit`, like the app's fitPose)
  blended with a close-up of the active step.
- `DeviceExplodedView.jsx`: track height = `(N + 2) * 85vh` (inline style, derived from `STEPS`). One rAF loop
  while the section is on screen (IntersectionObserver): eases f toward scroll, renders, moves the leader/dot,
  sets React state only when the step changes. three.js is `import()`ed ~1.5 screens before the section
  (separate ~160 kB gz chunk; First Load JS unchanged). Canvas is full-bleed in the sticky stage; the model is
  framed in `.device-viewport` via `camera.setViewOffset` (`scene.resize(w, h, dpr, frame)`).
- Modes (`data-mode` on the section): `poster` (three.js loading: `public/device/assembled.webp`), `live`,
  `fallback` (no WebGL / context lost: posters stay). Drops to 1x DPR if frames run slow.
- `prefers-reduced-motion`: CSS hides `.device-track`, shows `.device-static` (exploded.webp + list of steps).
- Posters: `node scripts/render-device.mjs` renders them from the same modules in headless Chromium
  (needs playwright/playwright-core: `DEPS_DIR=<dir with node_modules>`). `FRAMES=<dir> F="0,2.5"` dumps frames.

### Checklist: add / remove / reorder a step
1. Build the part in `model.js` (`part(id, anchor)`, meshes in model mm; give buttons a `dir`).
2. Add it to `MOVES` (and `PARENT` if it rides on another part) and `FOCUS` in `scene.js`.
3. Add/move the entry in `STEPS` (`parts`, `name`, `desc`; obey section 6). Counts, labels, track height,
   aria text and static list all derive from `STEPS`.
4. Re-render posters, build, then verify (section 7) at 1280x800, 390x844 and reduced motion.

## 4. Decisions (don't undo without asking)
- Section order is the user's: Hero, Device, How it works, Find a dentist, Treatments + AI, Privacy, iPhone, FAQ, Footer.
- 3D device: on 2026-11-09 the user asked for the actual 3D model from the mobile app, taken apart on scroll (this replaced the earlier "SVG only, no three.js" rule). three.js is a dependency but must stay lazy-loaded (dynamic `import()`), so First Load JS stays ~113 kB.
- Device parts follow the app's model (ESP32-S3, OV5640, 2000 mAh, USB-C, 10 LEDs). The old Raspberry Pi Zero / 18650 / disposable-barrier parts and the concept-wand .glb were removed because the app's model doesn't have them.
- Device is always labelled "Capstone research prototype. Tested on typodont (artificial teeth) models." No detection or accuracy claims.
- Tooth Bunny mascot stays removed (user decision). Don't add mascots.
- iPhone section links to https://dentrascan.site/ (the web app). Change only `WEB_APP_URL`.
- Clinic map uses "Example clinic A/B/C" with an "Illustration, not real clinic data" badge. Never invent real-looking clinic names, ratings or reviews.
- Rabi panel shows canned sample answers via chips; no text input (site is read-only).
- Play button: "Google Play: coming soon"; on narrow screens "Coming soon". Never a bare "Google Play" until `PLAY_URL` is set.

## 5. Mistakes made, with fixes (don't repeat)
- `DENTRA_app_context.md` did not exist anywhere on disk. Rules in section 6 come from the user's brief + existing site disclaimers. If the file appears, re-check copy against it.
- A file named `icon.jsx` under `app/` became a metadata route, and the build failed with "dynamic = force-static not configured on route /components/icon". Fix: shared components live in `/components` (repo root). Never name non-metadata files `icon.*`, `apple-icon.*`, `opengraph-image.*`, `sitemap.*`, `robots.*`, `manifest.*` inside `app/`.
- A previous draft imported `./components/device` from inside that folder (build break), invented a "Manila Dental Center 4.8★ 247 reviews", added a chat text input and "local-first storage" claims. All removed.
- The old three.js scanner copy claimed it "sees through enamel", "same principle dentists use", "hundreds of captures". That breaks the claims rules; it's gone.
- With N parts on one line there are only N-1 gaps, so the last part never moved. Fix: the lift is relative to the empty home stack (formula in 3).
- Dimming every part to 40% made the overlapping stack a smudge. Fix: `is-hidden` for parts below the top of the remaining stack.
- Hiding ": coming soon" on mobile left "Google Play", implying it's live. Fix: separate short label.
- `mv app/components components` failed with "Permission denied" (Windows lock). Use `cp -r` then `rm -rf`.
- `npx serve out` hung on a download prompt. Use `cd out && python -m http.server 3124`.
- Another agent (Hermes.exe) edited the repo mid-task: it created `app/cta/`, `app/features/`, `app/hero/`, `src/tokens.css` (coral palette, react-icons) and added `import './src/tokens.css'` + a page-level `metadata` (nonexistent `og-image.png`/`favicon.ico`, old GitHub Pages URL) to `app/page.jsx`. That broke the build and would have overridden OG tags. Fix: those untracked dirs were left uncommitted; `page.jsx` restored. Always stage explicit paths, never `git add -A`.
- Frame drops under 4x CPU throttle were the test harness: plain sections dropped as many. Compare against a baseline before "optimising".
- Headless Chromium renders WebGL on the CPU (SwiftShader): ~11 fps at 390x844@2x. Wait longer between scroll checks there; it is not real-device performance.
- On Ubuntu 26.04 `npx playwright install chromium` refuses the OS; `PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64` works.
- `next build` failed once with "Invariant: no direct app page entry found for /apple-icon.png": stale `.next`. `rm -rf .next` and rebuild.
- A clipped canvas box looked wrong in close-ups (parts cut on a straight line mid-screen). The canvas is full-bleed for that reason; a wash behind `.device-panel` keeps copy readable.

## 6. Claims to avoid (rules)
1. Never say DENTRA or the scanner detects, diagnoses, identifies or finds any condition (cavities, caries, decay, disease). Use "captures", "helps guide", "designed to".
2. No accuracy, sensitivity or specificity numbers. Never "clinically validated/proven" or "tested on patients". Tested on typodont models only.
3. Label the scanner a capstone research prototype. It is not for sale and not a product.
4. The app gives general information and screening guidance: "not a diagnosis"; always defer to a licensed dentist. Keep the footer disclaimer.
5. Only claim what exists: scan results and history use sample data; Android release is "coming soon".
6. Clinic locations are real map data; services/prices in the app are estimates. Any clinic on the site is labelled illustrative.
7. Privacy: only consent toggles, security settings, account deletion. No "local-first", "data never leaves your phone", "HIPAA", etc.
8. No hardware performance claims (seeing through enamel, transillumination, battery life, capture counts).

## 7. Commands
- Install: `npm install` (Node 24 / npm 11 used). Dev: `npm run dev` (http://localhost:3000). Build: `npm run build` (writes `out/`).
- Preview the export: `cd out && python -m http.server 3124`.
- Deploy: push to `main`. Vercel auto-builds. Check: `vercel ls dentra-website` (want "Ready", Production), then `curl -s https://getdentra.site/ | grep -c "See what"`.
- Lint: no ESLint config exists; the build's lint step is a no-op. Type check: plain JS.
- Browser verify (what was used): `playwright` in a scratch dir (not the repo), Chromium launched with
  `--use-angle=swiftshader --enable-unsafe-swiftshader` (Windows: Edge via `BROWSER`). With SEG = N + 2 (11), for f in
  -0.5, 0.5 .. 10.5 scroll to `trackTop + (f / SEG) * (trackHeight - innerHeight)` (f < 0: `trackTop + f * innerHeight`),
  wait ~1.3 s, read `.device[data-mode]` (want `live`) and `.device-label.on` text; repeat backwards and assert the
  same labels. Run at 1280x800, 390x844 (`isMobile`), and `reducedMotion: 'reduce'` (expect `.device-track`
  display none, N + 1 items in `.device-static-list`). Screenshot and LOOK at them.

## 8. Pre-push checklist
- [ ] `git status`: only files you meant to change. Unknown files = another agent; don't commit them, tell the user.
- [ ] `head -15 app/page.jsx`: no stray imports or `metadata` export.
- [ ] `grep -rniE "detect|diagnos|accura|validat|cavit|caries|enamel|sensitiv" app components`: every hit is a negation or disclaimer.
- [ ] `npm run build` passes with no errors or warnings.
- [ ] `out/index.html` has `og:image .../og.png` and `<link rel="icon" href="/icon.svg...">`.
- [ ] Browser: device steps 0-10 forward and back (mode `live`), 390px layout, reduced motion, no console errors, no horizontal overflow.
- [ ] Changed the model or choreography? Re-render `public/device/*.webp` with `scripts/render-device.mjs`.
- [ ] Stage explicit paths, commit, push, then confirm `vercel ls` Ready and the live page contains the change.
