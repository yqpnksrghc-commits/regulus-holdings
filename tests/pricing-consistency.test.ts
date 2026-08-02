/**
 * Pricing consistency guard.
 *
 * The audit is CAD $500, prepaid. Production must not be able to contradict
 * itself: the canonical service data, the assistant's approved knowledge, the
 * public page, CTAs, navigation, and structured data all have to agree, and the
 * retired CAD $0 / "free audit" offer must not survive anywhere a visitor can
 * reach it.
 *
 * This is a source scan rather than a spot check, so a future edit that
 * reintroduces the free offer in any single place fails the build.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { APPROVED_PRICING, APPROVED_DISCOVERY, groundedAnswer } from "../src/lib/receptionist/knowledge";
import { commercialServices, engagementModel } from "../src/lib/commercial-services";

const SRC = fileURLToPath(new URL("../src", import.meta.url));

async function sourceFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await sourceFiles(full)));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

/**
 * The retired offer. Deliberately targets the OFFER, not the bare word "free" —
 * "FreeBusy" (calendar availability) and "risk-free" (a forbidden-claims guard)
 * are legitimate unrelated uses.
 */
const RETIRED_OFFER = [
  /CAD \$0/i,
  /\/free-audit/i,
  /free[_ -]audit/i,
  /Free Time (?:&|&amp;) Workflow Recovery Audit/i,
];

test("no retired CAD $0 / free-audit offer survives anywhere in src", async () => {
  const files = await sourceFiles(SRC);
  assert.ok(files.length > 50, "source scan found suspiciously few files");
  const offenders: string[] = [];
  for (const file of files) {
    const text = await readFile(file, "utf8");
    for (const pattern of RETIRED_OFFER) {
      if (pattern.test(text)) offenders.push(`${file.replace(SRC, "src")} :: ${pattern}`);
    }
  }
  assert.deepEqual(offenders, [], `retired free-audit offer still present:\n${offenders.join("\n")}`);
});

test("the /audit route exists and the /free-audit route is gone", async () => {
  const files = await sourceFiles(SRC);
  assert.ok(files.some((f) => f.endsWith(join("app", "audit", "page.tsx"))), "missing src/app/audit/page.tsx");
  assert.ok(!files.some((f) => f.includes(join("app", "free-audit"))), "src/app/free-audit still exists");
});

test("/free-audit permanently redirects to /audit so inbound links survive", async () => {
  const config = await readFile(new URL("../next.config.mjs", import.meta.url), "utf8");
  assert.match(config, /source:\s*"\/free-audit"/);
  assert.match(config, /destination:\s*"\/audit"/);
  assert.match(config, /permanent:\s*true/);
});

test("canonical service data states the CAD $500 prepaid audit", () => {
  const audit = commercialServices.find((s) => s.slug === "automation-opportunity-audit");
  assert.ok(audit, "audit service missing");
  assert.equal(audit.name, "Automation Opportunity Audit");
  assert.match(audit.description, /CAD \$500 prepaid/);
  assert.match(engagementModel[0].name, /CAD \$500, prepaid/);
});

test("assistant approved knowledge agrees with the canonical price", () => {
  assert.match(APPROVED_PRICING.audit, /CAD \$500, prepaid/);
  assert.match(APPROVED_DISCOVERY, /CAD \$500 prepaid/);
  const answer = groundedAnswer("pricing") ?? "";
  assert.match(answer, /CAD \$500/);
  assert.doesNotMatch(answer, /CAD \$0/);
});

test("the site takes no payment and never claims one was collected", () => {
  assert.match(APPROVED_PRICING.payment, /Payment is not taken on this website/i);
  assert.match(APPROVED_PRICING.payment, /secure payment link/i);
  const answer = groundedAnswer("pricing") ?? "";
  assert.doesNotMatch(answer, /payment (?:has been )?(?:received|collected|processed|successful)/i);
  assert.doesNotMatch(answer, /you have (?:been charged|paid)/i);
});

test("the exploratory conversation, the paid audit, and implementation stay distinct", () => {
  // Three separate commitments; conflating them is how a visitor gets misled.
  assert.match(APPROVED_DISCOVERY, /exploratory conversation/i);
  assert.match(APPROVED_DISCOVERY, /costs nothing and carries no obligation/i);
  assert.match(APPROVED_DISCOVERY, /Implementation and ongoing management are separate/i);
  assert.match(APPROVED_PRICING.note, /does not include implementation/i);
});

test("the public audit page publishes the price in copy and structured data", async () => {
  const page = await readFile(new URL("../src/app/audit/page.tsx", import.meta.url), "utf8");
  assert.match(page, /Automation Opportunity Audit/);
  assert.match(page, /CAD \$500/);
  assert.match(page, /price:\s*"500"/);
  assert.match(page, /priceCurrency:\s*"CAD"/);
  assert.match(page, /secure payment link/i);
  assert.doesNotMatch(page, /CAD \$0|free audit/i);
});
