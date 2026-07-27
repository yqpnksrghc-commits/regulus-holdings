/**
 * Receptionist domain schema — conversation states, qualification model, and
 * record types. Pure types + constants, no I/O. This is the shared vocabulary
 * every other receptionist module speaks.
 */

/** Explicit conversation states. Progress path plus terminal/escalation states. */
export const CONVERSATION_STATES = [
  "NEW",
  "GREETING",
  "INTENT_IDENTIFIED",
  "QUALIFYING",
  "CONTACT_CAPTURE",
  "READY_TO_BOOK",
  "BOOKED",
  // Alternative terminal / escalation states
  "FOLLOW_UP_REQUIRED",
  "HUMAN_REQUESTED",
  "OUT_OF_SCOPE",
  "SPAM",
  "ABANDONED",
  "ERROR_RECOVERABLE",
  "COMPLETED",
] as const;

export type ConversationState = (typeof CONVERSATION_STATES)[number];

/** States from which no further visitor turn is processed. */
export const TERMINAL_STATES: readonly ConversationState[] = [
  "BOOKED",
  "FOLLOW_UP_REQUIRED",
  "OUT_OF_SCOPE",
  "SPAM",
  "ABANDONED",
  "COMPLETED",
] as const;

/** States that mean a human must take over; still recorded, never auto-continued. */
export const ESCALATION_STATES: readonly ConversationState[] = ["HUMAN_REQUESTED"] as const;

export function isTerminal(state: ConversationState): boolean {
  return TERMINAL_STATES.includes(state) || ESCALATION_STATES.includes(state);
}

/** Structured qualification fields. Every value is explicitly unknown until captured. */
export type QualificationFields = {
  visitor_name: string | null;
  company_name: string | null;
  business_type: string | null;
  industry: string | null;
  business_size: string | null;
  email: string | null;
  phone: string | null;
  preferred_contact_method: "email" | "phone" | null;
  inquiry_type: string | null;
  business_problem: string | null;
  pain_points: string[];
  current_process: string | null;
  desired_outcome: string | null;
  goals: string[];
  urgency: "low" | "medium" | "high" | null;
  approximate_monthly_lead_volume: string | null;
  approximate_staff_time_lost: string | null;
  budget_signal: string | null;
  decision_authority: "yes" | "no" | "unknown" | null;
  requested_services: string[];
  questions_answered: string[];
  preferred_communication_style: "concise" | "detailed" | "technical" | null;
  booking_intent: boolean;
  human_requested: boolean;
  consent_to_follow_up: boolean;
  source_page: string | null;
  campaign_parameters: string | null;
};

/** Confidence in [0,1] for each captured field, keyed by field name. */
export type ConfidenceByField = Partial<Record<keyof QualificationFields, number>>;

export function emptyQualification(): QualificationFields {
  return {
    visitor_name: null,
    company_name: null,
    business_type: null,
    industry: null,
    business_size: null,
    email: null,
    phone: null,
    preferred_contact_method: null,
    inquiry_type: null,
    business_problem: null,
    pain_points: [],
    current_process: null,
    desired_outcome: null,
    goals: [],
    urgency: null,
    approximate_monthly_lead_volume: null,
    approximate_staff_time_lost: null,
    budget_signal: null,
    decision_authority: null,
    requested_services: [],
    questions_answered: [],
    preferred_communication_style: null,
    booking_intent: false,
    human_requested: false,
    consent_to_follow_up: false,
    source_page: null,
    campaign_parameters: null,
  };
}

export type TranscriptRole = "visitor" | "receptionist" | "system";

export type TranscriptTurn = {
  role: TranscriptRole;
  /** Sanitized visitor text or generated receptionist text. Never raw untrusted HTML. */
  text: string;
  at: string; // ISO
  /** Set on visitor turns when injection/policy flags fired. */
  flags?: string[];
};

/** Durable, PII-aware conversation record persisted to Blobs. */
export type ConversationRecord = {
  schema_version: "1.0";
  conversation_id: string;
  channel: "website";
  state: ConversationState;
  qualification: QualificationFields;
  confidence_by_field: ConfidenceByField;
  transcript: TranscriptTurn[];
  /** Lead pipeline linkage once a lead is created (reuses existing /api/leads gate). */
  lead_id: string | null;
  lead_pipeline_state: string | null;
  /** Booking gate — only ever populated from durable calendar evidence. */
  booking_evidence: BookingEvidence | null;
  /** Verified availability offered to the visitor (never invented by the model). */
  offered_slots: OfferedSlot[];
  /** When the current `offered_slots` were produced (ISO) — used for expiry. */
  offered_at: string | null;
  /** The single slot the visitor explicitly selected, or null. */
  selected_slot: OfferedSlot | null;
  /** When a durable booking was recorded (ISO), or null. */
  booked_at: string | null;
  follow_up_required: boolean;
  human_takeover: boolean;
  duplicate_of: string | null;
  flags: string[];
  error: string | null;
  created_at: string;
  updated_at: string;
  source_page: string | null;
  campaign_parameters: string | null;
  extraction_source: "deterministic" | "model+deterministic";
  /** Latest independently testable response-intelligence evidence. */
  response_intelligence?: {
    intent: string;
    confidence: number;
    secondary_intents: string[];
    knowledge_ids: string[];
    quality_score: number;
    sales_score: number;
    evidence_score: number;
    progress_score: number;
    regenerated: boolean;
    selected_goal: string;
    goal_reason: string;
    goal_confidence: number;
    blocked_goals: string[];
    required_known_fields: string[];
    expected_state_change: string;
    response_plan: {
      primary_goal: string;
      direct_answer_required: boolean;
      knowledge_ids: string[];
      context_purpose: string;
      question_field: string | null;
      proposed_action: string;
      expected_progress: string;
    };
  };
};

/** A verified, offerable discovery-call time. `slot_id` is a stable hash of start|end. */
export type OfferedSlot = {
  slot_id: string;
  start: string; // ISO 8601
  end: string; // ISO 8601
  timezone: string; // IANA tz
  label: string; // human-readable, rendered in `timezone`
};

/** Durable calendar evidence. Without ALL of these a booking is NOT complete. */
export type BookingEvidence = {
  event_identifier: string;
  start: string; // ISO
  end: string; // ISO
  timezone: string;
  attendee_contact: string;
  creation_status: string;
};

export function isDurableBookingEvidence(e: unknown): e is BookingEvidence {
  if (!e || typeof e !== "object") return false;
  const b = e as Record<string, unknown>;
  return (
    typeof b.event_identifier === "string" && b.event_identifier.length > 0 &&
    typeof b.start === "string" && b.start.length > 0 &&
    typeof b.end === "string" && b.end.length > 0 &&
    typeof b.timezone === "string" && b.timezone.length > 0 &&
    typeof b.attendee_contact === "string" && b.attendee_contact.length > 0 &&
    typeof b.creation_status === "string" && b.creation_status.length > 0
  );
}
