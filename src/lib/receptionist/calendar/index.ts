/**
 * Calendar selection — the config-not-code switch (mirrors model/index.ts).
 *
 * Default is {@link noCalendarProvider} (no calendar; every booking fails closed
 * to FOLLOW_UP_REQUIRED). Setting GOOGLE_CALENDAR_ENABLED=true with
 * GOOGLE_CALENDAR_ID and GOOGLE_CALENDAR_ACCESS_TOKEN enables real Google
 * bookings with zero engine change. The returned value is a BookingProvider the
 * conversation engine already understands.
 */
import { noCalendarProvider, type BookingProvider } from "@/lib/receptionist/conversation";
import { bookingRequestFromRecord } from "@/lib/receptionist/calendar/adapter";
import { GoogleCalendarProvider } from "@/lib/receptionist/calendar/google";

export function selectCalendar(env: NodeJS.ProcessEnv = process.env): BookingProvider {
  const enabled = (env.GOOGLE_CALENDAR_ENABLED || "").toLowerCase() === "true";
  if (enabled && env.GOOGLE_CALENDAR_ID && env.GOOGLE_CALENDAR_ACCESS_TOKEN) {
    const provider = new GoogleCalendarProvider({
      accessToken: env.GOOGLE_CALENDAR_ACCESS_TOKEN,
      calendarId: env.GOOGLE_CALENDAR_ID,
    });
    return async (record) => {
      const req = bookingRequestFromRecord(record);
      if (!req) return null; // no durable slot captured -> engine falls back to FOLLOW_UP_REQUIRED
      return provider.createBooking(req);
    };
  }
  return noCalendarProvider;
}

export { GoogleCalendarProvider } from "@/lib/receptionist/calendar/google";
export type { CalendarProvider, BookingRequest } from "@/lib/receptionist/calendar/adapter";
