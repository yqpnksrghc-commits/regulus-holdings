# Regulus Business Assistant — release evidence

Replaces the website "Regulus AI Receptionist" with the Regulus Business
Assistant. Engine, conversation model, and mobile UI rebuilt.

## Deployment

| Item | Value |
| --- | --- |
| Production URL | https://regulusautomation.ca |
| Netlify account | Regulus (`info@regulusautomation.ca`) |
| Site | `shimmering-taiyaki-96e964` / `e740d4e2-e65f-46a0-bff0-a3f62905410c` |
| Deployed commits | `e9aea5a` (engine + UI), `3a55fc1` (handoff fix) |
| Deploy IDs | `6a6e7d602e885a00083fef4f`, `6a6e7efa8db5610008d40b76` |
| Workflow | push to `main` → Netlify Git integration builds and publishes |
| Previous production deploy | `6a68ef96dcc2db00087bf9be` at commit `8ffb285` |

No new site, plan change, paid add-on, or external service was introduced.

## Rollback

Fastest (no rebuild):

1. Netlify → project `shimmering-taiyaki-96e964` → **Deploys**
2. Select deploy `6a68ef96dcc2db00087bf9be` (commit `8ffb285`, 2026-07-28)
3. **Publish deploy**

From the CLI:

```powershell
netlify api restoreSiteDeploy --data '{"site_id":"e740d4e2-e65f-46a0-bff0-a3f62905410c","deploy_id":"6a68ef96dcc2db00087bf9be"}'
```

To roll back in Git instead (produces a new build):

```powershell
git revert --no-commit 3a55fc1 e9aea5a
git commit -m 'revert: business assistant'
git push origin HEAD:main
```

## Root cause of the previous assistant's failure

`response.ts` produced a fixed `directAnswer` + `context` pair for the
`clarify_request` goal. Only the trailing question rotated. The goal stayed
`clarify_request` because:

- `intent.ts` had no vocabulary for industries or business functions, so
  "Construction" and "Payroll" both classified as `intent: unknown`;
- `extraction.ts` required a problem-signal regex before setting
  `business_problem`, which a bare noun never matched;
- so `industry` and `business_problem` stayed null and the goal never advanced.

Reproduced on production before the change — four consecutive turns returned the
identical two paragraphs.

## What changed

- `src/lib/receptionist/domain-knowledge.ts` (new) — 5 industries, 8 workflows.
  Each carries workflow stages, a discriminating question, safe automation
  examples, an explicit contraindication, and required verification.
- `intent.ts` — falls back to the domain vocabulary before `unknown`.
- `extraction.ts` — recognizes industry, workflow, role, frequency, people,
  tools, consequence, process, outcome; stores normalized keys.
- `goal.ts` — interpretation goals run before qualification.
- `response-plan.ts` — carries explicit `question_text`; question selection
  falls through interpretive → field → workflow-stage probe, skipping anything
  already asked.
- `response.ts` — interpretation-driven composition; acknowledges the visitor's
  exact wording; never quotes text containing outcome-claim vocabulary.
- `conversation.ts` — records the hypothesis, confidence, and missing evidence;
  adds `buildLeadBrief`; lead creation no longer terminates the conversation.
- `Receptionist.tsx` — rebuilt (see below).

## Gates

| Gate | Result |
| --- | --- |
| Existing tests | 139 pass, 0 fail |
| 20 required scenarios | pass (`tests/business-assistant-scenarios.test.ts`) |
| Typecheck | pass |
| Lint | pass, 0 warnings |
| Production build | pass, 48/48 static pages |
| Horizontal overflow | 0 px at 320/375/390/430/768/900/1280/1440 |
| Send reachable, ≥44px | pass at all 8 widths |
| Composer overlaps log | false at all 8 widths |
| Console errors | none at any width |
| Secrets in HTML/bundles | none |
| localhost / mock refs | none |

Screenshots: `artifacts/responsive/assistant-<width>.png` (not committed).

## Persistence

