/**
 * Calendar selection — the config-not-code switch (mirrors model/index.ts).
 *
 * Default is {@link noCalendarProvider} for booking and an empty-availability
 * provider (no calendar → no slots → the flow falls back to FOLLOW_UP_REQUIRED).
 * Setting GOOGLE_CALENDAR_ENABLED=true with GOOGLE_CALENDAR_ID and
 * GOOGLE_CALENDAR_ACCESS_TOKEN enables real Google availability + booking with
 * zero engine change.
 *
 * Booking is idempotent at the store layer: a confirmed booking is recorded once
 * per conversation, so a retry or concurrent request returns the same evidence
 * instead of creating a second event. The provider additionally sends a
 * deterministic event id so Google itself de-duplicates.
 */
import { noCalendarProvider, type BookingProvider } from "@/lib/receptionist/conversation";
import { bookingRequestFromRecord, type AvailabilityProvider } from "@/lib/receptionist/calendar/adapter";
import { GoogleCalendarProvider } from "@/lib/receptionist/calendar/google";
import { availabilityConfig, generateSlots } from "@/lib/receptionist/calendar/availability";
import { getStoredBooking, putStoredBookingIfNew } from "@/lib/receptionist/store";

function googleProvider(env: NodeJS.ProcessEnv): GoogleCalendarProvider | null {
  const enabled = (env.GOOGLE_CALENDAR_ENABLED || "").toLowerCase() === "true";
  if (enabled && env.GOOGLE_CALENDAR_ID && env.GOOGLE_CALENDAR_ACCESS_TOKEN) {
    return new GoogleCalendarProvider({ accessToken: env.GOOGLE_CALENDAR_ACCESS_TOKEN, calendarId: env.GOOGLE_CALENDAR_ID });
  }
  return null;
}

export function selectAvailability(env: NodeJS.ProcessEnv = process.env): AvailabilityProvider {
  const provider = googleProvider(env);
  if (!provider) return async () => []; // no calendar -> no slots -> fallback
  const cfg = availabilityConfig(env);
  return async (now: Date) => {
    const rangeStart = now.toISOString();
    const rangeEnd = new Date(now.getTime() + cfg.horizonDays * 86_400_000).toISOString();
    const busy = await provider.listBusy(rangeStart, rangeEnd);
    if (busy === null) return null; // provider error -> fail closed
    return generateSlots(cfg, now, busy);
  };
}

export function selectCalendar(env: NodeJS.ProcessEnv = process.env): BookingProvider {
  const provider = googleProvider(env);
  if (!provider) return noCalendarProvider;
  return async (record) => {
    const req = bookingRequestFromRecord(record);
    if (!req) return null; // no explicit selection -> engine falls back to FOLLOW_UP_REQUIRED
    // Idempotency: if this conversation already has a durable booking, return it.
    const existing = await getStoredBooking(record.conversation_id);
    if (existing) return existing;
    const evidence = await provider.createBooking(req);
    if (!evidence) return null; // fail closed (no false BOOKED)
    // Persist once; if a concurrent writer won, return the stored (single) event.
    const claimed = await putStoredBookingIfNew(record.conversation_id, evidence);
    if (!claimed) return (await getStoredBooking(record.conversation_id)) ?? evidence;
    return evidence;
  };
}

export { GoogleCalendarProvider } from "@/lib/receptionist/calendar/google";
export type { CalendarProvider, BookingRequest, AvailabilityProvider } from "@/lib/receptionist/calendar/adapter";
