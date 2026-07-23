# Search Monitoring Baseline

Epistemic: Tested Claim

Observation timestamp: 2026-07-23 21:58 America/New_York

## Baseline

| Measure | Status | Value |
|---|---|---|
| Production deployment | PASS | Netlify deploy `6a628dd26376df07c04c31a5`; Git release commit `dfc9bf0` |
| Canonical production URL | PASS | `https://regulusautomation.ca` |
| Public sitemap | PASS | `https://regulusautomation.ca/sitemap.xml`; 36 live URLs |
| Google Domain property | PASS | `Ownership auto verified`; Domain name provider |
| Google sitemap submission | PASS | Submitted 2026-07-23 |
| Google sitemap acceptance | PASS | `Success` after initial processing |
| Google discovered URLs | PASS | 36 currently shown; discovery is not indexing |
| Priority URLs live-tested | PASS | 5/5 available to Google; fetch successful; indexing allowed |
| Priority URL indexing requested | PASS | 5/5 added to the priority crawl queue |
| Google indexed pages | NOT YET OBSERVABLE | Unknown |
| Google impressions | NOT YET OBSERVABLE | Unknown |
| Google clicks | NOT YET OBSERVABLE | Unknown |
| Google queries | NOT YET OBSERVABLE | Unknown |
| Google crawl issues | NOT YET OBSERVABLE | Unknown |
| Google structured-data issues | NOT YET OBSERVABLE | Unknown |
| Bing property | BLOCKED | Unknown; authenticated access unavailable |
| Bing sitemap submission | NOT STARTED | Unknown |
| Bing indexed pages | NOT YET OBSERVABLE | Unknown |
| Bing crawl/site-scan issues | NOT YET OBSERVABLE | Unknown |
| Organic qualified inquiries | NOT YET OBSERVABLE | Unknown |
| Verified conversions | BLOCKED | No approved analytics provider/identifier |

## Synthetic Production Baseline

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Homepage | 93 | 98 | 100 | 100 |
| Automation Opportunity Audit | 100 | 100 | 100 | 100 |
| Medical, Dental & Aesthetic Clinics | 96 | 100 | 100 | 100 |
| Workflow-selection insight | 100 | 100 | 100 | 100 |

Synthetic scores are not real-user Core Web Vitals.

## Review Checkpoints

- 2026-07-30: approximately seven days after release; review ownership/submission state, sitemap processing, indexing coverage, crawl errors, structured data, initial queries/impressions/clicks, and qualified inquiries.
- 2026-08-22: approximately 30 days after release; compare page/query performance, duplicated intent, pages needing evidence-backed improvement, and conversion evidence.
- Monthly thereafter: review indexing, crawl errors, queries, impressions, clicks, page performance, qualified inquiries, duplicate intent, and grounded content opportunities.

New pages require distinct user value and evidence; keyword existence alone is not sufficient.

## Kernel Reduction

### Δ — Distinctions

Technical availability is established; search-engine discovery, indexing, traffic, and conversion data are not yet established.

### Constraints

Unknown data remains unknown until authenticated reports populate. Synthetic Lighthouse cannot be used as real-user performance evidence.

### σ — Selections

The first measurement checkpoints are seven days, 30 days, and monthly after the 2026-07-23 submission.

### Minimal Representation

Production is measurable and crawlable; Google property/sitemap/request admission passed, while indexing, search performance, and conversion baselines remain unobserved.

## Provenance

- Source: live production crawl and Lighthouse reports on 2026-07-23.
- Deployment: `6a628dd26376df07c04c31a5`.
- Related authority: production-release instruction and `PRODUCTION_RELEASE_EVIDENCE.md`.
