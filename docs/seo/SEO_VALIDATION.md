# SEO Validation

Validated locally on 2026-07-23 against an optimized Next.js production build and local production
server. These results do not establish production deployment, indexing, ranking, or real-user Core
Web Vitals.

## Before

- Build: PASS, 36 generated pages.
- Existing unit tests: 19 PASS.
- Titles/descriptions/canonicals/H1: present on the 28 indexable HTML routes inspected.
- Page-specific structured data: absent.
- Commercial industry and insight routes: absent.
- Lighthouse: not captured before implementation; baseline score is unknown.

## After

| Validation | Result |
|---|---|
| `npm ls --depth=0` | Dependencies resolved; one pre-existing extraneous transitive runtime noted |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS, no warnings/errors; Next reports its own lint-command deprecation notice |
| `npm test` | PASS, 19/19 |
| `npm run build` | PASS, 46 generated pages |
| `npm run seo:validate` | PASS: 37 public HTML routes, 37 sitemap URLs, 37 unique titles |
| `BASE_URL=http://127.0.0.1:3100 npm run validate` | PASS: 34 routes, 36 internal links, zero warnings |
| Playwright mobile/desktop audit | PASS: four representative routes, HTTP 200, one H1, zero horizontal overflow |

## Lighthouse mobile simulation

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Homepage | 98 | 98 | 100 | 100 |
| Automation Opportunity Audit | 99 | 100 | 100 | 100 |
| Medical, Dental & Aesthetic Clinics | 97 | 100 | 100 | 100 |

Lighthouse 13.4.1 ran through the installed Microsoft Edge binary. Two runs emitted a Windows
temporary-profile cleanup warning after their JSON reports were written; report parsing succeeded
and the scores above came from those files. No score was substituted or estimated.

## Structured data and crawling

Automated validation parsed every JSON-LD block. The build contains Organization and WebSite schema
site-wide; Service and Breadcrumb schema on commercial detail pages; Article and Breadcrumb schema
on both articles. The production robots artifact references the canonical sitemap, does not block
assets, and excludes APIs/private review paths. Preview/branch deployment environments render
`noindex` and a blanket robots disallow. Live redirects and host canonicalization remain externally
unverified.
