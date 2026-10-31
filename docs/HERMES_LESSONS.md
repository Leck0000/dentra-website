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
| 2 Device exploded view | `components/device/` (see 3) |
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

## 3. How the exploded view works (`components/device/`)
- `steps.js` is the single source of truth: one entry per part, in reveal order, plus `FINAL` (caption step).
- `DeviceExplodedView.jsx`: `.device-track` is `900vh`; inside, `.device-stage` is `position: sticky; top: 0; height: 100svh`.
- Progress: `p = (scrollY - trackTop) / (trackHeight - innerHeight)`, `f = p * SEGMENTS` with `SEGMENTS = N + 2` (9).
  `step = floor(f)`: 0 = assembled + "See what's inside.", 1..N = part N-1 active, N+1 = final caption.
- Each part's lift: `sep_i = smoothstep((f - (i+1) + 0.35) / 0.7)`, so it moves across the step boundary.
  Centre: `centre_i = i*LAYER*(1-sep_i) - SPACING * sum(sep_j for j >= i)`. The anchor is the empty "home" stack,
  not a part, so every part (including the last) visibly moves. Reversible by construction (pure function of scroll).
- A rAF callback writes `transform` straight to the DOM (rig scale/pan + one translateY per part + progress bar + leader line).
  React state changes only when `step` changes (classes, labels, aria-live text). Layout is measured once per resize (ResizeObserver).
- Classes: `is-active` (halo), `is-dim` (opacity .4), `is-hidden` (parts deeper than the top of the remaining stack).
- Leader line: computed from rig maths + a cached anchor in the label panel; hidden below 900px (panel sits under the stage).
- `prefers-reduced-motion`: CSS hides `.device-track` and shows `.device-static` (list of all 8); JS skips listeners.
- Parts: 360 x 92 SVG (`RIG_W` x `PART_H` in `kit.jsx`), footprint centred on `y = CY (36)`, oblique squash `K = 0.45`.
  Use `Slab`, `Halo`, `Chip`, `useSvgId` from `kit.jsx`. Parts have no `"use client"`.

### Checklist: add / remove / reorder a step
1. Add: create `components/device/NewPart.jsx` (copy `PowerBoard.jsx` as a template), 360x92, centred on `CY`, gradient ids via `useSvgId`.
2. Add an entry to `STEPS` at its reveal position: `name`, `desc` (obey section 6), `anchorX` (right edge of the drawing + ~4), `z` (higher = drawn on top while stacked; the first unrevealed part must have the highest z, except the clear barrier).
3. Set `.device-track` height to `(N + 2) * 100vh` in `globals.css`.
4. If the new art extends more than 30 px above or 46 px below `CY`, adjust `TOP_EXT` / `STACK_BOTTOM` / `CELL_BOTTOM`.
5. Remove = delete the entry + file, then step 3. Reorder = reorder `STEPS` and fix `z`.
6. Counter, aria-live text, hidden list and static list all derive from `STEPS`; don't hard-code counts anywhere.
7. Build, then verify (section 7) at 1280x800, 390x844 and reduced motion.

## 4. Decisions (don't undo without asking)
- Section order is the user's: Hero, Device, How it works, Find a dentist, Treatments + AI, Privacy, iPhone, FAQ, Footer.
- SVG + CSS transforms, no three.js: user rule, 60fps on mid-range Android, bundle (First Load JS ~115 kB), parts swappable for real renders. three.js was removed from deps.
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
- Browser verify (what was used): `playwright-core` in a scratch dir (not the repo), Edge at
  `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`. For each step s in 0..8, scroll to
  `trackTop + ((s + 0.5) / 9) * (trackHeight - innerHeight)`, wait 700 ms, read `.device-label.on` text and each
  `.device-part` class + transform; repeat 8..0 and assert identical. Run at 1280x800, 390x844 (`isMobile`), and
  `reducedMotion: 'reduce'` (expect `.device-track` display none, 8 items in `.device-static-list`). Screenshot and LOOK at them.

## 8. Pre-push checklist
- [ ] `git status`: only files you meant to change. Unknown files = another agent; don't commit them, tell the user.
- [ ] `head -15 app/page.jsx`: no stray imports or `metadata` export.
- [ ] `grep -rniE "detect|diagnos|accura|validat|cavit|caries|enamel|sensitiv" app components`: every hit is a negation or disclaimer.
- [ ] `npm run build` passes with no errors or warnings.
- [ ] `out/index.html` has `og:image .../og.png` and `<link rel="icon" href="/icon.svg...">`.
- [ ] Browser: device steps 0-8 forward and back, 390px layout, reduced motion, no console errors, no horizontal overflow.
- [ ] Stage explicit paths, commit, push, then confirm `vercel ls` Ready and the live page contains the change.
