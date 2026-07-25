/**
 * Provider-neutral calendar interface.
 *
 * The conversation engine gates booking on {@link isDurableBookingEvidence} and
 * only ever transitions to BOOKED when a provider returns complete, durable
 * evidence (see conversation.ts). This interface lets any calendar backend plug
 * in without touching the engine or the state machine. A provider may ONLY
 * report real availability (`listBusy`) and confirm a real booking
 * (`createBooking`); it returns `null` for anything it cannot durably confirm,
 * and the flow then fails closed to FOLLOW_UP_REQUIRED — never BOOKED.
 */
import type { BookingEvidence, ConversationRecord, OfferedSlot } from "@/lib/receptionist/schema";
import type { Interval } from "@/lib/receptionist/calendar/availability";

export type BookingRequest = {
  start: string; // ISO 8601
  end: string; // ISO 8601
  timezone: string; // IANA tz
  attendeeContact: string; // email
  summary: string;
  description?: string;
  /** Deterministic id for provider-side idempotency (same conversation -> same event). */
  idempotencyId?: string;
};

export interface CalendarProvider {
  readonly name: string;
  /** Confirmed busy intervals in [rangeStartIso, rangeEndIso], or null on provider error (fail closed). */
  listBusy(rangeStartIso: string, rangeEndIso: string): Promise<Interval[] | null>;
  /** Create a real booking and return durable evidence, or null if it cannot be confirmed. */
  createBooking(req: BookingRequest): Promise<BookingEvidence | null>;
}

/** Queries verified availability. Returns offered slots, [] when none, or null on provider error. */
export type AvailabilityProvider = (now: Date) => Promise<OfferedSlot[] | null>;

/** Deterministic, provider-safe event id derived from the conversation id. */
export function bookingIdempotencyId(conversationId: string): string {
  // base16 is a subset of Google's allowed base32hex event-id charset (0-9a-v).
  const hex = conversationId.replace(/[^a-f0-9]/gi, "").toLowerCase();
  return `reg${hex}`.slice(0, 64) || "regbooking";
}

/**
 * Build a concrete booking request from the visitor's EXPLICITLY selected slot.
 * Returns null when there is no durable selection yet, so the engine never books
 * without an explicit choice and never claims BOOKED it cannot prove.
 */
export function bookingRequestFromRecord(record: ConversationRecord): BookingRequest | null {
  const q = record.qualification;
  const slot = record.selected_slot;
  if (!q.email) return null;
  if (!slot || !slot.start || !slot.end || !slot.timezone) return null;
  const who = q.visitor_name || q.company_name || q.email;
  const summaryBits = [q.inquiry_type, q.business_problem].filter(Boolean).join(" — ");
  return {
    start: slot.start,
    end: slot.end,
    timezone: slot.timezone,
    attendeeContact: q.email,
    summary: `Regulus discovery call — ${who}`,
    description: [
      "Discovery call booked via the Regulus AI receptionist.",
      `Conversation: ${record.conversation_id}`,
      record.lead_id ? `Lead: ${record.lead_id}` : "",
      q.company_name ? `Company: ${q.company_name}` : "",
      summaryBits ? `Interest: ${summaryBits}` : "",
      q.phone ? `Phone: ${q.phone}` : "",
    ].filter(Boolean).join("\n"),
    idempotencyId: bookingIdempotencyId(record.conversation_id),
  };
}
