import { randomUUID } from "node:crypto";
import { GREETING_MESSAGE, newConversation, processVisitorTurn } from "@/lib/receptionist/conversation";
import { sanitize, MAX_TURNS } from "@/lib/receptionist/injection";
import { selectModel } from "@/lib/receptionist/model";
import { selectCalendar } from "@/lib/receptionist/calendar";
import { notifyLead } from "@/lib/receptionist/notify";
import { getConversation, persistLead, rateLimited, receptionistSalt, recordTurn, saveConversation, seenTurn } from "@/lib/receptionist/store";
import { isTerminal } from "@/lib/receptionist/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" };
const ip = (r: Request) => r.headers.get("x-nf-client-connection-ip") || r.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });

type Body = { conversation_id?: unknown; message?: unknown; source_page?: unknown; campaign?: unknown };

/** Client-facing safe projection — never leaks transcript, qualification, or flags. */
function safeView(record: Awaited<ReturnType<typeof getConversation>>, reply: string, extra: Record<string, unknown> = {}) {
  return {
    ok: true,
    conversation_id: record!.conversation_id,
    state: record!.state,
    reply,
    done: isTerminal(record!.state),
    follow_up_required: record!.follow_up_required,
    human_takeover: record!.human_takeover,
    ...extra,
  };
}

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

  const salt = receptionistSalt();
  if (salt.length < 32) return json({ ok: false, error: "Receptionist service is not configured." }, 503);

  const sourcePage = sanitize(body.source_page).slice(0, 300) || null;
  const campaign = sanitize(body.campaign).slice(0, 300) || null;
  const now = new Date();

  try {
    // Rate limit touches Blobs, so it must be inside the fail-closed guard.
    if (await rateLimited(ip(request), salt)) return json({ ok: false, error: "Please try again in a moment." }, 429);

    // START: no conversation id -> create + greet. Deterministic, no model call.
    if (!body.conversation_id || typeof body.conversation_id !== "string") {
      const record = newConversation(randomUUID(), sourcePage, campaign, now);
      await saveConversation(record);
      return json(safeView(record, GREETING_MESSAGE));
    }

    const id = body.conversation_id.slice(0, 60);
    const record = await getConversation(id);
    if (!record) return json({ ok: false, error: "Conversation not found." }, 404);
    if (isTerminal(record.state)) return json(safeView(record, "This conversation has been handed to the Regulus team. Email info@regulusautomation.ca anytime."));
    if (record.transcript.length >= MAX_TURNS) {
      record.state = "COMPLETED";
      await saveConversation(record);
      return json(safeView(record, "Thanks — I'll pass this to the Regulus team to continue. You can also email info@regulusautomation.ca."));
    }

    // Idempotent message replay protection.
    const idem = request.headers.get("idempotency-key")?.slice(0, 100) || "";
    if (idem && (await seenTurn(id, idem, salt))) {
      return json(safeView(record, record.transcript.filter((t) => t.role === "receptionist").at(-1)?.text ?? "", { replay: true }));
    }

    const model = selectModel();
    const { record: next, reply, effect } = await processVisitorTurn(record, body.message, model, { now, booking: selectCalendar() });

    if (effect.kind === "create_lead") {
      const result = await persistLead(effect.leadInput, salt);
      if ("lead_id" in result) {
        next.lead_id = result.lead_id;
        next.lead_pipeline_state = result.pipeline_state;
        if (result.duplicate) next.duplicate_of = result.lead_id;
      } else {
        next.error = result.error;
        next.flags.push(`lead_effect_failed:${result.error}`);
      }
    }

    await saveConversation(next);
    // Idempotency marker is written ONLY after the durable save, so a mid-turn
    // failure never marks a turn "seen" without persisting its result.
    if (idem) await recordTurn(id, idem, salt);
    // Notify AFTER persistence, only for a qualified (lead-bearing) turn. Idempotent,
    // retried, delivery-status logged, and fully contained — a lead already exists.
    if (next.lead_id) await notifyLead(next);

    return json(safeView(next, reply, { lead_created: Boolean(next.lead_id) }));
  } catch {
    return json({ ok: false, error: "We couldn't process that. Please try again, or email info@regulusautomation.ca." }, 503);
  }
}
