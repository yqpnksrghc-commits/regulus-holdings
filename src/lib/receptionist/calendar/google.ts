/**
 * Google Calendar provider.
 *
 * Creates a real event via the Google Calendar API v3 and maps a CONFIRMED
 * response to durable {@link BookingEvidence}. Anything else — non-2xx, missing
 * event id, non-"confirmed" status, network/timeout — returns null so the engine
 * never reports BOOKED without provider confirmation.
 *
 * The HTTP transport is injectable so the adapter is fully testable offline
 * without network or credentials. Access-token acquisition (service-account JWT
 * or OAuth refresh) is intentionally external: the token is provided via config
 * (env in production, a fixture in tests).
 */
import type { BookingEvidence } from "@/lib/receptionist/schema";
import type { BookingRequest, CalendarProvider } from "@/lib/receptionist/calendar/adapter";

export type FetchLike = (
  url: string,
  init: Record<string, unknown>,
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

export type GoogleCalendarConfig = {
  accessToken: string;
  calendarId: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
};

type GoogleEvent = {
  id?: unknown;
  status?: unknown;
  start?: { dateTime?: unknown; timeZone?: unknown };
  end?: { dateTime?: unknown; timeZone?: unknown };
};

const str = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : null);

export class GoogleCalendarProvider implements CalendarProvider {
  readonly name = "google";
  constructor(private cfg: GoogleCalendarConfig) {}

  async createBooking(req: BookingRequest): Promise<BookingEvidence | null> {
    const doFetch: FetchLike =
      this.cfg.fetchImpl ?? ((url, init) => fetch(url, init) as unknown as ReturnType<FetchLike>);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.cfg.calendarId)}/events?sendUpdates=all`;
    try {
      const res = await doFetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.cfg.accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: req.summary,
          description: req.description ?? "",
          start: { dateTime: req.start, timeZone: req.timezone },
          end: { dateTime: req.end, timeZone: req.timezone },
          attendees: [{ email: req.attendeeContact }],
        }),
        signal: AbortSignal.timeout(this.cfg.timeoutMs ?? 6000),
      });
      if (!res.ok) return null;
      const ev = (await res.json()) as GoogleEvent;
      const id = str(ev?.id);
      const status = str(ev?.status);
      // Durable ONLY on a confirmed event with a real id.
      if (!id || status !== "confirmed") return null;
      const evidence: BookingEvidence = {
        event_identifier: id,
        start: str(ev.start?.dateTime) ?? req.start,
        end: str(ev.end?.dateTime) ?? req.end,
        timezone: str(ev.start?.timeZone) ?? req.timezone,
        attendee_contact: req.attendeeContact,
        creation_status: status,
      };
      return evidence;
    } catch {
      return null; // network/timeout/parse — never a false BOOKED
    }
  }
}
