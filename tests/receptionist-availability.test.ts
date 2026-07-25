import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { generateSlots, slotsAreFresh, zonedWallTimeToUtc, tzOffsetMs, type AvailabilityConfig, type Interval } from "../src/lib/receptionist/calendar/availability";
import { extractSlotSelection } from "../src/lib/receptionist/extraction";
import { bookingIdempotencyId } from "../src/lib/receptionist/calendar/adapter";
import { GoogleCalendarProvider, type FetchLike } from "../src/lib/receptionist/calendar/google";
import type { OfferedSlot } from "../src/lib/receptionist/schema";

const read = (p: string) => readFile(new URL(p, import.meta.url), "utf8");

const CFG: AvailabilityConfig = {
  timezone: "America/Toronto", businessStartHour: 9, businessEndHour: 17,
  durationMinutes: 30, bufferMinutes: 15, horizonDays: 5, leadMinutes: 60, slotsToOffer: 3,
  workdays: [0, 1, 2, 3, 4, 5, 6], // any day, to keep the test weekday-independent
};
// 2026-07-20T12:00:00Z == 08:00 EDT; earliest bookable = 09:00 EDT (60m lead).
const NOW = new Date("2026-07-20T12:00:00Z");
const at = (iso: string) => Date.parse(iso);

test("timezone handling: 9:00 business start in America/Toronto maps to 13:00 UTC (EDT)", () => {
  const slots = generateSlots(CFG, NOW, []);
  assert.ok(slots.length >= 1);
  assert.equal(slots[0].start, "2026-07-20T13:00:00.000Z"); // 9:00 AM EDT
  assert.match(slots[0].label, /9:00.*AM/);
  assert.equal(slots[0].timezone, "America/Toronto");
});

test("tz offset is DST-aware (EDT -4h in July, EST -5h in January)", () => {
  assert.equal(tzOffsetMs(new Date("2026-07-20T12:00:00Z"), "America/Toronto"), -4 * 3600_000);
  assert.equal(tzOffsetMs(new Date("2026-01-20T12:00:00Z"), "America/Toronto"), -5 * 3600_000);
  assert.equal(zonedWallTimeToUtc(2026, 7, 20, 9, 0, "America/Toronto").toISOString(), "2026-07-20T13:00:00.000Z");
});

test("availability conflict exclusion: a busy 9:00–9:30 skips the 9:00 slot", () => {
  const busy: Interval[] = [{ start: at("2026-07-20T13:00:00Z"), end: at("2026-07-20T13:30:00Z") }];
  const slots = generateSlots(CFG, NOW, busy);
  assert.ok(!slots.some((s) => s.start === "2026-07-20T13:00:00.000Z"), "9:00 slot must be excluded");
  assert.equal(slots[0].start, "2026-07-20T13:45:00.000Z"); // 9:45 (30m + 15m buffer)
});

test("availability returns exactly slotsToOffer options within business hours", () => {
  const slots = generateSlots({ ...CFG, slotsToOffer: 2 }, NOW, []);
  assert.equal(slots.length, 2);
  for (const s of slots) assert.ok(Date.parse(s.end) - Date.parse(s.start) === 30 * 60_000);
});

test("availability respects lead time (no slot earlier than now + leadMinutes)", () => {
  const slots = generateSlots({ ...CFG, leadMinutes: 6 * 60 }, NOW, []); // earliest 14:00 EDT
  assert.ok(slots.every((s) => Date.parse(s.start) >= NOW.getTime() + 6 * 3600_000));
});

test("slot expiry: fresh within TTL, stale after", () => {
  const offeredAt = NOW.toISOString();
  assert.equal(slotsAreFresh(offeredAt, new Date(NOW.getTime() + 10 * 60_000), 15), true);
  assert.equal(slotsAreFresh(offeredAt, new Date(NOW.getTime() + 20 * 60_000), 15), false);
  assert.equal(slotsAreFresh(null, NOW, 15), false);
});

const SLOTS: OfferedSlot[] = [
  { slot_id: "a", start: "2026-07-20T13:00:00.000Z", end: "2026-07-20T13:30:00.000Z", timezone: "America/Toronto", label: "Mon, Jul 20, 9:00 AM EDT" },
  { slot_id: "b", start: "2026-07-20T14:45:00.000Z", end: "2026-07-20T15:15:00.000Z", timezone: "America/Toronto", label: "Mon, Jul 20, 10:45 AM EDT" },
  { slot_id: "c", start: "2026-07-20T18:00:00.000Z", end: "2026-07-20T18:30:00.000Z", timezone: "America/Toronto", label: "Mon, Jul 20, 2:00 PM EDT" },
];

