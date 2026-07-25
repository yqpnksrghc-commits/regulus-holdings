/**
 * Maintainer notification for qualified receptionist leads (server-only).
 *
 * Guarantees (Phase 1 — close the revenue loop):
 *   - Fires ONLY after a lead is durably persisted (caller invokes it after
 *     saveConversation + persistLead succeed and record.lead_id is set).
 *   - Idempotent: a given lead is notified at most once — a durable marker in
 *     the lead store records SENT, and a second call short-circuits.
 *   - Retries transient failures with bounded, backed-off attempts.
 *   - Logs delivery status durably (notification marker + lead.notification_status).
 *   - Never throws and never affects lead creation — the lead already exists
 *     before this runs; any failure here is contained.
 *   - Configuration is environment-only.
 */
import { getStore } from "@netlify/blobs";
import type { ConversationRecord } from "@/lib/receptionist/schema";

const LEAD_STORE = "regulus-inbound-leads";
const MAX_ATTEMPTS = 3;
const PER_ATTEMPT_TIMEOUT_MS = 1500;
const BACKOFF_MS = [200, 500];

export type NotifyStatus = "SENT" | "FAILED" | "NOT_CONFIGURED" | "SKIPPED_DUPLICATE";

export type WebhookConfig = { url: string; token: string };

export function webhookConfig(env: NodeJS.ProcessEnv = process.env): WebhookConfig {
  return {
    url: env.RECEPTIONIST_NOTIFICATION_WEBHOOK_URL || env.LEAD_NOTIFICATION_WEBHOOK_URL || "",
    token: env.RECEPTIONIST_NOTIFICATION_WEBHOOK_TOKEN || env.LEAD_NOTIFICATION_WEBHOOK_TOKEN || "",
  };
}

/** The notification payload. Pure — safe to unit test. Carries no secrets/PII beyond ids + contact-of-record. */
export function buildPayload(record: ConversationRecord) {
  return {
    event: "regulus.receptionist.lead",
    recipient: "info@regulusautomation.ca",
    conversation_id: record.conversation_id,
    lead_id: record.lead_id,
    lead_pipeline_state: record.lead_pipeline_state,
    state: record.state,
    follow_up_required: record.follow_up_required,
    human_takeover: record.human_takeover,
    source_page: record.source_page,
    at: new Date().toISOString(),
  };
}

/** Minimal fetch surface so tests can inject a transport. */
export type FetchLike = (url: string, init: Record<string, unknown>) => Promise<{ ok: boolean; status: number }>;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Deliver with bounded retry. PURE with respect to persistence (no Blobs) so it
 * is fully unit-testable via an injected `fetchImpl`. Returns the terminal
 * status and the number of attempts made.
 */
export async function deliverWithRetry(
  cfg: WebhookConfig,
  payload: unknown,
  opts: { fetchImpl?: FetchLike; attempts?: number; timeoutMs?: number; backoff?: number[]; sleepImpl?: (ms: number) => Promise<void> } = {},
): Promise<{ status: "SENT" | "FAILED" | "NOT_CONFIGURED"; attempts: number }> {
  if (!cfg.url) return { status: "NOT_CONFIGURED", attempts: 0 };
  const doFetch: FetchLike = opts.fetchImpl ?? ((url, init) => fetch(url, init) as unknown as Promise<{ ok: boolean; status: number }>);
  const wait = opts.sleepImpl ?? sleep;
  const maxAttempts = opts.attempts ?? MAX_ATTEMPTS;
  const timeoutMs = opts.timeoutMs ?? PER_ATTEMPT_TIMEOUT_MS;
  const backoff = opts.backoff ?? BACKOFF_MS;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cfg.token) headers.Authorization = `Bearer ${cfg.token}`;

  let attempts = 0;
  for (let i = 0; i < maxAttempts; i++) {
    attempts++;
    try {
      const res = await doFetch(cfg.url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) return { status: "SENT", attempts };
    } catch {
      /* network/timeout — fall through to backoff + retry */
    }
    if (i < maxAttempts - 1) await wait(backoff[Math.min(i, backoff.length - 1)]);
  }
  return { status: "FAILED", attempts };
}

/**
 * Idempotently notify for a qualified lead and log the outcome. Never throws.
 * Must be called only after the lead + conversation are durably saved.
 */
export async function notifyLead(record: ConversationRecord, env: NodeJS.ProcessEnv = process.env): Promise<NotifyStatus> {
  const cfg = webhookConfig(env);
  if (!cfg.url) return "NOT_CONFIGURED";
  if (!record.lead_id) return "NOT_CONFIGURED";

  const store = getStore({ name: LEAD_STORE, consistency: "strong" });
  const markerKey = `notifications/${record.lead_id}`;

  // Idempotency: if we already delivered for this lead, do not send again.
  try {
    const existing = (await store.get(markerKey, { type: "json" }).catch(() => null)) as { status?: string } | null;
    if (existing?.status === "SENT") return "SKIPPED_DUPLICATE";
  } catch {
    /* marker unreadable — proceed; a duplicate send is preferable to a missed lead */
  }

  const { status, attempts } = await deliverWithRetry(cfg, buildPayload(record));

  // Durable delivery log (marker) + best-effort patch of the lead record.
  const at = new Date().toISOString();
  try {
    await store.setJSON(markerKey, { status, attempts, at, conversation_id: record.conversation_id });
  } catch {
    /* logging failure must not surface */
  }
  try {
    const lead = (await store.get(`leads/${record.lead_id}`, { type: "json" }).catch(() => null)) as Record<string, unknown> | null;
    if (lead) {
      lead.notification_status = status;
      lead.notified_at = status === "SENT" ? at : lead.notified_at ?? null;
      await store.setJSON(`leads/${record.lead_id}`, lead);
    }
  } catch {
    /* best effort */
  }
  return status === "NOT_CONFIGURED" ? "NOT_CONFIGURED" : status;
}
