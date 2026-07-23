# Google Search Console Admission

Epistemic: Tested Claim

Observation window: 2026-07-23 19:18–19:33 America/New_York

## Admission status

| Distinct state | Status | Evidence |
|---|---|---|
| Domain property verified | PASS | Search Console displayed `Ownership auto verified`; verification method `Domain name provider`. |
| Sitemap submitted | PASS | UI toast: `Sitemap submitted successfully`; submitted table contains `https://regulusautomation.ca/sitemap.xml`. |
| Sitemap accepted | PASS | After initial processing, the table updated to `Success`; discovered pages: `36`; discovered videos: `0`. |
| URLs live-tested | PASS | All five returned `URL is available to Google`, `Page can be indexed`, crawl allowed `Yes`, page fetch `Successful`, and indexing allowed `Yes`. |
| Indexing requested | PASS | Each URL returned `Indexing requested` and `URL was added to a priority crawl queue.` |
| Indexed | NOT YET OBSERVABLE | The Google Index state for every URL was `URL is not on Google`; no request is represented as indexing. |
| Rankings | NOT YET OBSERVABLE | No ranking evidence was available in the newly admitted property. |
| Organic traffic | NOT YET OBSERVABLE | Search Console reported that data was processing and to check again later. |
| Qualified conversions | NOT YET OBSERVABLE | Search Console admission does not establish conversion measurement. |

## Sitemap

- Submitted URL: `https://regulusautomation.ca/sitemap.xml`
- Submission result: `Sitemap submitted successfully`
- Initial processing result: `Couldn't fetch`, 0 discovered pages.
- Current result after reprocessing: `Success`
- Type: `Sitemap`
- Submitted: `Jul 23, 2026`
- Last read: `Jul 23, 2026`
- Discovered pages: `36`

The initial fetch failure was transient. Current interface evidence proves successful sitemap acceptance and 36 discovered pages; it does not prove those pages are indexed.

## Priority URL inspection

| URL | Google index state before live test | Live test | Fetch / allowed / canonical | Request result | Recorded time |
|---|---|---|---|---|---|
| `https://regulusautomation.ca/` | `URL is not on Google`; `Page is not indexed: URL is unknown to Google` | PASS — `URL is available to Google` | `Successful` / `Yes` / self-referencing user canonical; Google canonical only after indexing | `Indexing requested`; added to priority crawl queue | 2026-07-23 19:24 EDT |
| `https://regulusautomation.ca/automation/automation-opportunity-audit` | `URL is not on Google`; `Page is not indexed: Discovered - currently not indexed` | PASS — tested 19:27 EDT | `Successful` / `Yes` / self-referencing user canonical; Google canonical only after indexing | `Indexing requested`; added to priority crawl queue | 2026-07-23 19:28 EDT |
| `https://regulusautomation.ca/industries/medical-dental-clinics` | `URL is not on Google`; `Page is not indexed: Discovered - currently not indexed` | PASS — tested 19:29 EDT | `Successful` / `Yes` / self-referencing user canonical; Google canonical only after indexing | `Indexing requested`; added to priority crawl queue | 2026-07-23 19:29 EDT |
| `https://regulusautomation.ca/insights/how-to-identify-workflows-worth-automating` | `URL is not on Google`; `Page is not indexed: Discovered - currently not indexed` | PASS — tested 19:30 EDT | `Successful` / `Yes` / self-referencing user canonical; Google canonical only after indexing | `Indexing requested`; added to priority crawl queue | 2026-07-23 19:31 EDT |
| `https://regulusautomation.ca/insights/where-clinics-lose-administrative-time` | `URL is not on Google`; `Page is not indexed: Discovered - currently not indexed` | PASS — tested 19:32 EDT | `Successful` / `Yes` / self-referencing user canonical; Google canonical only after indexing | `Indexing requested`; added to priority crawl queue | 2026-07-23 19:32:51 EDT |

Search Console displayed minute precision for live-test times and no timestamp in the request-result dialog; request times above are operator-clock records.

## Evidence safety

No login, security, account identity, recovery, verification-token, or DNS-value screenshots were captured. No credentials, cookies, account identifiers, or verification values are stored here.

## Kernel Reduction

### Δ — Distinctions

Property verification, sitemap submission, sitemap acceptance, live eligibility, crawl requests, indexing, rankings, traffic, and conversion are independent states.

### Constraints

Only the current `Success` state permits an acceptance claim. `Indexing requested` proves only queue admission and forbids an indexed claim.

### σ — Selections

The verified Domain property, exact sitemap status, five successful live tests, and five queue confirmations are the surviving operational selections.

### Minimal Representation

Domain verification, sitemap acceptance, and five indexing requests passed; indexing and downstream outcomes are not yet observable.

## Provenance

- Authority: operator instruction dated 2026-07-23.
- System: authenticated Google Search Console Domain property `regulusautomation.ca`.
- Browser observation window: 2026-07-23 19:18–19:33 America/New_York.
