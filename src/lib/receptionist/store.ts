/**
 * Durable persistence for the receptionist (server-only).
 *
 * Conventions mirror src/app/api/leads and src/app/api/ahura exactly:
 *   - @netlify/blobs, strong consistency
 *   - privacy-safe hashed keys (node:crypto via opaqueLeadKey)
 *   - durable record is authoritative; notification is best-effort
 *
 * Leads created here are written to the SAME "regulus-inbound-leads" store using
 * the SAME createLeadRecord gate as /api/leads, so receptionist leads enter the
 * existing review/promotion pipeline (pipeline_state: REVIEW_REQUIRED) — the
 * gate is reused, never bypassed.
 */
import { getStore } from "@netlify/blobs";
import { createLeadRecord, opaqueLeadKey, validateLead, type LeadInput } from "@/lib/leads";
import type { ConversationRecord } from "@/lib/receptionist/schema";

const CONVO_STORE = "regulus-receptionist-conversations";
const LEAD_STORE = "regulus-inbound-leads";
const RATE_STORE = "regulus-receptionist-rate-limits";

export function receptionistSalt(): string {
  return process.env.RECEPTIONIST_RATE_LIMIT_SALT || process.env.LEAD_RATE_LIMIT_SALT || "";
}

export async function getConversation(id: string): Promise<ConversationRecord | null> {
  const store = getStore({ name: CONVO_STORE, consistency: "strong" });
  return (await store.get(`conversations/${id}`, { type: "json" }).catch(() => null)) as ConversationRecord | null;
}

export async function saveConversation(record: ConversationRecord): Promise<void> {
  const store = getStore({ name: CONVO_STORE, consistency: "strong" });
  await store.setJSON(`conversations/${record.conversation_id}`, record);
}

/** Per-IP hourly rate limit (5/hour), matching the leads route. */
export async function rateLimited(ip: string, salt: string, max = 20): Promise<boolean> {
  if (!ip || salt.length < 32) return false;
  const store = getStore({ name: RATE_STORE, consistency: "strong" });
  const bucket = Math.floor(Date.now() / 3_600_000);
  const key = `${bucket}:${opaqueLeadKey(ip, salt)}`;
  const old = (await store.get(key, { type: "json" }).catch(() => null)) as { count?: number } | null;
  if ((old?.count || 0) >= max) return true;
  await store.setJSON(key, { count: (old?.count || 0) + 1 });
  return false;
}

/** Idempotency for a single message turn within a conversation. */
export async function seenTurn(conversationId: string, idempotencyKey: string, salt: string): Promise<boolean> {
  if (!idempotencyKey) return false;
  const store = getStore({ name: CONVO_STORE, consistency: "strong" });
  const key = `turns/${conversationId}/${opaqueLeadKey(idempotencyKey, salt || "receptionist-turn")}`;
  if (await store.get(key)) return true;
  await store.set(key, "1");
  return false;
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

/** Best-effort maintainer notification. Durable record remains authoritative. */
export async function notifyMaintainer(record: ConversationRecord): Promise<"SENT" | "FAILED" | "NOT_CONFIGURED"> {
  const url = process.env.RECEPTIONIST_NOTIFICATION_WEBHOOK_URL || process.env.LEAD_NOTIFICATION_WEBHOOK_URL;
  if (!url) return "NOT_CONFIGURED";
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.RECEPTIONIST_NOTIFICATION_WEBHOOK_TOKEN || process.env.LEAD_NOTIFICATION_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${process.env.RECEPTIONIST_NOTIFICATION_WEBHOOK_TOKEN || process.env.LEAD_NOTIFICATION_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        event: "regulus.receptionist.conversation",
        recipient: "info@regulusautomation.ca",
        conversation_id: record.conversation_id,
        state: record.state,
        lead_id: record.lead_id,
        follow_up_required: record.follow_up_required,
        human_takeover: record.human_takeover,
      }),
      signal: AbortSignal.timeout(5000),
    });
    return "SENT";
  } catch {
    return "FAILED";
  }
}
