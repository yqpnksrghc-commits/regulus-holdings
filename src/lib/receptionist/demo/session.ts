/**
 * Demo session — the explicit `RECEPTIONIST_MODE=demo` boundary.
 *
 * It drives the REAL production conversation engine (processVisitorTurn) with a
 * demo model and IN-MEMORY simulated providers, then replaces every production
 * side effect with a VISIBLE, SIMULATED result:
 *
 *   production side effect                 demo replacement (this module)
 *   -----------------------------------    -----------------------------------------
 *   persistLead() -> Netlify Blobs         build the SAME lead record in-memory only
 *   notifyLead()  -> email/SMS webhook     a labelled "simulated notification" entry
 *   saveConversation() -> Blobs            nothing; the browser holds the record
 *   selectAvailability() -> Google busy    generateSlots(... , busy=[]) — pure, no network
 *   selectCalendar() -> Google createEvent fabricated durable evidence (creation_status:"simulated")
 *
 * Reconciled with the CURRENT engine (booking loop): it uses the engine's real
 * two-step flow — verified availability -> explicit selection -> evidence-gated
 * BOOKED. It reuses only PURE engine helpers (generateSlots, availabilityConfig,
 * bookingRequestFromRecord) and the shared lead gate (validateLead/createLeadRecord).
 *
 * It NEVER imports store.ts, notify.ts, calendar/index.ts, calendar/google.ts,
 * @netlify/blobs, or the production route. That structural exclusion is what
 * makes it impossible for a demo conversation to reach production persistence,
 * notification, or a real calendar. The lead + booking record shapes are
 * preserved so production integrations would see identical structured output.
 */
import { createLeadRecord, validateLead } from "@/lib/leads";
import { newConversation, processVisitorTurn, type BookingProvider } from "@/lib/receptionist/conversation";
import { DemoModel } from "@/lib/receptionist/demo/model";
import { DEMO_GREETING_MESSAGE, DEMO_TENANT, RECEPTIONIST_MODE } from "@/lib/receptionist/demo/tenant";
import { bookingRequestFromRecord, type AvailabilityProvider } from "@/lib/receptionist/calendar/adapter";
import { availabilityConfig, generateSlots } from "@/lib/receptionist/calendar/availability";
import { isTerminal, type BookingEvidence, type ConversationRecord } from "@/lib/receptionist/schema";

/** A lead record as production would build it, marked unmistakably as simulated. */
export type SimulatedLead = ReturnType<typeof createLeadRecord> & {
  origin: "receptionist-demo";
  simulated: true;
};

/** Booking evidence in the production shape, flagged as simulated (no real event). */
export type SimulatedBooking = BookingEvidence & { simulated: true };

/** A labelled stand-in for a production side effect that did NOT actually run. */
export type SimulatedAction = {
  kind: "lead" | "notification" | "booking_followup" | "human_handoff" | "availability" | "calendar_event";
  label: string;
  detail: string;
};

export type QualificationOutcome = "IN_PROGRESS" | "QUALIFIED" | "BOOKED" | "ESCALATED" | "OUT_OF_SCOPE" | "SPAM";

/**
 * Demo availability — the engine's REAL slot generator over an empty busy list.
 * Pure and in-memory: no Google, no network, no store. Northstar's demonstration
 * hours (Tue–Sat, 9–18) shape the offered times.
 */
const demoAvailability: AvailabilityProvider = async (now: Date) => {
  const cfg = availabilityConfig({
    CALENDAR_TIMEZONE: "America/Toronto",
    CALENDAR_BUSINESS_START_HOUR: "9",
    CALENDAR_BUSINESS_END_HOUR: "18",
    CALENDAR_WORKDAYS: "2,3,4,5,6", // Tue–Sat
    CALENDAR_SLOTS_TO_OFFER: "3",
  } as unknown as NodeJS.ProcessEnv);
  return generateSlots(cfg, now, []); // busy=[] -> conflict-free demo slots
};