Unchanged and reused, not replaced: `store.ts` writes conversations to the
`regulus-receptionist-conversations` Blobs store and creates leads through the
existing `createLeadRecord` gate into `regulus-inbound-leads` with
`pipeline_state: REVIEW_REQUIRED` and `origin: "receptionist"`.

Verified live: a human-handoff conversation on production returned
`lead_created: true` and `state: HUMAN_REQUESTED`.

Operator access is unchanged:

```powershell
npx tsx scripts/receptionist-admin.ts unread
npx tsx scripts/receptionist-admin.ts follow-ups
```

## Pricing change — CAD $0 → CAD $500 prepaid (2026-08-02)

Authorized by the owner. The free audit is retired everywhere; the offer is the
**Automation Opportunity Audit, CAD $500, prepaid**.

**No payment infrastructure was added.** The site takes no payment. The audit
request captures a qualified lead and states that a Regulus team member will
confirm scope and send a **secure payment link**. Nothing in the product claims a
payment was collected — `tests/pricing-consistency.test.ts` asserts this.

Canonical sources updated together so production cannot contradict itself:

| Surface | Change |
| --- | --- |
| `src/lib/commercial-services.ts` | service name + description; `engagementModel[0]` → "CAD $500, prepaid" |
| `src/lib/receptionist/knowledge.ts` | `APPROVED_PRICING.audit`, new `.payment`, `.note`, `APPROVED_DISCOVERY`, system prompt |
| `src/lib/receptionist/retrieval.ts` | `pricing.free_audit` → `pricing.audit` + `pricing.payment`; sources repointed |
| `src/lib/receptionist/response.ts` | pricing composition includes the payment boundary |
| `src/lib/receptionist/domain-knowledge.ts` | opportunity reflection offers free conversation **or** paid audit |
| `src/app/audit/page.tsx` | **new** public page (replaces `/free-audit`) |
| `src/lib/seo.ts` | `serviceJsonLd` publishes `offers.price` so structured data matches the page |
| `next.config.mjs` | `/free-audit` → `/audit` permanent (308); value-leakage redirect repointed |
| `src/app/sitemap.ts`, `src/lib/site.ts` | route + nav label |
| CTAs | Header ×2, Hero, business-systems ×2, home-services ×2, automation, automation/[slug], industries ×2, ArticleShell, ContactForm |
| Analytics | `free_audit_cta` → `audit_cta` (and `tests/leads.test.ts`) |

**URL change rationale:** a `/free-audit` URL selling a $500 audit is itself a
contradiction, so the page moved to `/audit` with a permanent 308 redirect —
inbound links, indexed pages, and printed references still resolve.

**Guard:** `tests/pricing-consistency.test.ts` scans all of `src/` and fails the
build if `CAD $0`, `/free-audit`, `free audit`, or the old service name reappears
anywhere. It also asserts the three commitments stay distinct (free exploratory
conversation / CAD $500 prepaid audit / separately priced implementation).

## Known limitations

1. ~~Pricing conflict, unresolved.~~ **Resolved 2026-08-02** — see "Pricing change"
   below. The audit is now CAD $500, prepaid, across every canonical source.
2. **Local end-to-end is not possible.** Netlify Blobs is unavailable outside the
   Netlify runtime, so `/api/receptionist` returns 503 locally. The responsive
   audit stubs the endpoint with the engine's real strings; conversation
   behaviour is covered by the engine tests and verified against production.
3. **Booking remains unconfigured.** No calendar provider is set, so booking
   always fails closed to `FOLLOW_UP_REQUIRED`. The assistant never claims a
   confirmed appointment.
4. **Test records exist in production.** Verification created conversations and
   at least one lead against `ian.jones679@icloud.com`. The admin tool can
   archive conversations; it has no lead-delete operation by design.
5. **Environment variables are not secret-scoped.** `LEAD_RATE_LIMIT_SALT`,
   `RECEPTIONIST_RATE_LIMIT_SALT`, `LEAD_NOTIFICATION_WEBHOOK_TOKEN`, and
   `LEAD_NOTIFICATION_WEBHOOK_URL` are stored as plain values and are readable
   via `netlify env:list --json`. They are server-only and never reach the
   browser, but they should be marked secret.
