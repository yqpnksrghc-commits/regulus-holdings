"use client";

/**
 * Sales-demo surface for the Regulus AI Receptionist.
 *
 * It runs the REAL receptionist workflow (via /api/receptionist-demo, which uses
 * the production engine) but keeps every side effect simulated and visible. The
 * browser owns the conversation record between turns; nothing is persisted. The
 * left column is the customer conversation; the right column reveals the
 * structured lead record, qualification outcome, required staff action, and the
 * simulated integration actions a production deployment would perform.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { DemoView } from "@/lib/receptionist/demo/session";
import type { ConversationRecord } from "@/lib/receptionist/schema";
import { DEMO_TENANT } from "@/lib/receptionist/demo/tenant";

type Msg = { role: "visitor" | "receptionist"; text: string };

const PROMPTS = [
  "I'd like to book a consultation",
  "What treatments do you offer?",
  "How much does it cost?",
  "Can I speak to a person?",
  "I need to change my appointment",
];

const OUTCOME_STYLES: Record<DemoView["outcome"], string> = {
  BOOKED: "text-emerald border-emerald/50 bg-emerald/15",
  QUALIFIED: "text-emerald border-emerald/40 bg-emerald/10",
  IN_PROGRESS: "text-accent border-accent/40 bg-accent/10",
  ESCALATED: "text-gold border-gold/40 bg-gold/10",
  OUT_OF_SCOPE: "text-dim border-line-2 bg-bg-2/60",
  SPAM: "text-dim border-line-2 bg-bg-2/60",
};

function useDemo() {
  const [record, setRecord] = useState<ConversationRecord | null>(null);
  const [view, setView] = useState<DemoView | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

  const post = useCallback(async (payload: Record<string, unknown>) => {
    const res = await fetch("/api/receptionist-demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { ok: boolean; view?: DemoView; record?: ConversationRecord; error?: string };
    if (!res.ok || !data.ok || !data.view) throw new Error(data.error || String(res.status));
    return data as { ok: true; view: DemoView; record: ConversationRecord };
  }, []);

  const start = useCallback(async () => {
    setStatus("sending");
    try {
      const data = await post({});
      setRecord(data.record);
      setView(data.view);
      setMessages([{ role: "receptionist", text: data.view.reply }]);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, [post]);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || status === "sending" || !record || view?.done) return;
      setMessages((m) => [...m, { role: "visitor", text: clean }]);
      setStatus("sending");
      try {
        const data = await post({ record, message: clean });
        setRecord(data.record);
        setView(data.view);
        setMessages((m) => [...m, { role: "receptionist", text: data.view.reply }]);
        setStatus("idle");
      } catch {
        setStatus("error");
      }
    },
    [post, record, status, view?.done],
  );

  const reset = useCallback(() => {
    setRecord(null);
    setView(null);
    setMessages([]);
    void start();
  }, [start]);

  useEffect(() => {
    void start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { view, messages, status, send, reset, done: Boolean(view?.done) };
}

export function DemoReceptionist() {
  const { view, messages, status, send, reset, done } = useDemo();
  const [input, setInput] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, status]);

  const submit = () => {
    void send(input);
    setInput("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* ---------------- Left: the customer conversation ---------------- */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-card">
        <header className="flex items-center justify-between gap-2 border-b border-line bg-bg-2/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-gold/30 to-gold/10 text-gold">✦</span>
            <div>
              <p className="text-sm font-semibold text-ink">{DEMO_TENANT.name}</p>
              <p className="text-xs text-dim">Virtual receptionist · automated, not a clinician</p>
            </div>
          </div>
          <button type="button" onClick={reset} className="rounded-md px-2 py-1 text-xs text-dim hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/40">
            Reset
          </button>
        </header>

        <div ref={logRef} role="log" aria-live="polite" aria-label="Demo conversation" className="flex min-h-[300px] flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "visitor" ? "self-end max-w-[85%]" : "self-start max-w-[92%]"}>
              <p className={m.role === "visitor" ? "rounded-2xl rounded-br-sm bg-ink px-3.5 py-2 text-sm text-bg" : "whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-bg-2 px-3.5 py-2 text-sm text-ink"}>
                {m.text}
              </p>
            </div>
          ))}
          {status === "sending" && <p className="self-start text-xs text-dim">Receptionist is responding…</p>}
          {status === "error" && (
            <p role="alert" className="self-start text-sm text-red-500">
              The demo hit a snag. <button type="button" onClick={reset} className="link-underline">Reset and try again</button>.
            </p>
          )}
          {done && <p className="self-start text-xs text-dim">This demo conversation is complete. Use “Reset” to start over.</p>}
        </div>

        {/* Quick prompts to make the demo effortless. */}
        {!done && (
          <div className="flex flex-wrap gap-2 border-t border-line px-3 pt-3">
            {PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => void send(p)}
                disabled={status === "sending"}
                className="rounded-full border border-line-2 bg-bg px-3 py-1 text-xs text-ink-soft transition-colors hover:border-gold/50 hover:text-ink disabled:opacity-40"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <div className="px-3 pb-3 pt-3">
          <div className="flex items-end gap-2">
            <label htmlFor="demo-input" className="sr-only">Type a message to the demo receptionist</label>
            <textarea
              id="demo-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
              }}
              disabled={done}
              rows={1}
              placeholder={done ? "Conversation complete — reset to try again" : "Type a message…"}
              className="max-h-28 min-h-[2.5rem] w-full resize-none rounded-xl border border-line-2 bg-bg px-3 py-2 text-sm text-ink placeholder:text-dim focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!input.trim() || status === "sending" || done}
              className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-bg disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-[0.7rem] leading-relaxed text-dim">
            Demonstration only. Please don’t enter real personal or health information — nothing here is stored or sent.
          </p>
        </div>
      </div>

      {/* ---------------- Right: the structured internals ---------------- */}
      <div className="flex flex-col gap-4">
        {/* Qualification outcome + staff action */}
        <div className="rounded-2xl border border-line bg-panel p-5 shadow-subtle">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-ink">Live qualification</h3>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${view ? OUTCOME_STYLES[view.outcome] : "text-dim border-line-2"}`}>
              {view?.outcome ?? "…"}
            </span>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <Field label="Conversation state" value={view?.state} />
            <Field label="Booking intent" value={boolLabel(view?.qualification.booking_intent)} />
            <Field label="Human requested" value={boolLabel(view?.qualification.human_requested)} />
            <Field label="Consent to follow up" value={boolLabel(view?.qualification.consent_to_follow_up)} />
          </dl>
          <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 px-3.5 py-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-gold">Required staff action</p>
            <p className="mt-1 text-sm text-ink-soft">{view?.staff_action ?? "—"}</p>
          </div>
        </div>

        {/* Structured lead record */}
        <div className="rounded-2xl border border-line bg-panel p-5 shadow-subtle">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">Structured lead record</h3>
            <span className="rounded-full border border-line-2 bg-bg-2/60 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-dim">Simulated</span>
          </div>
          {view?.lead ? (
            <dl className="mt-4 space-y-2 text-xs">
              <Row label="Name" value={view.lead.name} />
              <Row label="Contact" value={view.lead.email || view.qualification.phone || "—"} />
              <Row label="Interest" value={view.lead.value_leak_description} />
              <Row label="Pipeline state" value={view.lead.pipeline_state} mono />
              <Row label="Origin" value={view.lead.origin} mono />
              <Row label="Record ID" value={view.lead.lead_id} mono truncate />
            </dl>
          ) : (
            <p className="mt-4 text-sm text-dim">
              No lead yet. When the visitor shares a name and a contact detail along with what they’re interested in, a
              review-ready lead record appears here — identical in shape to a production lead.
            </p>
          )}
        </div>

        {/* Booking evidence (appears once a slot is confirmed) */}
        {(view?.booking || (view?.offered_slots?.length ?? 0) > 0) && (
          <div className="rounded-2xl border border-line bg-panel p-5 shadow-subtle">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">Booking</h3>
              <span className="rounded-full border border-line-2 bg-bg-2/60 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-dim">Simulated</span>
            </div>
            {view?.booking ? (
              <dl className="mt-4 space-y-2 text-xs">
                <Row label="Selected time" value={view.selected_slot?.label} />
                <Row label="Event ID" value={view.booking.event_identifier} mono truncate />
                <Row label="Creation status" value={view.booking.creation_status} mono />
                <Row label="Attendee" value={view.booking.attendee_contact} />
                <p className="pt-1 text-[0.7rem] text-dim">Durable-shaped evidence, fabricated for display. No real calendar event was created and no invite was sent.</p>
              </dl>
            ) : (
              <div className="mt-4 text-xs">
                <p className="text-dim">Verified times offered (generated in-memory, no calendar read):</p>
                <ul className="mt-2 space-y-1">
                  {view!.offered_slots.map((s) => (
                    <li key={s.slot_id} className="text-ink">• {s.label}</li>
                  ))}
                </ul>
                <p className="mt-2 text-[0.7rem] text-dim">Reply in the chat with a number to pick a time.</p>
              </div>
            )}
          </div>
        )}

        {/* Simulated integration actions */}
        <div className="rounded-2xl border border-line bg-panel p-5 shadow-subtle">
          <h3 className="text-sm font-semibold text-ink">Simulated actions</h3>
          {view && view.simulated_actions.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {view.simulated_actions.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald/15 text-[0.7rem] text-emerald">✓</span>
                  <div>
                    <p className="text-sm text-ink">{a.label}</p>
                    <p className="text-xs text-dim">{a.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-dim">Actions the receptionist would trigger in production appear here — each clearly marked as simulated.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-dim">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{value ?? "—"}</dd>
    </div>
  );
}

function Row({ label, value, mono, truncate }: { label: string; value?: string | null; mono?: boolean; truncate?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-dim">{label}</dt>
      <dd className={`text-right text-ink ${mono ? "font-mono text-[0.7rem]" : ""} ${truncate ? "max-w-[60%] truncate" : ""}`}>{value ?? "—"}</dd>
    </div>
  );
}

function boolLabel(v?: boolean | null): string {
  return v === true ? "Yes" : v === false ? "No" : "—";
}
