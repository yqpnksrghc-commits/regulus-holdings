# SEO Operator Checklist

Epistemic: Tested Claim

Status as of 2026-07-23:

- [x] PASS — focused SEO release integrated into `main`.
- [x] PASS — Netlify production deployment and rollback reference recorded.
- [x] PASS — 36 live sitemap URLs validated; unique metadata, canonicals, one H1, schema, links, assets, redirects, 404, and crawl controls checked.
- [x] PASS — production Lighthouse and mobile/desktop browser checks recorded.
- [x] PASS — Search Console Domain property `regulusautomation.ca` displayed `Ownership auto verified`.
- [x] PASS — submit `https://regulusautomation.ca/sitemap.xml` in Search Console.
- [x] PASS — sitemap acceptance: after an initial `Couldn't fetch` state, the table updated to `Success` with 36 discovered pages.
- [x] PASS — inspect/live-test and request indexing for the five priority Google URLs.
- [ ] BLOCKED — connect Bing Webmaster Tools and submit the sitemap and priority URLs.
- [ ] BLOCKED — run Bing Site Scan.
- [ ] Establish or complete a Google Business Profile only with truthful public information.
- [x] PASS — retain Toronto, Greater Toronto Area, and Ontario service-area language.
- [ ] Confirm approved telephone number and business-address policy; do not use a private address.
- [x] PASS — monitoring baseline created; unavailable search/account data marked unknown.
- [ ] Review indexing, canonical, and structured-data reports after deployment.
- [ ] Supply `GOOGLE_SITE_VERIFICATION` and/or `BING_SITE_VERIFICATION` through Netlify environment variables only if DNS/import verification is not used.
- [ ] Select a privacy-conscious analytics provider and supply an approved identifier before code is added.

Future conversion events: `contact_form_submission`, `email_contact_activation`, `audit_inquiry`,
`service_page_cta_activation`, and—only after a booking flow exists—
`qualified_consultation_booking`.

Production deployment/crawlability are established. Submission, indexing, ranking, traffic, and
conversion remain separate states and are not claimed.

## Kernel Reduction

### Δ — Distinctions
Google property verification, sitemap acceptance, and queue submission are complete; indexing, rankings, traffic, and conversions remain separate.

### Constraints
Do not mark sitemap acceptance or indexing complete until Search Console reports those states.

### σ — Selections
Monitor the submitted sitemap and five requested URLs without resubmitting pending requests.

### Minimal Representation
Google admission passes through sitemap acceptance and crawl requests; indexing is not yet observable.

## Provenance

- Search Console observation: 2026-07-23 19:18–19:33 America/New_York.
- Related evidence: `GOOGLE_SEARCH_CONSOLE_ADMISSION.md`.
