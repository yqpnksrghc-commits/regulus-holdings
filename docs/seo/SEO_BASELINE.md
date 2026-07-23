# SEO Baseline

Captured 2026-07-23 from the pre-change Next.js production build at commit `c1c312a`.
HTTP status is the expected build/server status; no production crawl or indexing claim is made.
All indexable pages had one H1, a canonical, a description, and `index,follow`. Every page emitted
the site-wide Organization JSON-LD; no page-specific Service, Breadcrumb, Article, or WebSite
schema existed. Internal-link counts include repeated header/footer links.

| URL | Status | Title | Description | Canonical | H1 | Links | Purpose / intended intent |
|---|---:|---|---|---|---|---:|---|
| `/` | 200 | Regulus Automation Inc. — Recovering Value. Building Intelligence. | Ontario service-business lead recovery | apex | Recovering Value. Building Intelligence. | 55 | Brand and commercial introduction |
| `/automation` | 200 | Automation Services | Practical lead-response and follow-up automation | self | Turn more inquiries into accountable next actions. | 39 | Automation services |
| `/automation/ai-receptionist` | 200 | AI Receptionist | Measured inquiry first response | self | AI Receptionist | 35 | AI receptionist |
| `/automation/missed-lead-recovery` | 200 | Missed Lead Recovery | Unanswered-call follow-up | self | Missed Lead Recovery | 35 | Missed-lead recovery |
| `/automation/appointment-automation` | 200 | Appointment Automation | Appointment-request workflow | self | Appointment Automation | 35 | Appointment automation |
| `/automation/follow-up-automation` | 200 | Follow-Up Automation | Follow-up ownership and status | self | Follow-Up Automation | 35 | Follow-up automation |
| `/solutions` | 200 | Solutions | Ten applied-intelligence domains | self | Ten domains of applied intelligence. | 45 | Intelligence-domain overview |
| `/solutions/automation-intelligence` | 200 | Automation Intelligence | Repetitive-work analysis | self | Automation Intelligence | 38 | Research/positioning |
| `/solutions/corporate-intelligence` | 200 | Corporate Intelligence | Organizational operating model | self | Corporate Intelligence | 38 | Research/positioning |
| `/solutions/decision-intelligence` | 200 | Decision Intelligence | Structured decision support | self | Decision Intelligence | 38 | Research/positioning |
| `/solutions/discovery-intelligence` | 200 | Discovery Intelligence | Opportunity discovery | self | Discovery Intelligence | 38 | Research/positioning |
| `/solutions/energy-intelligence` | 200 | Energy Intelligence | Evidence-first energy analysis | self | Energy Intelligence | 38 | Research direction |
| `/solutions/financial-intelligence` | 200 | Financial Intelligence | Capital-system analysis | self | Financial Intelligence | 38 | Research/positioning |
| `/solutions/infrastructure-intelligence` | 200 | Infrastructure Intelligence | Capacity recovery | self | Infrastructure Intelligence | 38 | Research direction |
| `/solutions/knowledge-intelligence` | 200 | Knowledge Intelligence | Connected institutional knowledge | self | Knowledge Intelligence | 38 | Knowledge systems |
| `/solutions/material-intelligence` | 200 | Material Intelligence | Material-flow recovery | self | Material Intelligence | 38 | Research direction |
| `/solutions/psychological-intelligence` | 200 | Psychological Intelligence | Consent-respecting team signals | self | Psychological Intelligence | 38 | Research direction |
| `/discovery` | 200 | Discovery Engine | Opportunity discovery system | self | Opportunity expires unseen… | 35 | Research/development |
| `/research` | 200 | Research | Evidence classification | self | Evidence first… | 35 | Research status |
| `/products` | 200 | Products | Shipping/development roadmap | self | Built to endure… | 35 | Product status |
| `/ahura-select-alpha` | 200 | Ahura Select Alpha | Private reviewer information | self | Ahura Select Alpha | 34 | Development-stage product |
| `/about` | 200 | About | Company, mission, founder | self | A company built to last generations. | 36 | Company information |
| `/philosophy` | 200 | Philosophy | Evidence and recovery doctrine | self | How we think, made explicit. | 35 | Trust/approach |
| `/careers` | 200 | Careers | Employment positioning | self | Build something worth keeping. | 35 | Careers |
| `/contact` | 200 | Free Automation Audit | Audit-fit request | self | Show us where a lead can stall. | 34 | Conversion |
| `/privacy` | 200 | Privacy | Privacy notice | self | Privacy | 34 | Legal |
| `/terms` | 200 | Terms | Website terms | self | Terms of Use | 34 | Legal |

`/ahura-select-alpha/invitations` was correctly `noindex,nofollow`; private Ahura/API routes were
not treated as public pages. The custom not-found build artifact contains one H1 and is expected to
return 404 at runtime.

## Findings

- Root layout emitted a prohibited `meta keywords` tag.
- Titles were unique and descriptions present; commercial keyword/location legibility was limited.
- `/automation` was the only commercial hub; no audit-detail, industry, or insight architecture.
- Page-specific Service, Breadcrumb, Article, and WebSite structured data were absent.
- Organization JSON-LD included a founding date that was not confirmed by visible public content.
- Sitemap lacked honest modification dates and the proposed commercial content.
- Robots allowed public assets and blocked some private routes, but did not block all `/api/` and
  private review routes.
- Homepage linked to industry labels that were not destinations.
- Only one public raster asset exists: `public/og.png`, 1200×630, approximately 27 KB. Site visuals
  are otherwise authored SVG/canvas; no inaccessible `<img>` elements were detected.
- No broken public internal link was identified by the existing validator.
- Production HTTPS and host redirects, live asset availability, redirect chains, Search Console,
  rankings, and search volume are **unknown** without deployment/account evidence.
