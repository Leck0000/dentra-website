# DENTRA Website - Deployment Summary

## Project Overview
DENTRA is a promotional website for a dental screening mobile app. It's a static marketing site built with Next.js 15, designed to showcase the app's features before launch on Google Play.

**Live Site:** https://leck0000.github.io/dentra-website/

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** JavaScript (.jsx)
- **Styling:** Plain CSS (no Tailwind)
- **Font:** Outfit (via next/font)
- **Build:** Static export (`output: 'export'`)
- **Hosting:** GitHub Pages
- **Deployment:** GitHub Actions (automatic on push to main)

## Setup Steps Completed

### 1. Initial Setup & Build
- Installed dependencies with `npm install`
- Configured Next.js for static export in `next.config.mjs`
- Built the project successfully with `npm run build`
- Verified `out/` folder generation
- Tested dev server at http://localhost:3000

### 2. Git Repository
- Initialized git repository
- Created initial commit: "Initial commit: DENTRA promo site"
- Added remote: https://github.com/Leck0000/dentra-website.git
- Pushed to main branch
- Configured `.gitignore` to exclude `node_modules`, `.next`, `out`, `.vercel`

### 3. GitHub Pages Deployment
Created automated deployment workflow at `.github/workflows/deploy.yml`:
- Triggers on push to main branch
- Builds the Next.js site
- Deploys static files from `out/` folder to GitHub Pages
- Uses GitHub Actions for CI/CD

### 4. GitHub Pages Configuration
Updated `next.config.mjs` for subdirectory hosting:
```javascript
{
  output: 'export',
  basePath: '/dentra-website',
  assetPrefix: '/dentra-website',
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: '/dentra-website',
  }
}
```

### 5. Image Path Fixes
- Added `basePath` variable to dynamically prefix all image paths
- Updated all image references in `app/page.jsx` to use the basePath
- Added `.nojekyll` file to prevent GitHub Pages from ignoring `_next` folder
- Fixed paths for:
  - Hero screen image
  - Mascot images (bunny)
  - Screenshot gallery (5 app screens)

### 6. UI Improvements

#### Mascot Positioning
- Moved bunny mascot from hero section to bottom-right corner
- Changed position to `fixed` for persistent visibility while scrolling
- Updated animation to slide up from bottom
- Currently hidden with `display: none` (can be re-enabled by removing this line)

#### Mobile Navigation Optimization
- Added `white-space: nowrap` to prevent menu text wrapping
- Reduced gap between nav items on mobile (1.5rem → 0.75rem → 0.5rem)
- Smaller font sizes on mobile devices (0.9rem → 0.8rem → 0.75rem)
- Added breakpoint at 480px for extra-small screens
- Reduced brand text size on small screens

## File Structure
```
dentra-website/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── app/
│   ├── bunny.jsx               # Mascot video component
│   ├── globals.css             # All styles
│   ├── layout.jsx              # Root layout
│   ├── page.jsx                # Home page
│   └── reveal.jsx              # Scroll reveal animations
├── public/
│   ├── .nojekyll               # GitHub Pages config
│   ├── bunny.webm              # Mascot video
│   ├── mascot/                 # Mascot images
│   └── screens/                # App screenshots
├── .gitignore
├── next.config.mjs             # Next.js configuration
├── package.json
└── DEPLOYMENT.md               # This file
```

## Deployment Workflow

1. Make changes to code
2. Test locally with `npm run dev`
3. Build with `npm run build`
4. Commit changes: `git add .` → `git commit -m "message"`
5. Push to GitHub: `git push origin main`
6. GitHub Actions automatically builds and deploys
7. Site live at https://leck0000.github.io/dentra-website/ (1-2 minutes)

## Key Features

### Design
- Translucent fixed navigation bar with blur effect
- Gradient background (mint to white)
- Smooth scroll animations with `Reveal` component
- Responsive phone mockups with screenshots
- Accessible design with ARIA labels and reduced motion support

### Sections
1. **Hero** - Main headline with app screenshot
2. **How it works** - 3-step process (Scan, Understand, Act)
3. **Features** - 4 key features in grid layout
4. **Screens** - Interactive gallery with 5 app screenshots
5. **Treatments** - Treatment categories preview
6. **FAQ** - Expandable details for common questions
7. **CTA** - Final call-to-action for Google Play

### Accessibility
- Semantic HTML
- ARIA labels for galleries and navigation
- Reduced motion support for animations
- Proper contrast ratios
- Keyboard navigation support

## Configuration Files

### next.config.mjs
- Static export enabled
- Base path for GitHub Pages subdirectory
- Asset prefix for correct resource loading
- Unoptimized images for static export

### .gitignore
- `node_modules` - Dependencies
- `.next` - Build cache
- `out` - Build output
- `.vercel` - Vercel config (if used)

## Maintenance Notes

### To Show the Mascot
Remove or comment out this line in `app/globals.css` (line ~171):
```css
.peek {
  /* display: none; */ /* Remove this line to show mascot */
}
```

### To Update Images
1. Place new images in `public/` folder
2. Update paths in `app/page.jsx` using the `basePath` variable:
   ```javascript
   src={`${basePath}/path/to/image.webp`}
   ```

### To Modify Styles
All styles are in `app/globals.css`. The file uses CSS custom properties (variables) defined in `:root` for easy theming.

## Commits History
1. Initial commit: DENTRA promo site
2. Merge remote-tracking branch 'origin/main'
3. Hide mascot for now
4. Add GitHub Pages deployment workflow
5. Configure basePath for GitHub Pages deployment
6. Add assetPrefix for GitHub Pages image paths
7. Fix image paths for GitHub Pages deployment
8. Optimize navigation bar for mobile devices

## Next Steps (Optional)
- [ ] Add custom domain (if desired)
- [ ] Add Google Analytics
- [ ] Add OpenGraph meta tags for social sharing
- [ ] Add favicon
- [ ] Show mascot when ready
- [ ] Add contact form (requires backend)

## Troubleshooting

### Images not loading
- Ensure `basePath` variable is used in all image src attributes
- Check that `NEXT_PUBLIC_BASE_PATH` is set in `next.config.mjs`
- Verify `.nojekyll` file exists in `public/` folder

### CSS not applying
- Check that `assetPrefix` is set in `next.config.mjs`
- Clear browser cache
- Check GitHub Actions deployment logs

### Mobile navigation wrapping
- Verify mobile breakpoints in `globals.css`
- Check `white-space: nowrap` is applied to nav links
- Test at different viewport sizes

---

**Last Updated:** October 18, 2026  
**Repository:** https://github.com/Leck0000/dentra-website  
**Live Site:** https://leck0000.github.io/dentra-website/