/**
 * Demo booking — fabricates DURABLE-SHAPED evidence for the visitor's explicitly
 * selected slot, with creation_status "simulated". It reuses the engine's pure
 * bookingRequestFromRecord (which requires an explicit selection + email), so the
 * evidence gate behaves exactly as production — but NO real event is created.
 */
const demoBooking: BookingProvider = async (record) => {
  const req = bookingRequestFromRecord(record);
  if (!req) return null; // no explicit selection -> engine falls back to FOLLOW_UP_REQUIRED
  const evidence: SimulatedBooking = {
    event_identifier: `demo-evt-${record.conversation_id}`.slice(0, 64),
    start: req.start,
    end: req.end,
    timezone: req.timezone,
    attendee_contact: req.attendeeContact,
    creation_status: "simulated",
    simulated: true,
  };
  return evidence;
};

/** Full demo view — deliberately richer than the production safeView because
 *  every value here is fictional and the whole point is to show the internals. */
export type DemoView = {
  mode: typeof RECEPTIONIST_MODE;
  simulated: true;
  conversation_id: string;
  state: ConversationRecord["state"];
  reply: string;
  done: boolean;
  qualification: ConversationRecord["qualification"];
  confidence_by_field: ConversationRecord["confidence_by_field"];
  transcript: ConversationRecord["transcript"];
  flags: string[];
  outcome: QualificationOutcome;
  /** Verified availability the engine offered (never invented by the model). */
  offered_slots: ConversationRecord["offered_slots"];
  selected_slot: ConversationRecord["selected_slot"];
  /** Simulated calendar evidence once a booking is confirmed in the demo. */
  booking: SimulatedBooking | null;
  /** Human-readable next action for clinic staff. */
  staff_action: string;
  /** The structured lead record production would create — in-memory only. */
  lead: SimulatedLead | null;
  /** Side effects that were simulated (never actually performed). */
  simulated_actions: SimulatedAction[];
};

function outcomeFor(record: ConversationRecord): QualificationOutcome {
  switch (record.state) {
    case "SPAM":
      return "SPAM";
    case "OUT_OF_SCOPE":
      return "OUT_OF_SCOPE";
    case "HUMAN_REQUESTED":
      return "ESCALATED";
    case "BOOKED":
      return "BOOKED";
    case "COMPLETED":
    case "FOLLOW_UP_REQUIRED":
      return "QUALIFIED";
    default:
      return "IN_PROGRESS";
  }
}

function staffActionFor(record: ConversationRecord, lead: SimulatedLead | null): string {
  if (record.state === "OUT_OF_SCOPE") return "No follow-up — the visitor was directed to emergency services or an out-of-scope path.";
  if (record.state === "SPAM") return "No action — flagged as spam and closed without a lead.";
  if (record.state === "BOOKED") return `No action needed — the consultation is booked; a calendar invite was (would be) sent to ${record.qualification.email}.`;
  if (record.human_takeover) return "Call or email the visitor — a human handoff was requested.";
  if (lead) return `Review the consultation request and confirm timing with ${lead.name} at ${lead.email || "the contact provided"}.`;
  return "Keep the conversation going — not enough detail yet to route to staff.";
}

/** Turn a create_lead effect into a simulated (never-persisted) lead record. */
function simulateLead(leadInput: Parameters<typeof validateLead>[0], now: number): { lead: SimulatedLead | null; actions: SimulatedAction[] } {
  const v = validateLead(leadInput, now);
  if (!v.ok || v.bot) return { lead: null, actions: [] };
  const base = createLeadRecord(v.value, new Date(now));
  const lead: SimulatedLead = { ...base, origin: "receptionist-demo", simulated: true };
  return {
    lead,
    actions: [
      { kind: "lead", label: "Lead record created (simulated)", detail: `Would enter the review queue as ${lead.pipeline_state}. Nothing was written to any store.` },
      { kind: "notification", label: "Staff notification (simulated)", detail: "In production, an email/SMS would alert the clinic. No message was sent." },
    ],
  };
}

