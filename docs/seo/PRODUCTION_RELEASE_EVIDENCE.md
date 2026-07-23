# SEO Production Release Evidence

Epistemic: Tested Claim

Observation timestamp: 2026-07-23 21:58 America/New_York

## Status

| Gate | Status | Evidence |
|---|---|---|
| Workspace protection | PASS | Active `C:\LAB` worktree remained on `feature/ahura-node-lifecycle-v0.2` at `142c9f2`; unrelated modified and untracked files were not staged, reset, moved, or committed. |
| Clean integration | PASS | Separate worktree `C:\LAB\worktrees\regulus-seo-release`; branch `release/regulus-seo-v1`; production base `origin/main` at `ba7a697`. |
| Local validation | PASS | Typecheck, lint, build, SEO validation, HTTP validation, four Lighthouse runs, and mobile/desktop checks passed. The production branch has no applicable `npm test` script or test suite. |
| Production deployment | PASS | Netlify production deploy `6a628dd26376df07c04c31a5`, published 2026-07-23 21:57:48 EDT. |
| Live technical validation | PASS | 36/36 sitemap pages returned 200 with 36 unique titles, one H1, canonical metadata, descriptions, social metadata, parseable JSON-LD, and no broken internal links. |
| Google admission | BLOCKED | A Google verification TXT record exists at the apex, but no authenticated Search Console surface was available to prove property ownership, submit the sitemap, or request indexing. |
| Bing admission | BLOCKED | No Bing verification DNS/meta signal and no authenticated Bing Webmaster Tools surface were available. |
| Analytics activation | BLOCKED | No analytics provider or approved identifier is configured. Semantic conversion hooks are present; no delivery to an analytics destination is claimed. |

## Repository Baseline

- Active workspace branch: `feature/ahura-node-lifecycle-v0.2`
- Active workspace commit: `142c9f2b853a25bc5eb892bd29dbc7ce87d75f18`
- Remotes:
  - `origin`: `https://github.com/yqpnksrghc-commits/regulus-holdings.git`
  - `ahura`: `https://github.com/yqpnksrghc-commits/ahura.git`
- Remote default branch: `origin/main`
- Local production branch evidence: `regulus-holdings-prod` tracked `origin/main`.
- Deployment documentation: trunk-based; `main` is production and host integration deploys it.
- Netlify deployment evidence: live response header `Server: Netlify`; DNS `www` CNAME targets the Netlify site; Netlify deploy records report branch `main`.
- Active workspace status: unrelated changes existed in LAB memory, portfolio, Ahura, marketing, revenue, contact-form, deployment, and environment files. Full status was observed before worktree creation and was not altered by this release.
- Existing worktrees and tags were inventoried before integration. Recent website deployment commits on `origin/main` ended at `ba7a697`.

## Integration

- Original SEO commit: `142c9f2 feat(seo): establish Regulus search foundation`
- Release integration commit: `5033fb5 feat(seo): establish Regulus search foundation`
- Mobile correction: `dfc9bf0 fix(seo): prevent mobile homepage overflow`
- Method: cherry-pick only the SEO commit into a clean worktree based on `origin/main`.
- Conflict cause: the originating LAB history stored the app under `RegulusHoldings/`; the deployable repository stores that same app at its root and has unrelated Git ancestry.
- Minimal supporting dependency: the unchanged `/automation` hub from the SEO commit’s direct parent was required because the SEO commit modified its detail implementation but did not add the hub file itself.
- Exclusions: LAB memory artifacts, private Ahura routes, Ahura APIs, Ahura tests, and all unrelated active-workspace changes.
- A stale `/ahura-select-alpha` sitemap/validator dependency was removed because that application is not present on the production branch and was not authorized as part of this release.
- Unsupported founder/founding data inherited through conflict context was omitted from schema.

## Deployment Path and Rollback

- Hosting provider: Netlify, Next.js Runtime v5.
- Production project: linked Netlify site serving `regulusautomation.ca`.
- Production branch: `main`.
- Build command: `npm run build`.
- Output: Next.js `.next` through the Netlify Next.js runtime.
- Environment: no secret is required for the current build. Optional verification variables are `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION`.
- Domain: apex `https://regulusautomation.ca`; `www` redirects to apex.
- Release method: push focused commits to `main`; Netlify Git integration deploys `main`. An authenticated manual production deploy was also used for the final corrected build.
- Pre-release rollback deploy: `6a615c353cfc04f0b11de3b5`.
- Pre-release immutable URL: `https://6a615c353cfc04f0b11de3b5--shimmering-taiyaki-96e964.netlify.app`.
- Final corrected deploy: `6a628dd26376df07c04c31a5`.
- Final immutable URL: `https://6a628dd26376df07c04c31a5--shimmering-taiyaki-96e964.netlify.app`.
- Rollback procedure: in Netlify Deploys, select deploy `6a615c353cfc04f0b11de3b5` and publish it; CLI/API operators may call Netlify’s `restoreSiteDeploy` operation with the linked site ID and that deploy ID. IDs/tokens must be supplied from local authenticated state, never committed.

