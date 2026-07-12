# Website Implementation Comparison

Two implementations existed for the Regulus Automation Inc. web presence. This
document records the evaluation and the canonical decision. A company must not
maintain two competing production websites.

## Candidates

| | **A — `RegulusHoldings`** | **B — `Regulus\Website`** |
| --- | --- | --- |
| Type | Next.js 15 App Router (TS, Tailwind, Framer Motion) | Python static-site generator (`build.py` → HTML) |
| Baseline | commit `f4f0b67` | built 2026-06-16 |
| Routes | 27 static routes (incl. 10 solution pages) | 6 pages |

## Dimension-by-dimension

| Dimension | A — RegulusHoldings | B — Regulus\Website | Winner |
| --- | --- | --- | --- |
| **Completeness** | 11 sections on home + 10 solution detail pages + discovery/research/products/about/philosophy/careers/contact/privacy/terms | Home, services, products, research, about, contact, 404 | **A** |
| **Design quality** | Animated hero network, recovery-loop + discovery-graph SVGs, motion system, design tokens, light/dark | Clean, honest, static; simpler visuals | **A** |
| **Performance** | ~148 kB First-Load JS (React + Framer runtime), static HTML, system fonts | Zero-framework, near-zero JS, zero external requests — structurally faster | **B** (margin narrow; A still fast & static) |
| **Maintainability** | Typed components, content-as-data, CI, docs; standard Next.js | Bespoke Python generator, markdown; no types/components | **A** |
| **Content** | Broad: 10 intelligence domains, research programme, roadmap — honest evidence classes | Tight, business-focused (services, revenue-recovery framing) — honest status tags | **A** (breadth); B has sharper commercial copy |
| **Deployment readiness** | Build green, validated; needed CSP + full icon/OG set (added in this pass) | CSP, favicon/OG/PWA set, one-command Cloudflare deploy script already present | **B → parity** (A now matches after migration) |
| **Unique capabilities** | Interactive visuals, dynamic routing, design system, extensible content model | Complete asset set, Cloudflare deploy automation, hardened CSP | — |

## Decision

**Canonical = A (`RegulusHoldings`, Next.js).**

Reasoning: for a company "intended to endure for generations," maintainability
(types, components, content-as-data, CI), completeness, and design headroom
outweigh B's marginal performance edge and its bespoke generator. A is the
platform that can grow; B is a well-built but narrower static site.

## What was migrated from B (only where it materially improves A)

- **Hardened CSP + security headers** → `next.config.mjs` (adapted for Next's
  inline bootstrap/styles; `unsafe-eval` dev-only).
- **Full icon / OG / PWA coverage** → `app/apple-icon.tsx`, `app/manifest.ts`,
  `public/og.png`, existing `app/icon.svg`. Regenerated to the **current** ring
  mark and "Recovering Value. Building Intelligence." tagline — B's star mark
  and "We don't sell AI" OG creative were intentionally **not** copied, to keep
  one consistent brand.

## What was NOT migrated (and why)

- B's Python generator and markdown pipeline — would fork the toolchain.
- B's `hello@` mailbox reference — superseded by `info@regulusautomation.ca`.
- B's commercial services copy — belongs to the automation-services framing;
  A already covers this honestly as initiatives of Regulus Automation Inc.

## Disposition of B

`C:\LAB\Regulus\Website` is **deprecated** (see [`STATUS.md`](./STATUS.md)). It
is not to be deployed. It remains on disk for reference only.
