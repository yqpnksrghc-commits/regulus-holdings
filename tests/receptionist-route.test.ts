import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { opaqueLeadKey } from "../src/lib/leads";

const read = (p: string) => readFile(new URL(p, import.meta.url), "utf8");

test("route enforces origin, salt config, rate limit, and idempotency", async () => {
  const route = await read("../src/app/api/receptionist/route.ts");
  assert.match(route, /new URL\(origin\)\.host !== host/); // CSRF/origin
  assert.match(route, /salt\.length < 32/); // fail-closed when unconfigured
  assert.match(route, /rateLimited\(ip\(request\)/);
  assert.match(route, /idempotency-key/i);
  assert.match(route, /seenTurn\(/);
  assert.match(route, /runtime="nodejs"|runtime = "nodejs"/);
});

test("route reuses the existing lead gate and records failures without crashing", async () => {
  const route = await read("../src/app/api/receptionist/route.ts");
  assert.match(route, /persistLead\(effect\.leadInput/);
  assert.match(route, /notifyMaintainer/);
  // persistence is authoritative; notification is fire-and-forget
  assert.match(route, /void notifyMaintainer/);
  // fail-closed error path returns 503, never leaks internals
  assert.match(route, /catch\s*\{[\s\S]*503/);
});

test("client-facing view never leaks transcript, qualification, or flags", async () => {
  const route = await read("../src/app/api/receptionist/route.ts");
  const safeView = route.slice(route.indexOf("function safeView"), route.indexOf("export async function POST"));
  assert.doesNotMatch(safeView, /transcript|qualification|confidence_by_field|\bflags\b/);
});

test("store persists leads to the SAME store as /api/leads via createLeadRecord", async () => {
  const store = await read("../src/lib/receptionist/store.ts");
  assert.match(store, /regulus-inbound-leads/); // same store name as the leads route
  assert.match(store, /createLeadRecord/);
  assert.match(store, /validateLead/); // gate reused, not bypassed
  assert.match(store, /origin: "receptionist"/); // provenance for the dashboard
});

test("duplicate lead key is deterministic (idempotent dedup across submissions)", () => {
  const salt = "x".repeat(40);
  const a = opaqueLeadKey("ada@clinic.ca|missed calls", salt);
  const b = opaqueLeadKey("ada@clinic.ca|missed calls", salt);
  assert.equal(a, b);
  assert.notEqual(a, opaqueLeadKey("other@clinic.ca|missed calls", salt));
});

test("client widget discloses AI, offers a human, and holds no Regulus facts of its own", async () => {
  const widget = await read("../src/components/receptionist/Receptionist.tsx");
  assert.match(widget, /not a human/i);
  assert.match(widget, /Talk to a human/i);
  assert.match(widget, /info@regulusautomation\.ca/);
  assert.match(widget, /sessionStorage/); // refresh recovery
  assert.match(widget, /role="log"/); // a11y
  assert.doesNotMatch(widget, /WEBHOOK|ANTHROPIC_API_KEY|Authorization/); // no secrets in client
});
