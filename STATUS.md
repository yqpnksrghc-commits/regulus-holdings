# Repository Status — Regulus Automation Inc. website

_Single source of truth for the canonical web presence. Update on any change to
name, domain, canonical repo, or deployment state._

> **Governed by the [Regulus Constitution](../Regulus/Constitution/README.md)**
> and indexed in the [Capability Registry](../Regulus/CapabilityRegistry/capabilities/website.md).
> Company-wide facts (brand, evidence classes, release process) are defined
> there; this file records website-specific status only and does not redefine them.

| Field | Value |
| --- | --- |
| **Legal company name** | Regulus Automation Inc. |
| **Public brand (short)** | Regulus |
| **Canonical domain** | `regulusautomation.ca` |
| **Canonical repository / directory** | `C:\LAB\RegulusHoldings` (Next.js 15 app). The folder name "RegulusHoldings" is an internal label only — not a public or registered name. |
| **Framework** | Next.js 15 (App Router), TypeScript, Tailwind, Framer Motion; fully static-generated. |
| **Baseline commit** | `f4f0b67` (initial site) → hardening pass commit (this change). |
| **Deployment status** | **Not deployed.** Local-only. No DNS, no hosting, no domain purchase performed. |
| **Current production environment** | **None.** There is no live production site for `regulusautomation.ca` at this time. |
| **Contact mailbox** | `info@regulusautomation.ca` (must be live before launch). |
| **Legal pages** | `/privacy` and `/terms` are **drafts pending legal review** — visibly marked, not legally approved. |

## Canonical decision

The **`RegulusHoldings` Next.js project is the canonical website.** See
[`COMPARISON.md`](./COMPARISON.md) for the full evaluation.

## Deprecated website paths

| Path | Status |
| --- | --- |
| `C:\LAB\Regulus\Website` (Python static-site generator, 6 pages) | **Deprecated.** Superseded by this project. Do not deploy. Retained for historical reference and as a source of migrated assets/ideas. Its `hello@` mailbox reference and prior "We don't sell AI" OG creative are **not** used here. |
| `regulusholdings.com` / "Regulus Holdings" (public name) | **Never to be used publicly.** Internal architectural concept only. |

## Migrated from the deprecated site

- Hardened Content-Security-Policy and security-header posture (adapted for Next.js).
- Full favicon / Apple-touch / PWA-manifest / Open Graph coverage (regenerated to the current ring mark and tagline, not copied verbatim).

## Security posture

- **Next.js pinned to `^15.5.20`** (upgraded from 15.1.6 in the hardening pass)
  to clear all critical/high advisories (RSC RCE, middleware auth bypass, SSRF,
  cache poisoning). Direct `postcss` upgraded to `8.5.18`.
- **Headers:** CSP (production has no `unsafe-eval`), `Strict-Transport-Security`,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
  `Permissions-Policy`. See `next.config.mjs`.
- **Accepted, documented residual:** `npm audit` reports **2 moderate** advisories
  in the `postcss` copy **vendored inside Next.js** (GHSA-qx2v-qp2m-jg93 — a CSS
  *stringifier* XSS). It runs only at build time on our own trusted CSS, is not
  reachable at runtime on a static site, and cannot be fixed without downgrading
  Next (npm's `audit fix --force` wrongly proposes next@9). Revisit when Next
  ships an updated vendored postcss.
- **Contact:** backend-less `mailto:` (no server endpoint to abuse) + honeypot
  field + client validation. `form-action 'self' mailto:` in CSP.
- **No JS required to read the site** (`<noscript>` visibility fallback).

## Do-not-do without explicit owner authorization

Push to a remote · deploy · change DNS · purchase a domain · create external
accounts · publish the site · represent the legal pages as approved.