test("explicit slot selection: number, ordinal, and 'last' resolve to one slot", () => {
  assert.equal(extractSlotSelection("2", SLOTS)?.slot_id, "b");
  assert.equal(extractSlotSelection("the second option please", SLOTS)?.slot_id, "b");
  assert.equal(extractSlotSelection("first", SLOTS)?.slot_id, "a");
  assert.equal(extractSlotSelection("the last one", SLOTS)?.slot_id, "c");
  assert.equal(extractSlotSelection("2:00 pm works", SLOTS)?.slot_id, "c");
});

test("invalid or ambiguous selection returns null (engine re-prompts, never guesses)", () => {
  assert.equal(extractSlotSelection("", SLOTS), null);
  assert.equal(extractSlotSelection("yes please", SLOTS), null);
  assert.equal(extractSlotSelection("maybe 1 or 2", SLOTS), null); // ambiguous -> null
  assert.equal(extractSlotSelection("9", SLOTS), null); // out of range
});

test("bookingIdempotencyId is deterministic and provider-id-safe", () => {
  const a = bookingIdempotencyId("80fb23e7-65ed-4d10-bf35-b54ee514877b");
  assert.equal(a, bookingIdempotencyId("80fb23e7-65ed-4d10-bf35-b54ee514877b"));
  assert.notEqual(a, bookingIdempotencyId("other-conversation-id"));
  assert.match(a, /^reg[a-v0-9]+$/); // Google base32hex-safe charset
});

// ---- Google FreeBusy (availability) ----
test("listBusy parses confirmed busy intervals", async () => {
  const fetchImpl: FetchLike = async () => ({ ok: true, status: 200, json: async () => ({ calendars: { primary: { busy: [{ start: "2026-07-20T13:00:00Z", end: "2026-07-20T13:30:00Z" }] } } }) });
  const p = new GoogleCalendarProvider({ accessToken: "t", calendarId: "primary", fetchImpl });
  const busy = await p.listBusy("2026-07-20T00:00:00Z", "2026-07-25T00:00:00Z");
  assert.deepEqual(busy, [{ start: at("2026-07-20T13:00:00Z"), end: at("2026-07-20T13:30:00Z") }]);
});

test("listBusy returns null on provider error field or non-2xx (fail closed)", async () => {
  const errField: FetchLike = async () => ({ ok: true, status: 200, json: async () => ({ calendars: { primary: { errors: [{ reason: "notFound" }] } } }) });
  const non2xx: FetchLike = async () => ({ ok: false, status: 401, json: async () => ({}) });
  assert.equal(await new GoogleCalendarProvider({ accessToken: "t", calendarId: "primary", fetchImpl: errField }).listBusy("a", "b"), null);
  assert.equal(await new GoogleCalendarProvider({ accessToken: "t", calendarId: "primary", fetchImpl: non2xx }).listBusy("a", "b"), null);
});

test("createBooking sends the deterministic event id (provider-side idempotency)", async () => {
  let sentId: unknown;
  const fetchImpl: FetchLike = async (_url, init) => { sentId = JSON.parse(init.body as string).id; return { ok: true, status: 200, json: async () => ({ id: "evt", status: "confirmed", start: { dateTime: "2026-07-20T13:00:00Z" }, end: { dateTime: "2026-07-20T13:30:00Z" } }) }; };
  const p = new GoogleCalendarProvider({ accessToken: "t", calendarId: "primary", fetchImpl });
  await p.createBooking({ start: "2026-07-20T13:00:00Z", end: "2026-07-20T13:30:00Z", timezone: "America/Toronto", attendeeContact: "a@b.co", summary: "x", idempotencyId: "regabc123" });
  assert.equal(sentId, "regabc123");
});

// ---- store-level idempotency (concurrent booking) — source guarantees ----
test("booking idempotency: single-event guarantees are wired (source)", async () => {
  const store = await read("../src/lib/receptionist/store.ts");
  assert.match(store, /putStoredBookingIfNew/);
  assert.match(store, /onlyIfNew: true/); // atomic single-writer claim
  const cal = await read("../src/lib/receptionist/calendar/index.ts");
  assert.match(cal, /getStoredBooking\(record\.conversation_id\)/); // return existing -> no duplicate event
  assert.match(cal, /putStoredBookingIfNew/); // concurrent writers collapse to one event
});

test("notification fallback: a preserved lead on FOLLOW_UP still triggers notify (source)", async () => {
  const route = await read("../src/app/api/receptionist/route.ts");
  assert.match(route, /if \(next\.lead_id\) await notifyLead\(next\)/); // FOLLOW_UP with a lead notifies too
});
