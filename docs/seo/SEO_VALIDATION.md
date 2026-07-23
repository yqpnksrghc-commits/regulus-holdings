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
| `npm test` | NOT STARTED: production branch has no test script/test suite; the originating LAB branch’s 19 tests were not imported because they cover unrelated Ahura functionality |
| `npm run build` | PASS, 44 generated routes |
| `npm run seo:validate` | PASS: 36 public HTML routes, 36 sitemap URLs, 36 unique titles |
| `BASE_URL=http://127.0.0.1:8781 npm run validate` | PASS: 33 routes, 36 internal links, zero warnings |
| `BASE_URL=https://regulusautomation.ca npm run validate` | PASS: 33 routes, 36 internal links, zero warnings |
| Full sitemap crawl | PASS: 36/36 status 200, 36 unique titles, metadata/canonical/H1/schema checks, 41 internal links, zero errors |
| Mobile/desktop browser audit | PASS after correction `dfc9bf0`: representative routes, one H1, zero console errors/failed requests; homepage 390 px overflow corrected |
| `CONTEXT=deploy-preview npm run build` | PASS: served preview artifact emitted blanket robots disallow and homepage `noindex, nofollow` |

## Lighthouse mobile simulation

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Homepage | 93 | 98 | 100 | 100 |
| Automation Opportunity Audit | 100 | 100 | 100 | 100 |
| Medical, Dental & Aesthetic Clinics | 96 | 100 | 100 | 100 |
| Workflow-selection insight | 100 | 100 | 100 | 100 |

Lighthouse 13.4.1 ran through the installed Microsoft Edge binary. Two runs emitted a Windows
temporary-profile cleanup warning after their JSON reports were written; report parsing succeeded
and the scores above came from those files. No score was substituted or estimated.

## Structured data and crawling

Automated validation parsed every JSON-LD block. The build contains Organization and WebSite schema
site-wide; Service and Breadcrumb schema on commercial detail pages; Article and Breadcrumb schema
on both articles. The production robots artifact references the canonical sitemap, does not block
assets, and excludes APIs/private review paths. Preview/branch deployment environments render
`noindex` and a blanket robots disallow. Live apex/HTTPS redirects, crawlability, and canonicalization
are verified. Search-engine submission, indexing, ranking, traffic, and conversion are not established.
