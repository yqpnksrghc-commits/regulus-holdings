"use client";

/**
 * Regulus AI Receptionist — website chat interface.
 *
 * Mobile-first, keyboard- and screen-reader-accessible. Clear AI disclosure and
 * an always-visible human-contact option. Conversation recovers after refresh
 * from sessionStorage. No fake typing delays. One question per turn is enforced
 * by the server; the client only renders. All content facts come from the
 * server (approved knowledge) — this component asserts nothing about Regulus.
 */
import { useCallback, useEffect, useRef, useState } from "react";

type Msg = { role: "visitor" | "receptionist"; text: string };
type Stored = { conversationId: string | null; messages: Msg[]; done: boolean };

const STORAGE_KEY = "regulus-receptionist-v1";
const EMAIL = "info@regulusautomation.ca";

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

  // Restore any in-progress conversation after a refresh.
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

  useEffect(() => {
    if (open) logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, open]);

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
      setMessages([{ role: "receptionist", text: data.reply }]);
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

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || status === "sending" || done || !conversationId) return;
    setMessages((m) => [...m, { role: "visitor", text }]);
    setInput("");
    setStatus("sending");
    try {
      const data = await post({ conversation_id: conversationId, message: text }, uuid());
      setMessages((m) => [...m, { role: "receptionist", text: data.reply }]);
      setDone(Boolean(data.done));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, [conversationId, done, input, post, status]);

  const requestHuman = useCallback(async () => {
    if (!conversationId || status === "sending") return;
    setMessages((m) => [...m, { role: "visitor", text: "I'd like to speak with a person." }]);
    setStatus("sending");
    try {
      const data = await post({ conversation_id: conversationId, message: "I'd like to speak with a human, please." }, uuid());
      setMessages((m) => [...m, { role: "receptionist", text: data.reply }]);
      setDone(Boolean(data.done));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, [conversationId, post, status]);

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={openPanel}
          aria-label="Open the Regulus AI receptionist"
          className="fixed bottom-4 right-4 z-[70] flex items-center gap-2 rounded-full border border-line bg-ink px-5 py-3 text-sm font-medium text-bg shadow-card transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          <span aria-hidden>💬</span> Ask Regulus
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="receptionist-title"
          className="fixed bottom-4 right-4 z-[70] flex h-[min(560px,80dvh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line bg-panel shadow-card"
        >
          <header className="flex items-start justify-between gap-2 border-b border-line bg-bg-2/60 px-4 py-3">
            <div>
              <h2 id="receptionist-title" className="text-sm font-semibold text-ink">
                Regulus AI Receptionist
              </h2>
              <p className="mt-0.5 text-xs text-dim">Automated assistant — not a human.</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close receptionist" className="rounded-md p-1 text-dim hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/50">
              <span aria-hidden>✕</span>
            </button>
          </header>

          <div ref={logRef} role="log" aria-live="polite" aria-label="Conversation" className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "visitor" ? "self-end max-w-[85%]" : "self-start max-w-[90%]"}>
                <p className={m.role === "visitor" ? "rounded-2xl rounded-br-sm bg-ink px-3.5 py-2 text-sm text-bg" : "rounded-2xl rounded-bl-sm bg-bg-2 px-3.5 py-2 text-sm text-ink whitespace-pre-wrap"}>
                  {m.text}
                </p>
              </div>
            ))}
            {status === "sending" && <p className="self-start text-xs text-dim" aria-live="polite">Receptionist is responding…</p>}
            {status === "error" && (
              <p role="alert" className="self-start text-sm text-red-500">
                Something went wrong. Please try again, or email{" "}
                <a className="link-underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>.
              </p>
            )}
            {done && (
              <p className="self-start text-xs text-dim">
                A Regulus team member will follow up. You can also email <a className="link-underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>.
              </p>
            )}
          </div>

          <div className="border-t border-line px-3 py-3">
            <div className="flex items-end gap-2">
              <label htmlFor="receptionist-input" className="sr-only">Type your message</label>
              <textarea
                id="receptionist-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
                  if (e.key === "Escape") setOpen(false);
                }}
                disabled={done || !conversationId}
                rows={1}
                placeholder={done ? "Conversation handed to the team" : "Type your message…"}
                className="max-h-28 min-h-[2.5rem] w-full resize-none rounded-xl border border-line-2 bg-bg px-3 py-2 text-sm text-ink placeholder:text-dim focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={!input.trim() || status === "sending" || done || !conversationId}
                className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-bg disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                Send
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <button type="button" onClick={() => void requestHuman()} disabled={done || !conversationId} className="link-underline text-dim hover:text-ink disabled:opacity-50">
                Talk to a human
              </button>
              <a className="link-underline text-dim hover:text-ink" href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
