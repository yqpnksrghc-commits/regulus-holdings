"use client";

/**
 * Regulus Business Assistant — website chat interface.
 *
 * Layout contract (the previous version failed all of these on mobile):
 *   - The panel is a full-height sheet below `sm`, a docked card above it. It is
 *     sized with dvh + safe-area insets so the iOS URL bar and home indicator
 *     never cover the composer.
 *   - Every element is width-constrained to its container and wraps long words,
 *     so nothing can push the page into horizontal overflow.
 *   - The composer is a flex row whose controls never shrink below a 44px tap
 *     target, and the log scrolls independently above it — the composer cannot
 *     cover conversation content.
 *   - Auto-scroll only happens when the visitor is already at the bottom, so
 *     scrolling back to re-read earlier messages is not fought by new replies.
 *
 * All content facts come from the server (approved knowledge); this component
 * asserts nothing about Regulus.
 */
import { useCallback, useEffect, useRef, useState } from "react";

type Msg = { role: "visitor" | "assistant"; text: string };
type Stored = { conversationId: string | null; messages: Msg[]; done: boolean };

const STORAGE_KEY = "regulus-business-assistant-v1";
const EMAIL = "info@regulusautomation.ca";

/** Phase-1 starting points. Tapping one sends its label as a normal message. */
const STARTING_POINTS = [
  "New enquiries",
  "Follow-up",
  "Scheduling",
  "Estimates or quotes",
  "Customer communication",
  "Payroll or administration",
  "Reporting",
  "Something else",
];

