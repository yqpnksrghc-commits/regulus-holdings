# Regulus Automation Inc. — Website

> **Recovering Value. Building Intelligence.**
>
> The public website of Regulus Automation Inc. (public short brand: **Regulus**).
> Built to communicate quiet confidence, technical excellence, scientific
> discipline, and a focus on recovering value through intelligent systems.

This is not a marketing site. It is the front door of a company intended to
endure for generations. Every design decision favors restraint, clarity, and
honesty over hype.

> **Governance:** this project is one capability of Regulus Automation Inc.,
> governed by the [Regulus Constitution](../Regulus/Constitution/README.md) and
> recorded in the [Capability Registry](../Regulus/CapabilityRegistry/capabilities/website.md).
> Brand, evidence classes, and release process are defined there.

> **Naming:** *Regulus Automation Inc.* is the registered legal entity and the
> public-facing company name; **Regulus** is the short display brand. The
> broader vision — the ten intelligence domains, the research programme, and the
> future venture architecture — are **initiatives and development areas of
> Regulus Automation Inc.**, not separately incorporated companies. ("Regulus
> Holdings" is an internal architectural concept only and is not used publicly.)

---

## Stack

| Layer          | Choice                                             |
| -------------- | -------------------------------------------------- |
| Framework      | **Next.js 15** (App Router, React Server Components)|
| Language       | **TypeScript** (strict)                            |
| Styling        | **Tailwind CSS 3.4** + CSS-variable design tokens  |
| Motion         | **Framer Motion 11** (reduced-motion aware)        |
| Theming        | **next-themes** (light / dark / system)            |
| Rendering      | **Static generation** (SSG) for every route        |
| Fonts          | System font stack (zero network cost, instant paint)|

No external UI kit, no icon dependency, no stock imagery. Every icon and
illustration is authored in SVG for Regulus.

---

## Quick start

```bash
npm install       # install dependencies
npm run dev        # dev server → http://localhost:3000
npm run build      # production build (static export of all routes)
npm run start      # serve the production build
npm run lint       # ESLint (next/core-web-vitals + typescript)
npm run typecheck  # tsc --noEmit
npm run seo:validate # validate production SEO metadata, links, sitemap, robots, JSON-LD
```

Requires Node ≥ 20.

> In the LAB, run it via the preview launcher: config **`regulus-automation`**
> in `C:\LAB\.claude\launch.json` serves it on port **8780**.

---

## Project structure

```
RegulusHoldings/
├─ src/
│  ├─ app/                     # App Router — one folder per route
│  │  ├─ layout.tsx            # Root shell: theme, header, footer, SEO, JSON-LD
│  │  ├─ page.tsx              # Homepage (composes section components)
│  │  ├─ globals.css           # Design tokens (light/dark) + base + components
│  │  ├─ sitemap.ts            # Generated sitemap.xml
│  │  ├─ robots.ts             # Generated robots.txt
│  │  ├─ not-found.tsx         # 404
│  │  ├─ solutions/
│  │  │  ├─ page.tsx           # Solutions index
│  │  │  └─ [slug]/page.tsx    # Domain detail (SSG via generateStaticParams)
│  │  ├─ discovery/ research/ products/
│  │  ├─ about/ philosophy/ careers/ contact/
│  ├─ components/
│  │  ├─ layout/               # Header, Footer, Logo, PageHero, ThemeToggle, ReadingProgress
│  │  ├─ sections/             # Homepage sections + ContactForm
│  │  ├─ ui/                   # Button, Badge, Card, Section, SectionHeading, Icon, DomainCard
│  │  ├─ visuals/              # NetworkBackground, RecoveryLoop, DiscoveryGraph (SVG/canvas)
│  │  ├─ motion/               # Reveal, RevealStagger, RevealItem
│  │  └─ providers/            # ThemeProvider
│  └─ lib/                     # site config, platform data, content, seo, utils, types
├─ .github/workflows/ci.yml    # Lint · Typecheck · Build
├─ tailwind.config.ts          # Design-system tokens → Tailwind utilities
├─ next.config.mjs             # Security headers, image formats
└─ docs: DESIGN_SYSTEM.md · DEPLOYMENT.md · ACCESSIBILITY.md · CONTENT.md
```

**Content lives in `src/lib/`, not in components.** Editing copy, adding a
domain, or changing a product status is a data edit — see
[CONTENT.md](./CONTENT.md).

---

## Answering the four questions

Every page reinforces the four questions the site exists to answer:

1. **Who is Regulus?** — Hero, About, Philosophy
2. **What problems do we solve?** — The Problem, Solutions (10 domains)
3. **Why are we different?** — Our Approach (recovery loop), Research (evidence classes)
4. **How can someone work with us?** — CTA, Careers, Contact

---

## Documentation

- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** — color, typography, spacing, motion, icons, components
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — deploy targets, GitHub structure, CI/CD, env
- **[ACCESSIBILITY.md](./ACCESSIBILITY.md)** — WCAG AA audit and how each criterion is met
- **[CONTENT.md](./CONTENT.md)** — content model, editing workflow, future expansion architecture
- **[docs/seo/SEO_OPERATOR_CHECKLIST.md](./docs/seo/SEO_OPERATOR_CHECKLIST.md)** — deployment and search-account handoff

---

© 2026 Regulus Automation Inc. Recovering value; building intelligence.
