/**
 * Provider-neutral calendar interface.
 *
 * The conversation engine already gates booking on {@link isDurableBookingEvidence}
 * and only ever transitions to BOOKED when a provider returns complete, durable
 * evidence (see conversation.ts). This interface lets any calendar backend plug
 * in without touching the engine or the state machine. A provider may ONLY
 * confirm a real booking; it returns `null` for anything it cannot durably
 * confirm, and the engine then fails closed to FOLLOW_UP_REQUIRED — never BOOKED.
 */
import type { BookingEvidence, ConversationRecord } from "@/lib/receptionist/schema";

export type BookingRequest = {
  start: string; // ISO 8601
  end: string; // ISO 8601
  timezone: string; // IANA tz, e.g. "America/Toronto"
  attendeeContact: string; // email
  summary: string;
  description?: string;
};

export interface CalendarProvider {
  readonly name: string;
  /** Create a real booking and return durable evidence, or null if it cannot be confirmed. */
  createBooking(req: BookingRequest): Promise<BookingEvidence | null>;
}

/**
 * Derive a concrete booking request from a conversation, or null when the
 * conversation does not yet carry a durable slot to book.
 *
 * Phase 1 does not capture a specific date/time from the visitor, so this
 * returns null and every booking attempt fails closed to FOLLOW_UP_REQUIRED —
 * the receptionist never claims a BOOKED it cannot prove. Slot capture is a
 * deliberate follow-on; when it lands, this is the single place that maps it.
 */
export function bookingRequestFromRecord(record: ConversationRecord): BookingRequest | null {
  const q = record.qualification;
  const slot = record.booking_evidence; // only present if a slot was already resolved upstream
  if (!q.email) return null;
  if (!slot || !slot.start || !slot.end || !slot.timezone) return null;
  return {
    start: slot.start,
    end: slot.end,
    timezone: slot.timezone,
    attendeeContact: q.email,
    summary: `Regulus discovery call — ${q.company_name || q.visitor_name || q.email}`,
    description: q.business_problem || q.inquiry_type || "Discovery call requested via the Regulus AI receptionist.",
  };
}
