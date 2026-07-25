/**
 * Durable persistence for the receptionist (server-only).
 *
 * Conventions mirror src/app/api/leads and src/app/api/ahura exactly:
 *   - @netlify/blobs, strong consistency
 *   - privacy-safe hashed keys (node:crypto via opaqueLeadKey)
 *   - durable record is authoritative; notification is best-effort (see notify.ts)
 *
 * Leads created here are written to the SAME "regulus-inbound-leads" store using
 * the SAME createLeadRecord gate as /api/leads, so receptionist leads enter the
 * existing review/promotion pipeline (pipeline_state: REVIEW_REQUIRED) — the
 * gate is reused, never bypassed.
 */
import { getStore } from "@netlify/blobs";
import { createLeadRecord, opaqueLeadKey, validateLead, type LeadInput } from "@/lib/leads";
import { isTerminal, type ConversationRecord } from "@/lib/receptionist/schema";

const CONVO_STORE = "regulus-receptionist-conversations";
const LEAD_STORE = "regulus-inbound-leads";
const RATE_STORE = "regulus-receptionist-rate-limits";

/** Per-IP hourly request ceiling. Soft safeguard, not an auth control. */
export const RATE_LIMIT_PER_HOUR = 20;

export function receptionistSalt(): string {
  return process.env.RECEPTIONIST_RATE_LIMIT_SALT || process.env.LEAD_RATE_LIMIT_SALT || "";
}

function convoStore() {
  return getStore({ name: CONVO_STORE, consistency: "strong" });
}

export async function getConversation(id: string): Promise<ConversationRecord | null> {
  return (await convoStore().get(`conversations/${id}`, { type: "json" }).catch(() => null)) as ConversationRecord | null;
}

export async function saveConversation(record: ConversationRecord): Promise<void> {
  await convoStore().setJSON(`conversations/${record.conversation_id}`, record);
}

/**
 * Per-IP hourly rate limit (default {@link RATE_LIMIT_PER_HOUR}/hour).
 *
 * Atomic under concurrency: the counter is incremented with an optimistic
 * compare-and-set (etag `onlyIfMatch`, or `onlyIfNew` for the first write). If a
 * concurrent request wins the race the CAS reports `modified: false` and we
 * re-read and retry, so two simultaneous requests can never both read the same
 * count and each write count+1. Fails OPEN (never blocks a legitimate visitor)
 * if the counter can't be settled after a bounded number of attempts.
 */
export async function rateLimited(ip: string, salt: string, max = RATE_LIMIT_PER_HOUR): Promise<boolean> {
  if (!ip || salt.length < 32) return false;
  const store = getStore({ name: RATE_STORE, consistency: "strong" });
  const bucket = Math.floor(Date.now() / 3_600_000);
  const key = `${bucket}:${opaqueLeadKey(ip, salt)}`;
  for (let attempt = 0; attempt < 5; attempt++) {
    const current = await store.getWithMetadata(key, { type: "json" }).catch(() => null);
    const count = ((current?.data as { count?: number } | undefined)?.count) ?? 0;
    if (count >= max) return true;
    try {
      const res = current?.etag
        ? await store.setJSON(key, { count: count + 1 }, { onlyIfMatch: current.etag })
        : await store.setJSON(key, { count: count + 1 }, { onlyIfNew: true });
      if (res.modified) return false; // won the CAS
    } catch {
      /* transient write error — retry with a fresh read */
    }
    // Lost the race (modified === false) or transient error: re-read and retry.
  }
  return false; // could not settle — fail open rather than wrongly block
}

/**
 * Read-only idempotency check for a single message turn. Returns true when this
 * turn has already been durably processed. The write half is {@link recordTurn},
 * called ONLY after the conversation is durably saved — so a mid-turn failure
 * never marks a turn "seen" without persisting its result (which would otherwise
 * make a legitimate retry replay a stale reply and silently drop the message).
 */
