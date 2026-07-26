/**
 * Demo receptionist endpoint — STATELESS sandbox for the sales demo.
 *
 * It mirrors the production client/route split (a browser component posts here,
 * exactly like src/components/receptionist/Receptionist.tsx posts to
 * /api/receptionist) but with hard differences that keep it isolated:
 *
 *   1. It stores NOTHING. The browser holds the conversation record and sends it
 *      back each turn. No Blobs read/write, no rate store, no leads store.
 *   2. It never imports src/lib/receptionist/store.ts, notify.ts, calendar/index.ts,
 *      calendar/google.ts, or @netlify/blobs — so it structurally cannot persist a
 *      lead, save a conversation, fire a notification, or touch a real calendar.
 *   3. Every side effect is simulated and returned for display (see demo/session).
 *
 * The engine, extraction, validation, injection guards, state machine, and the
 * two-step booking loop are the real production modules, unchanged.
 */
import { randomUUID } from "node:crypto";
import { runDemoTurn, startDemoSession } from "@/lib/receptionist/demo/session";
import { newConversation } from "@/lib/receptionist/conversation";
import { sanitize, MAX_TURNS } from "@/lib/receptionist/injection";
import { CONVERSATION_STATES, type ConversationRecord } from "@/lib/receptionist/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });

/** Rebuild a trusted ConversationRecord from a client-sent one. Only the demo
 *  runs this, and it persists nothing, so we accept the client's record but
 *  re-shape it defensively so a malformed body can never crash the engine. The
 *  fresh skeleton supplies defaults for any missing (e.g. new-schema) field. */
function coerceRecord(input: unknown): ConversationRecord | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;
  if (typeof r.conversation_id !== "string") return null;
  if (!CONVERSATION_STATES.includes(r.state as ConversationRecord["state"])) return null;
  if (!Array.isArray(r.transcript)) return null;
  const skeleton = newConversation(r.conversation_id.slice(0, 60), "/ai-receptionist-demo", null, new Date());
  return { ...skeleton, ...(r as Partial<ConversationRecord>), conversation_id: skeleton.conversation_id } as ConversationRecord;
}

type Body = { record?: unknown; message?: unknown };

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return json({ ok: false, error: "Invalid request origin." }, 403);

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const now = new Date();

  // START: no record -> greet deterministically, no model call.
  if (!body.record) {
    const { record, view } = startDemoSession(now, randomUUID());
    return json({ ok: true, view, record });
  }

  const record = coerceRecord(body.record);
  if (!record) return json({ ok: false, error: "Invalid conversation." }, 400);
  if (record.transcript.length >= MAX_TURNS) {
    return json({ ok: false, error: "This demo conversation has reached its length limit. Reset to try another." }, 409);
  }

  // sanitize() also runs inside the engine; calling here keeps parity with the
  // production route and rejects empty input early.
  if (!sanitize(body.message)) return json({ ok: false, error: "Please type a message." }, 400);

  try {
    const { record: next, view } = await runDemoTurn(record, body.message, now);
    return json({ ok: true, view, record: next });
  } catch {
    return json({ ok: false, error: "The demo hit a snag. Please reset and try again." }, 500);
  }
}