## Pre-Deployment Live Baseline

Captured before release:

| URL | Result |
|---|---|
| `https://regulusautomation.ca/` | 200; Netlify; TLS verified; canonical apex; old homepage content hash represented by ETag `9l8brduxbo2xlx`. |
| `https://regulusautomation.ca/robots.txt` | 200. |
| `https://regulusautomation.ca/sitemap.xml` | 200; 22 URLs; new automation, industries, and insights routes absent. |
| `http://regulusautomation.ca/` | 301 to apex HTTPS. |
| `https://www.regulusautomation.ca/` | 301 to apex HTTPS. |
| `http://www.regulusautomation.ca/` | 301 to HTTPS `www`, then 301 to apex HTTPS. |

DNS resolved apex to Netlify load-balancer addresses and `www` to the linked Netlify hostname. TLS verification result was zero (valid) for apex and `www`.

## Final Live Verification

- Generated routes: 44, including framework assets/metadata and dynamic expansions.
- Public sitemap HTML URLs: 36.
- Sitemap/title uniqueness: 36/36.
- Metadata: description, canonical, Open Graph, and Twitter card present on every sitemap URL.
- H1: exactly one on every sitemap URL.
- JSON-LD: parseable on all pages. Representative types: `Organization`, `WebSite`, `Service`, `BreadcrumbList`, and `Article`.
- Internal links: 41 discovered; no broken internal page links in the full sitemap crawl.
- Missing requests/console errors: zero on the representative mobile/desktop browser matrix.
- Nonexistent path: genuine 404.
- Robots: 200, canonical sitemap reference, public production crawl allowed, APIs/private paths disallowed.
- Preview logic: a `CONTEXT=deploy-preview` production build was served locally and verified to emit both blanket `Disallow: /` and homepage `noindex, nofollow`. Netlify `branch-deploy` and Vercel preview use the same non-indexable logic. The final immutable URL is a production release, not a preview.
- Host behavior: apex HTTPS preferred; HTTP permanent redirect; `www` permanent redirect; no loops.
- Mobile overflow: one homepage overflow defect was found after the first deployment, fixed in `dfc9bf0`, redeployed, and rechecked at 390 px (`scrollWidth === clientWidth === 390`).
- Contact: page and form render; public email is a mailto flow. No synthetic form was submitted to a real recipient.

### Final Production Lighthouse

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Homepage | 93 | 98 | 100 | 100 |
| Automation Opportunity Audit | 100 | 100 | 100 | 100 |
| Medical, Dental & Aesthetic Clinics | 96 | 100 | 100 | 100 |
| Workflow-selection insight | 100 | 100 | 100 | 100 |

These are synthetic Lighthouse results, not real-user Core Web Vitals.

## Search-Engine Admission Boundary

- Google: an apex Google verification TXT record is present. This is evidence of a verification token, not proof that the current operator account owns a Search Console Domain property.
- Google sitemap submission: not performed; authenticated Search Console access unavailable.
- Google priority URL inspection/indexing requests: not performed; authenticated Search Console access unavailable.
- Bing ownership, sitemap, URL submission, and site scan: not performed; no authenticated Bing surface or verification signal was available.
- Indexing, ranking, search traffic, and conversions: not yet observable from available evidence.

## Kernel Reduction

### Δ — Distinctions

Local implementation, Git integration, live deployment, crawlability, search-engine submission, indexing, ranking, traffic, and conversion are separate states with separate evidence.

### Constraints

Only the focused SEO change may enter production; unrelated Ahura/LAB work remains excluded. Search-engine account actions cannot be claimed without authenticated evidence. Deployment remains reversible through an immutable Netlify deploy.

### σ — Selections

`main`, Netlify, apex HTTPS, deploy `6a628dd26376df07c04c31a5`, 36 public sitemap URLs, and explicit BLOCKED account admissions are the surviving operational selections.

### Minimal Representation

Focused SEO code is merged and live; crawl validation passes; Google/Bing account submission and analytics activation remain blocked by external authenticated authority.

## Provenance

- Authority: user instruction “REGULUS AUTOMATION — SEO PRODUCTION RELEASE AND SEARCH-ENGINE ADMISSION”.
- Repository: `origin/main`, release branch `release/regulus-seo-v1`.
- Source commits: `142c9f2`, `5033fb5`, `dfc9bf0`.
- Runtime evidence: Netlify deploy API/CLI, DNS resolution, live HTTP crawl, Microsoft Edge/Playwright checks, Lighthouse 13.4.1.
