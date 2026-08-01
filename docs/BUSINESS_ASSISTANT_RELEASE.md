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

## Known limitations

1. **Pricing conflict, unresolved.** The change request specified offering a
   "CAD $500 prepaid Automation Opportunity Audit". The approved knowledge
   (`knowledge.ts`, sourced from `/free-audit`) states the audit is **CAD $0**,
   with optional implementation CAD $2,500–5,000 and management CAD $750–1,500/mo.
   The approved figure is used. Introducing a $500 price would contradict the
   published site and is a business decision, not an implementation detail.
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
