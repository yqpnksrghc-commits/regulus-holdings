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

## Authority Required

| Decision | Status | Required actor and evidence |
|---|---|---|
| Public telephone | BLOCKED | Ian/company authority must approve a real customer-facing number before publication. |
| Public address policy | BLOCKED | Ian/company authority must decide whether any legitimate address is public; no private, mailbox, virtual-office, or fabricated storefront address may be used. |
| Google Business Profile | BLOCKED — BUSINESS IDENTITY AUTHORITY REQUIRED | Ian/company authority must establish direct customer service, eligible customer-facing location or service-area status, approved business name, phone, address visibility, service area, and truthful verification path. |
| Analytics provider | BLOCKED | Ian/company authority must approve provider, privacy/consent posture, retention, data residency, and production identifier. |
| Google Search Console account action | BLOCKED | An authenticated owner must open/use the Domain property `regulusautomation.ca`, prove ownership, submit the sitemap, and inspect/request the five priority URLs. |
| Bing Webmaster Tools account action | BLOCKED | An authenticated owner must import from Google or verify `https://regulusautomation.ca`, submit the sitemap and five priority URLs, then run Site Scan. |

## Search-Account Operator Handoff

### Google

1. In Search Console, select or add Domain property `regulusautomation.ca`.
2. An apex Google verification TXT record already exists. Click **Verify**; if it belongs to a different property/account, obtain the new property’s TXT value and add it at the authoritative DNS provider without removing unrelated TXT/MX records.
3. Submit `https://regulusautomation.ca/sitemap.xml`.
4. Inspect and live-test, once each:
   - `https://regulusautomation.ca/`
   - `https://regulusautomation.ca/automation/automation-opportunity-audit`
   - `https://regulusautomation.ca/industries/medical-dental-clinics`
   - `https://regulusautomation.ca/insights/how-to-identify-workflows-worth-automating`
   - `https://regulusautomation.ca/insights/where-clinics-lose-administrative-time`
5. Request indexing only after each live test reports availability and allowed indexing. Record request time/status; do not call it indexed.

If metadata verification is required instead of DNS, set `GOOGLE_SITE_VERIFICATION` in Netlify project environment variables, redeploy `main`, verify the rendered tag, and click Verify. Never commit the token.

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

Confirmed public identity facts are separated from identity, account, and measurement decisions requiring human authority.

### Constraints

No phone, street address, business profile, analytics provider, or account submission may be invented or activated without authoritative evidence.

### σ — Selections

Legal name, public email, broad Ontario service area, `main`, and Netlify remain active; all unresolved outward identity/account decisions remain blocked.

### Minimal Representation

Deploy with the confirmed name/email/service area; hold phone/address/GBP/analytics/search-account actions for authenticated authority.

## Provenance

- Repository and live-site evidence inspected 2026-07-23.
- Authority: production-release instruction and existing public business copy.
- Related evidence: `PRODUCTION_RELEASE_EVIDENCE.md`.
