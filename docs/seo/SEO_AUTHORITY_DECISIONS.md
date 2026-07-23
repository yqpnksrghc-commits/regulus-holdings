# SEO Authority Decisions

Epistemic: Established Operational Knowledge

## Confirmed

| Decision | Status | Evidence |
|---|---|---|
| Public legal name | PASS | Repository legal/privacy copy and structured data: `Regulus Automation Inc.` |
| Public email | PASS | Existing site source and live contact page: `info@regulusautomation.ca` |
| Service-area language | PASS | Existing commercial content: Toronto, Greater Toronto Area, and Ontario |
| Production branch | PASS | Remote default, repository deployment policy, Netlify deploy records: `main` |
| Production host | PASS | DNS, HTTP headers, linked deployment records: Netlify |
| Google Search Console Domain property | PASS | `regulusautomation.ca` displayed `Ownership auto verified` on 2026-07-23. |

## Authority Required

| Decision | Status | Required actor and evidence |
|---|---|---|
| Public telephone | BLOCKED | Ian/company authority must approve a real customer-facing number before publication. |
| Public address policy | BLOCKED | Ian/company authority must decide whether any legitimate address is public; no private, mailbox, virtual-office, or fabricated storefront address may be used. |
| Google Business Profile | BLOCKED — BUSINESS IDENTITY AUTHORITY REQUIRED | Ian/company authority must establish direct customer service, eligible customer-facing location or service-area status, approved business name, phone, address visibility, service area, and truthful verification path. |
| Analytics provider | BLOCKED | Ian/company authority must approve provider, privacy/consent posture, retention, data residency, and production identifier. |
| Google indexing observation | NOT YET OBSERVABLE | Monitor the 36 discovered sitemap URLs and five requested URLs; discovery/request is not indexing. |
| Bing Webmaster Tools account action | BLOCKED | An authenticated owner must import from Google or verify `https://regulusautomation.ca`, submit the sitemap and five priority URLs, then run Site Scan. |

## Search-Account Operator Handoff

### Google

Completed 2026-07-23:

1. Domain property `regulusautomation.ca` verified automatically.
2. `https://regulusautomation.ca/sitemap.xml` submitted; after an initial fetch delay, current result `Success`, 36 discovered pages.
3. Inspected and live-tested, once each:
   - `https://regulusautomation.ca/`
   - `https://regulusautomation.ca/automation/automation-opportunity-audit`
   - `https://regulusautomation.ca/industries/medical-dental-clinics`
   - `https://regulusautomation.ca/insights/how-to-identify-workflows-worth-automating`
   - `https://regulusautomation.ca/insights/where-clinics-lose-administrative-time`
4. Each live test passed and each URL was added once to the priority crawl queue.

Remaining: monitor URL index state. Do not resubmit pending requests or call a request indexed.

### Bing

1. In Bing Webmaster Tools, import the verified Google property when authorized, or add `https://regulusautomation.ca`.
2. Verify through DNS/provider integration, or set `BING_SITE_VERIFICATION` in Netlify project environment variables and redeploy. Never commit the value.
3. Submit `https://regulusautomation.ca/sitemap.xml`.
4. Submit the same five priority URLs once.
5. Run Site Scan against the canonical origin; record material findings only.

## Analytics Requirements

No provider is installed. Existing semantic hooks cover:

- `contact_form_submission`
- `email_contact_activation`
- `audit_inquiry`
- `service_page_cta_activation`

`qualified_consultation_booking` is intentionally absent because no real booking workflow exists.

Provider approval must define the environment-variable name/identifier, consent behavior, privacy-policy impact, preview behavior, event transport, and a destination-side verification procedure. Conversion tracking remains inactive until an event is observed in the approved destination.

## Kernel Reduction

### Δ — Distinctions

Confirmed public identity and Search Console admission are separated from unresolved indexing, identity, and measurement decisions requiring authority.

### Constraints

No phone, street address, business profile, analytics provider, DNS change, or unproven search outcome may be invented or activated without authoritative evidence.

### σ — Selections

Legal name, public email, broad Ontario service area, `main`, Netlify, and the verified Google Domain property/sitemap remain active; indexing remains unobserved.

### Minimal Representation

Keep the verified Google property, accepted sitemap, and recorded queue requests; hold phone/address/GBP/analytics actions for grounded authority.

## Provenance

- Repository and live-site evidence inspected 2026-07-23.
- Authority: production-release instruction and existing public business copy.
- Related evidence: `PRODUCTION_RELEASE_EVIDENCE.md`.
