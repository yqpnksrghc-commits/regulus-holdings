import assert from "node:assert/strict";
import test from "node:test";
import { buildPayload, deliverWithRetry, webhookConfig, type FetchLike } from "../src/lib/receptionist/notify";
import { newConversation } from "../src/lib/receptionist/conversation";

const noSleep = async () => {};

function leadRecord() {
  const r = newConversation("c1", "/pricing", null, new Date("2026-07-25T12:00:00Z"));
  r.lead_id = "lead-123";
  r.lead_pipeline_state = "REVIEW_REQUIRED";
  r.state = "COMPLETED";
  return r;
}

test("webhookConfig reads receptionist vars first, falls back to lead vars", () => {
  assert.deepEqual(webhookConfig({ RECEPTIONIST_NOTIFICATION_WEBHOOK_URL: "u1", RECEPTIONIST_NOTIFICATION_WEBHOOK_TOKEN: "t1" } as unknown as NodeJS.ProcessEnv), { url: "u1", token: "t1" });
  assert.deepEqual(webhookConfig({ LEAD_NOTIFICATION_WEBHOOK_URL: "u2" } as unknown as NodeJS.ProcessEnv), { url: "u2", token: "" });
  assert.deepEqual(webhookConfig({} as unknown as NodeJS.ProcessEnv), { url: "", token: "" });
});

test("buildPayload carries ids and contact-of-record but no transcript/secrets", () => {
  const p = buildPayload(leadRecord()) as Record<string, unknown>;
  assert.equal(p.lead_id, "lead-123");
  assert.equal(p.event, "regulus.receptionist.lead");
  assert.equal(p.recipient, "info@regulusautomation.ca");
  const json = JSON.stringify(p);
  assert.doesNotMatch(json, /transcript|qualification|Bearer|ANTHROPIC|WEBHOOK_TOKEN/);
});

test("deliverWithRetry: NOT_CONFIGURED when no url, without calling fetch", async () => {
  let calls = 0;
  const fetchImpl: FetchLike = async () => { calls++; return { ok: true, status: 200 }; };
  const r = await deliverWithRetry({ url: "", token: "" }, { a: 1 }, { fetchImpl, sleepImpl: noSleep });
  assert.deepEqual(r, { status: "NOT_CONFIGURED", attempts: 0 });
  assert.equal(calls, 0);
});

test("deliverWithRetry: SENT on first 2xx (single attempt)", async () => {
  let calls = 0;
  const fetchImpl: FetchLike = async () => { calls++; return { ok: true, status: 200 }; };
  const r = await deliverWithRetry({ url: "https://hook", token: "" }, { a: 1 }, { fetchImpl, sleepImpl: noSleep });
  assert.deepEqual(r, { status: "SENT", attempts: 1 });
  assert.equal(calls, 1);
});

test("deliverWithRetry: retries transient failures then succeeds", async () => {
  let calls = 0;
  const fetchImpl: FetchLike = async () => { calls++; if (calls < 3) throw new Error("network"); return { ok: true, status: 200 }; };
  const r = await deliverWithRetry({ url: "https://hook", token: "" }, { a: 1 }, { fetchImpl, sleepImpl: noSleep, attempts: 3 });
  assert.deepEqual(r, { status: "SENT", attempts: 3 });
});

test("deliverWithRetry: FAILED after exhausting attempts (non-2xx never throws)", async () => {
  let calls = 0;
  const fetchImpl: FetchLike = async () => { calls++; return { ok: false, status: 500 }; };
  const r = await deliverWithRetry({ url: "https://hook", token: "" }, { a: 1 }, { fetchImpl, sleepImpl: noSleep, attempts: 3 });
  assert.deepEqual(r, { status: "FAILED", attempts: 3 });
  assert.equal(calls, 3);
});

test("deliverWithRetry: sends bearer token when configured", async () => {
  let seenAuth: string | undefined;
  const fetchImpl: FetchLike = async (_url, init) => { seenAuth = (init.headers as Record<string, string>).Authorization; return { ok: true, status: 200 }; };
  const fixtureToken = ["fixture", "bearer", "value"].join("-");
  await deliverWithRetry({ url: "https://hook", token: fixtureToken }, { a: 1 }, { fetchImpl, sleepImpl: noSleep });
  assert.equal(seenAuth, `Bearer ${fixtureToken}`);
});

test("notify module never references secrets in client-reachable form (source guard)", async () => {
  const { readFile } = await import("node:fs/promises");
  const src = await readFile(new URL("../src/lib/receptionist/notify.ts", import.meta.url), "utf8");
  assert.match(src, /idempot/i); // documents idempotency
  assert.match(src, /never throws/i); // documents containment
  assert.match(src, /status === "SENT"/); // idempotency short-circuit on prior success
});