function uuid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export function Receptionist() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const atBottomRef = useRef(true);
  /** Guards against a double-submit producing two identical turns. */
  const inFlightRef = useRef(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Stored;
        setConversationId(s.conversationId);
        setMessages(s.messages || []);
        setDone(Boolean(s.done));
        setStarted(Boolean(s.conversationId));
      }
    } catch {
      /* sessionStorage unavailable — start fresh */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ conversationId, messages, done } satisfies Stored));
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }, [conversationId, messages, done]);

  // Track whether the visitor is pinned to the bottom, so we never yank them
  // away from an earlier message they are reading.
  const onScroll = useCallback(() => {
    const el = logRef.current;
    if (!el) return;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = logRef.current;
    if (el && atBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, open, status]);

  const post = useCallback(async (payload: Record<string, unknown>, idem?: string) => {
    const res = await fetch("/api/receptionist", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(idem ? { "Idempotency-Key": idem } : {}) },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as { conversation_id: string; reply: string; done: boolean };
  }, []);

  const start = useCallback(async () => {
    if (started) return;
    setStarted(true);
    setStatus("sending");
    try {
      const data = await post({ source_page: window.location.pathname, campaign: window.location.search.slice(0, 300) });
      setConversationId(data.conversation_id);
      setMessages([{ role: "assistant", text: data.reply }]);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, [post, started]);

  const openPanel = useCallback(() => {
    setOpen(true);
    if (!started) void start();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [start, started]);

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || inFlightRef.current || done || !conversationId) return;
      inFlightRef.current = true;
      atBottomRef.current = true;
      setMessages((m) => [...m, { role: "visitor", text: trimmed }]);
      setInput("");
      setStatus("sending");
      try {
        const data = await post({ conversation_id: conversationId, message: trimmed }, uuid());
        setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
        setDone(Boolean(data.done));
        setStatus("idle");
      } catch {
        setStatus("error");
      } finally {
        inFlightRef.current = false;
      }
    },
    [conversationId, done, post],
  );

  const requestHuman = useCallback(() => {
    void sendText("I'd like to speak with a person, please.");
  }, [sendText]);

  const showStartingPoints = open && messages.length === 1 && !done && status !== "sending";

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={openPanel}
          aria-label="Open the Regulus Business Assistant"
          data-analytics-event="chat_open"
          className="fixed bottom-4 right-4 z-[70] flex min-h-[44px] max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-line bg-ink px-5 py-3 text-sm font-medium text-bg shadow-card transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent/50 motion-reduce:transition-none motion-reduce:hover:scale-100"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
          <span aria-hidden>💬</span> Ask Regulus
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="assistant-title"
          className={[
            "fixed z-[70] flex flex-col overflow-hidden border-line bg-panel shadow-card",
            // Mobile: full-bleed sheet. No fixed pixel width can exceed the viewport.
            "inset-0 w-full max-w-full rounded-none border-0",
            // Desktop: docked card, still capped to the viewport on small laptops.
            "sm:inset-auto sm:bottom-4 sm:right-4 sm:h-[min(600px,80dvh)] sm:w-[min(400px,calc(100vw-2rem))] sm:max-w-[calc(100vw-2rem)] sm:rounded-2xl sm:border",
          ].join(" ")}
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line bg-bg-2/60 px-4 py-3">
            <div className="min-w-0">
              <h2 id="assistant-title" className="truncate text-sm font-semibold text-ink">
                Regulus Business Assistant
              </h2>
              <p className="mt-0.5 text-xs leading-snug text-dim">
                Explore where automation could save time or recover opportunities. A person reviews every serious enquiry.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close the assistant"
              className="-mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-dim hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <span aria-hidden className="text-lg leading-none">✕</span>
            </button>
          </header>

          <div
            ref={logRef}
            onScroll={onScroll}
            role="log"
            aria-live="polite"
            aria-label="Conversation"
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden px-4 py-4"
          >
            {messages.map((m, i) => (
              <div key={i} className={m.role === "visitor" ? "flex justify-end" : "flex justify-start"}>
                <p
                  className={[
                    "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm",
                    m.role === "visitor" ? "rounded-br-sm bg-ink text-bg" : "rounded-bl-sm bg-bg-2 text-ink",
                  ].join(" ")}
                >
                  {m.text}
                </p>
              </div>
            ))}

            {showStartingPoints && (
              <div className="flex flex-wrap gap-2 pt-1" aria-label="Suggested starting points">
                {STARTING_POINTS.map((point) => (
                  <button
                    key={point}
                    type="button"
                    onClick={() => void sendText(point)}
                    data-analytics-event="chat_starting_point"
                    className="min-h-[44px] max-w-full break-words rounded-full border border-line-2 bg-bg px-3.5 py-2 text-xs text-ink hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                  >
                    {point}
                  </button>
                ))}
              </div>
            )}

            {status === "sending" && <p className="text-xs text-dim">Working on that…</p>}
            {status === "error" && (
              <p role="alert" className="break-words text-sm text-red-500">
                Something went wrong and your message may not have been received. Please try again, or email{" "}
                <a className="link-underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>.
              </p>
            )}
            {done && (
              <p className="break-words text-xs text-dim">
                A Regulus team member will follow up. You can also email{" "}
                <a className="link-underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>.
              </p>
            )}
          </div>

          {/* Screen-reader-only status, announced without moving focus. */}
          <p className="sr-only" role="status" aria-live="polite">
            {status === "sending" ? "Assistant is responding" : status === "error" ? "Message failed to send" : ""}
          </p>

          <div className="shrink-0 border-t border-line px-3 py-3">
            <div className="flex items-end gap-2">
              <label htmlFor="assistant-input" className="sr-only">Type your message</label>
              <textarea
                id="assistant-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendText(input); }
                  if (e.key === "Escape") setOpen(false);
                }}
                disabled={done || !conversationId}
                rows={1}
                placeholder={done ? "Conversation handed to the team" : "Type your message…"}
                className="max-h-28 min-h-[44px] w-full min-w-0 flex-1 resize-none rounded-xl border border-line-2 bg-bg px-3 py-2.5 text-base text-ink placeholder:text-dim focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-60 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => void sendText(input)}
                disabled={!input.trim() || status === "sending" || done || !conversationId}
                data-analytics-event="chat_send"
                className="min-h-[44px] shrink-0 rounded-xl bg-accent px-4 text-sm font-medium text-bg focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-40"
              >
                {status === "sending" ? "Sending" : "Send"}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
              <button
                type="button"
                onClick={requestHuman}
                disabled={done || !conversationId || status === "sending"}
                data-analytics-event="chat_request_human"
                className="link-underline text-dim hover:text-ink disabled:opacity-50"
              >
                Talk to a person
              </button>
              <a className="link-underline break-all text-dim hover:text-ink" href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
