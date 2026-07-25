/**
 * Google Calendar provider.
 *
 * - `listBusy` queries the FreeBusy API for confirmed busy intervals; any
 *   failure returns null so availability fails closed (no invented free time).
 * - `createBooking` inserts a real event and maps a CONFIRMED response to durable
 *   {@link BookingEvidence}. Anything else — non-2xx, missing id, non-"confirmed"
 *   status, network/timeout — returns null so the engine never reports BOOKED
 *   without provider confirmation. A deterministic event id (from the
 *   conversation) makes insert idempotent: a duplicate insert returns 409, which
 *   we treat as "already booked, not a new event".
 *
 * The HTTP transport is injectable so the adapter is fully testable offline
 * without network or credentials.
 */
import type { BookingEvidence } from "@/lib/receptionist/schema";
import type { BookingRequest, CalendarProvider } from "@/lib/receptionist/calendar/adapter";
import type { Interval } from "@/lib/receptionist/calendar/availability";

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

const str = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : null);

export class GoogleCalendarProvider implements CalendarProvider {
  readonly name = "google";
  constructor(private cfg: GoogleCalendarConfig) {}

  private fetch(): FetchLike {
    return this.cfg.fetchImpl ?? ((url, init) => fetch(url, init) as unknown as ReturnType<FetchLike>);
  }

  async listBusy(rangeStartIso: string, rangeEndIso: string): Promise<Interval[] | null> {
    try {
      const res = await this.fetch()("https://www.googleapis.com/calendar/v3/freeBusy", {
        method: "POST",
        headers: { Authorization: `Bearer ${this.cfg.accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ timeMin: rangeStartIso, timeMax: rangeEndIso, items: [{ id: this.cfg.calendarId }] }),
        signal: AbortSignal.timeout(this.cfg.timeoutMs ?? 6000),
      });
      if (!res.ok) return null;
      const body = (await res.json()) as { calendars?: Record<string, { busy?: { start?: unknown; end?: unknown }[]; errors?: unknown[] }> };
      const cal = body?.calendars?.[this.cfg.calendarId];
      if (!cal || (Array.isArray(cal.errors) && cal.errors.length)) return null;
      const out: Interval[] = [];
      for (const b of cal.busy ?? []) {
        const s = str(b.start);
        const e = str(b.end);
        if (s && e) out.push({ start: Date.parse(s), end: Date.parse(e) });
      }
      return out.filter((i) => Number.isFinite(i.start) && Number.isFinite(i.end));
    } catch {
      return null;
    }
  }

  async createBooking(req: BookingRequest): Promise<BookingEvidence | null> {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.cfg.calendarId)}/events?sendUpdates=all`;
    try {
      const res = await this.fetch()(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.cfg.accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(req.idempotencyId ? { id: req.idempotencyId } : {}),
          summary: req.summary,
          description: req.description ?? "",
          start: { dateTime: req.start, timeZone: req.timezone },
          end: { dateTime: req.end, timeZone: req.timezone },
          attendees: [{ email: req.attendeeContact }],
        }),
        signal: AbortSignal.timeout(this.cfg.timeoutMs ?? 6000),
      });
      // 409 = the deterministic id already exists -> a booking was already made; not a new event.
      if (!res.ok) return null;
      const ev = (await res.json()) as { id?: unknown; status?: unknown; start?: { dateTime?: unknown; timeZone?: unknown }; end?: { dateTime?: unknown; timeZone?: unknown } };
      const id = str(ev?.id);
      const status = str(ev?.status);
      if (!id || status !== "confirmed") return null;
      return {
        event_identifier: id,
        start: str(ev.start?.dateTime) ?? req.start,
        end: str(ev.end?.dateTime) ?? req.end,
        timezone: str(ev.start?.timeZone) ?? req.timezone,
        attendee_contact: req.attendeeContact,
        creation_status: status,
      };
    } catch {
      return null;
    }
  }
}
