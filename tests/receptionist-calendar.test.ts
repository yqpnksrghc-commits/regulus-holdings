import assert from "node:assert/strict";
import test from "node:test";
import { GoogleCalendarProvider, type FetchLike } from "../src/lib/receptionist/calendar/google";
import { bookingRequestFromRecord } from "../src/lib/receptionist/calendar/adapter";
import { selectCalendar } from "../src/lib/receptionist/calendar";
import { newConversation, processVisitorTurn } from "../src/lib/receptionist/conversation";
import { DeterministicModel } from "../src/lib/receptionist/model/deterministic";
import { isDurableBookingEvidence, type BookingEvidence } from "../src/lib/receptionist/schema";

const NOW = new Date("2026-07-25T12:00:00Z");
const model = new DeterministicModel();

const REQ = {
  start: "2026-07-28T15:00:00-04:00",
  end: "2026-07-28T15:30:00-04:00",
  timezone: "America/Toronto",
  attendeeContact: "prospect@clinic.ca",
  summary: "Regulus discovery call",
};

function googleOk(): FetchLike {
  return async () => ({
    ok: true,
    status: 200,
    json: async () => ({ id: "evt_abc123", status: "confirmed", start: { dateTime: REQ.start, timeZone: REQ.timezone }, end: { dateTime: REQ.end, timeZone: REQ.timezone } }),
  });
}

test("GoogleCalendarProvider maps a confirmed event to durable evidence", async () => {
  const p = new GoogleCalendarProvider({ accessToken: "tok", calendarId: "primary", fetchImpl: googleOk() });
  const ev = await p.createBooking(REQ);
  assert.ok(ev, "expected evidence");
  assert.ok(isDurableBookingEvidence(ev as BookingEvidence));
  assert.equal((ev as BookingEvidence).event_identifier, "evt_abc123");
  assert.equal((ev as BookingEvidence).creation_status, "confirmed");
  assert.equal((ev as BookingEvidence).attendee_contact, "prospect@clinic.ca");
});

test("GoogleCalendarProvider returns null when status is not confirmed", async () => {
  const fetchImpl: FetchLike = async () => ({ ok: true, status: 200, json: async () => ({ id: "evt_1", status: "tentative" }) });
  const p = new GoogleCalendarProvider({ accessToken: "tok", calendarId: "primary", fetchImpl });
  assert.equal(await p.createBooking(REQ), null);
});

test("GoogleCalendarProvider returns null when event id is missing", async () => {
  const fetchImpl: FetchLike = async () => ({ ok: true, status: 200, json: async () => ({ status: "confirmed" }) });
  const p = new GoogleCalendarProvider({ accessToken: "tok", calendarId: "primary", fetchImpl });
  assert.equal(await p.createBooking(REQ), null);
});

test("GoogleCalendarProvider returns null on a non-2xx response (never a false BOOKED)", async () => {
  const fetchImpl: FetchLike = async () => ({ ok: false, status: 403, json: async () => ({ error: "forbidden" }) });
  const p = new GoogleCalendarProvider({ accessToken: "tok", calendarId: "primary", fetchImpl });
  assert.equal(await p.createBooking(REQ), null);
});

test("GoogleCalendarProvider returns null on transport error", async () => {
  const fetchImpl: FetchLike = async () => { throw new Error("network"); };
  const p = new GoogleCalendarProvider({ accessToken: "tok", calendarId: "primary", fetchImpl });
  assert.equal(await p.createBooking(REQ), null);
});

test("selectCalendar defaults to the no-calendar provider (booking fails closed)", async () => {
  const provider = selectCalendar({} as unknown as NodeJS.ProcessEnv);
  const rec = newConversation("c", "/", null, NOW);
  assert.equal(await provider(rec), null);
});

test("bookingRequestFromRecord returns null when no durable slot is captured", () => {
  const rec = newConversation("c", "/", null, NOW);
  rec.qualification.email = "a@b.co";
  assert.equal(bookingRequestFromRecord(rec), null); // no slot yet -> no booking
});

test("integration: durable provider evidence drives the engine to BOOKED", async () => {
  const rec = newConversation("c", "/", null, NOW);
  rec.qualification.email = "prospect@clinic.ca";
  rec.qualification.business_problem = "missed calls after hours";
  rec.qualification.booking_intent = true;
  const durable = async (): Promise<BookingEvidence> => ({
    event_identifier: "evt_xyz", start: REQ.start, end: REQ.end, timezone: REQ.timezone, attendee_contact: "prospect@clinic.ca", creation_status: "confirmed",
  });
  const { record, effect } = await processVisitorTurn(rec, "Let's book a discovery call.", model, { now: NOW, booking: durable });
  assert.equal(record.state, "BOOKED");
  assert.ok(record.booking_evidence && isDurableBookingEvidence(record.booking_evidence));
  assert.equal(effect.kind, "create_lead");
});

test("integration: a null-returning provider never books (fails closed to FOLLOW_UP_REQUIRED)", async () => {
  const rec = newConversation("c", "/", null, NOW);
  rec.qualification.email = "prospect@clinic.ca";
  rec.qualification.business_problem = "missed calls after hours";
  rec.qualification.booking_intent = true;
  const { record } = await processVisitorTurn(rec, "Let's book a discovery call.", model, { now: NOW, booking: async () => null });
  assert.equal(record.state, "FOLLOW_UP_REQUIRED");
  assert.equal(record.booking_evidence, null);
});
