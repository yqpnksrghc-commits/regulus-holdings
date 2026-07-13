# Regulus Automation Website — v1.0.0 Release Notes

**Release date:** 2026-07-13T05:32:08Z  
**Deployed commit:** `ee10d4d` (regulus-web-v1.0-candidate)  
**Status:** Ready for production deployment  

---

## What's Included

- **Next.js 15** static site with 27 prerendered routes
- **Wonder experience** — cosmic atmosphere, golden constellation, slow animations
- **Responsive design** — mobile, tablet, desktop (WCAG AA baseline)
- **Performance optimized** — ~149kB First Load JS, gzip/brotli ready
- **Security hardened** — CSP, HSTS, X-Frame-Options: DENY, honeypot contact form
- **SEO complete** — canonical URLs, sitemap, robots.txt, Open Graph, structured data
- **Tested launcher** — `bash -c "cd /c/LAB/RegulusHoldings && PORT=8780 npm run dev"`

---

## Deployment Instructions

### Option 1: Vercel (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import this repository
3. Framework: **Next.js** (auto-detected)
4. Build settings: Leave as default
5. Environment variables: None required (site is static)
6. Deploy

### Option 2: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Connect repository
3. Build command: `npm run build`
4. Publish directory: `.next/static` (or auto-detected)
5. Deploy

### Option 3: Self-hosted

```bash
npm ci
npm run build
npm run start  # Runs on port 3000; use PORT=8780 for custom port
```

Then configure reverse proxy (nginx, Apache) with:
- HTTPS with automatic certificate renewal
- Gzip/Brotli compression
- Immutable asset caching (Cache-Control: max-age=31536000)
- Security headers (see next.config.mjs)

---

## Post-Deployment Configuration

After deploying to your chosen platform:

1. **Domain configuration**
   - Point `regulusautomation.ca` to your deployment URL
   - Enable auto-redirect from `www`

2. **Environment configuration**
   - HTTPS: auto-enabled (all platforms do this)
   - Compression: verify gzip in response headers
   - Caching: headers are baked into the build
   - Security headers: embedded in next.config.mjs

3. **Verification checklist**
   ```
   ✓ https://regulusautomation.ca loads
   ✓ www redirects correctly
   ✓ All navigation pages load
   ✓ Contact form works (or shows intentional notice)
   ✓ Mobile rendering is correct
   ✓ No 404 errors in console
   ✓ No broken internal links
   ✓ Lighthouse score > 90
   ```

---

## Known Limitations

**Accepted, build-time-only risk:**
- PostCSS XSS advisory (GHSA-qx2v-qp2m-jg93) in Next.js vendored postcss
  - Runs only at build time on trusted CSS
  - Not reachable at runtime on static site
  - Review trigger: 2026-10-13 or Next.js upgrade

**Intentional design constraints:**
- Contact form uses mailto (no backend API)
- Privacy/Terms pages are drafts (legal review pending)
- No analytics configured
- No user tracking

---

## Verified Pre-Deployment State

```
Commit:        ee10d4d
Tag:           regulus-web-v1.0-candidate
Backups:       C:\LAB_Backups\RegulusHoldings\20260713T043402Z\
Working tree:  Clean
Release gates: All PASS (npm ci, lint, typecheck, build)
```

---

## Next Steps After Launch

1. Verify all pages load without errors
2. Test on mobile and desktop
3. Confirm Lighthouse scores
4. Check that analytics (if enabled) are firing
5. Move discovered improvements to BACKLOG_POST_LAUNCH.md

**Do not implement backlog items until production is stable.**

---

**Deployment ready.** Owner authorization required to complete DNS/domain configuration and trigger the actual deployment to your chosen hosting platform.