export async function seenTurn(conversationId: string, idempotencyKey: string, salt: string): Promise<boolean> {
  if (!idempotencyKey) return false;
  const key = `turns/${conversationId}/${opaqueLeadKey(idempotencyKey, salt || "receptionist-turn")}`;
  return Boolean(await convoStore().get(key).catch(() => null));
}

/** Persist the idempotency marker for a turn. Call AFTER saveConversation. */
export async function recordTurn(conversationId: string, idempotencyKey: string, salt: string): Promise<void> {
  if (!idempotencyKey) return;
  const key = `turns/${conversationId}/${opaqueLeadKey(idempotencyKey, salt || "receptionist-turn")}`;
  await convoStore().set(key, "1").catch(() => {});
}

export type LeadPersistResult = { lead_id: string; pipeline_state: string; duplicate: boolean } | { error: string };

/**
 * Persist a lead through the EXISTING gate. Returns the lead id + pipeline
 * state, or a duplicate marker, or an error — the caller records the outcome
 * on the conversation. Never throws to the request path.
 */
export async function persistLead(input: LeadInput, salt: string): Promise<LeadPersistResult> {
  const v = validateLead(input);
  if (!v.ok || v.bot) return { error: v.bot ? "lead_rejected_bot" : "lead_invalid" };
  try {
    const store = getStore({ name: LEAD_STORE, consistency: "strong" });
    const dupKey = opaqueLeadKey(`${v.value.email}|${v.value.value_leak_description}`, salt);
    const prior = await store.get(`duplicates/${dupKey}`, { type: "text" });
    if (prior) return { lead_id: prior, pipeline_state: "REVIEW_REQUIRED", duplicate: true };
    const record = createLeadRecord(v.value);
    // Mark provenance so the dashboard can distinguish receptionist-origin leads.
    const enriched = { ...record, origin: "receptionist" as const };
    await store.setJSON(`leads/${record.lead_id}`, enriched);
    await store.set(`duplicates/${dupKey}`, record.lead_id);
    return { lead_id: record.lead_id, pipeline_state: record.pipeline_state, duplicate: false };
  } catch {
    return { error: "lead_store_unavailable" };
  }
}

// ---------------------------------------------------------------------------
// Retention / archival. Terminal conversations are moved to an `archived/`
// prefix (and their per-turn idempotency markers removed) so the hot
// `conversations/` prefix stays bounded. Callable from the operator CLI.
// ---------------------------------------------------------------------------

/** List blob keys under a prefix in the conversation store. */
export async function listConvoKeys(prefix: string): Promise<string[]> {
  const { blobs } = await convoStore().list({ prefix });
  return blobs.map((b) => b.key);
}

/** Move one conversation to the `archived/` prefix and delete its turn markers. */
export async function archiveConversation(id: string): Promise<boolean> {
  const store = convoStore();
  const rec = (await store.get(`conversations/${id}`, { type: "json" }).catch(() => null)) as ConversationRecord | null;
  if (!rec) return false;
  await store.setJSON(`archived/${id}`, rec);
  await store.delete(`conversations/${id}`).catch(() => {});
  const { blobs } = await store.list({ prefix: `turns/${id}/` });
  for (const b of blobs) await store.delete(b.key).catch(() => {});
  return true;
}

/**
 * Retention sweep: archive every terminal conversation whose last update is
 * older than `days`. Returns the archived conversation ids. Pure-ish (time is
 * injected) so it is deterministic under test.
 */
export async function archiveTerminalOlderThan(days: number, now = Date.now()): Promise<{ archived: string[] }> {
  const cutoff = now - days * 86_400_000;
  const store = convoStore();
  const { blobs } = await store.list({ prefix: "conversations/" });
  const archived: string[] = [];
  for (const b of blobs) {
    const rec = (await store.get(b.key, { type: "json" }).catch(() => null)) as ConversationRecord | null;
    if (!rec) continue;
    if (isTerminal(rec.state) && Number.isFinite(Date.parse(rec.updated_at)) && Date.parse(rec.updated_at) < cutoff) {
      if (await archiveConversation(rec.conversation_id)) archived.push(rec.conversation_id);
    }
  }
  return { archived };
}