/** Start a new demo conversation. Pure — returns the initial record + view. */
export function startDemoSession(now: Date = new Date(), conversationId = "demo"): { record: ConversationRecord; view: DemoView } {
  const record = newConversation(conversationId, "/ai-receptionist-demo", null, now);
  return { record, view: toView(record, DEMO_GREETING_MESSAGE, null, []) };
}

/**
 * Process one visitor message against a prior record. The caller (browser) owns
 * the record between turns; this function stores nothing. Returns the next
 * record plus the demo view for rendering.
 */
export async function runDemoTurn(
  prior: ConversationRecord,
  message: unknown,
  now: Date = new Date(),
): Promise<{ record: ConversationRecord; view: DemoView }> {
  const hadBookingBefore = prior.state === "BOOKED";
  const { record, reply, effect } = await processVisitorTurn(prior, message, new DemoModel(), {
    now,
    booking: demoBooking, // simulated: fabricated evidence, no real calendar event
    availability: demoAvailability, // simulated: pure slot generation, no calendar read
  });

  let lead: SimulatedLead | null = null;
  const actions: SimulatedAction[] = [];

  if (effect.kind === "create_lead") {
    const sim = simulateLead(effect.leadInput, now.getTime());
    lead = sim.lead;
    actions.push(...sim.actions);
    if (lead) {
      record.lead_id = lead.lead_id;
      record.lead_pipeline_state = lead.pipeline_state;
    }
  }
  // Surface the availability offer as a simulated action the first time slots appear.
  if (record.offered_slots.length > 0 && prior.offered_slots.length === 0) {
    actions.push({ kind: "availability", label: "Availability checked (simulated)", detail: `${record.offered_slots.length} verified time(s) generated in-memory. No calendar was read.` });
  }
  // Surface the (simulated) calendar event exactly once, on the transition to BOOKED.
  if (record.state === "BOOKED" && !hadBookingBefore) {
    actions.push({ kind: "calendar_event", label: "Calendar event created (simulated)", detail: "Durable-shaped booking evidence was fabricated for display. No real calendar event was created and no invite was sent." });
  }
  if (record.human_takeover && !actions.some((a) => a.kind === "human_handoff")) {
    actions.push({ kind: "human_handoff", label: "Human handoff (simulated)", detail: "The conversation would be routed to a staff queue. No one was paged." });
  }
  if (record.follow_up_required && record.state === "FOLLOW_UP_REQUIRED") {
    actions.push({ kind: "booking_followup", label: "Booking follow-up (simulated)", detail: "A human would confirm the time. No event was created and no message was sent." });
  }

  return { record, view: toView(record, reply, lead, actions) };
}

function toView(record: ConversationRecord, reply: string, lead: SimulatedLead | null, actions: SimulatedAction[]): DemoView {
  const booking = isSimulatedBooking(record.booking_evidence) ? record.booking_evidence : null;
  return {
    mode: RECEPTIONIST_MODE,
    simulated: true,
    conversation_id: record.conversation_id,
    state: record.state,
    reply,
    done: isTerminal(record.state),
    qualification: record.qualification,
    confidence_by_field: record.confidence_by_field,
    transcript: record.transcript,
    flags: record.flags,
    outcome: outcomeFor(record),
    offered_slots: record.offered_slots,
    selected_slot: record.selected_slot,
    booking,
    staff_action: staffActionFor(record, lead),
    lead,
    simulated_actions: actions,
  };
}

function isSimulatedBooking(e: BookingEvidence | null): e is SimulatedBooking {
  return Boolean(e) && (e as SimulatedBooking).creation_status === "simulated";
}

/** Exposed for tests: the simulated providers are pure and calendar-free. */
export const __demoProviders = { demoAvailability, demoBooking };
export const DEMO_TENANT_LABEL = DEMO_TENANT.label;
