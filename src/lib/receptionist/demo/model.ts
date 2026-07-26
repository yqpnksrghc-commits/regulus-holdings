/**
 * Demo receptionist model — Northstar Aesthetics.
 *
 * It implements the SAME provider-neutral `ReceptionistModel` interface as the
 * production DeterministicModel (src/lib/receptionist/model/deterministic.ts),
 * so the production conversation engine, extraction, validation, state machine,
 * and action gating run completely unchanged. Only the knowledge source and two
 * safety guards (emergency + medical-advice) differ, and both are grounded in
 * the fictional demo tenant. The model only ever PROPOSES; the engine decides.
 */
import type { ModelContext, ModelReply, ProposedAction, ReceptionistModel } from "@/lib/receptionist/model/adapter";
import type { QualificationFields } from "@/lib/receptionist/schema";
import {
  DEMO_AI_DISCLOSURE,
  DEMO_CONSENT_NOTE,
  DEMO_EMERGENCY_REPLY,
  DEMO_MEDICAL_DEFLECTION,
  demoGroundedAnswer,
  detectEmergency,
  detectMedicalAdviceRequest,
} from "@/lib/receptionist/demo/tenant";

/** Map the latest visitor message to an approved demo knowledge topic. */
function classifyTopic(text: string): string {
  const t = text.toLowerCase();
  if (/\b(price|pricing|cost|how much|fee|charge|rate)\b/.test(t)) return "pricing";
  // Escalation topics are checked BEFORE booking so "reschedule my existing
  // appointment" routes to a human rather than being read as a new booking.
  if (/\b(refund|complaint|cancel|reschedule|change my|move my|existing appointment|my (?:appointment|booking))\b/.test(t)) return "escalate";
  if (/\b(book|schedule|appointment|consult|consultation|come in|visit|see someone)\b/.test(t)) return "booking";
  if (/\b(service|offer|treatment|facial|laser|injectable|botox|filler|skin|do you)\b/.test(t)) return "services";
  if (/\b(who are you|what is northstar|about|tell me about)\b/.test(t)) return "what_is_clinic";
  if (/\b(hour|open|when.*open|close)\b/.test(t)) return "hours";
  if (/\b(where|location|address|located)\b/.test(t)) return "location";
  if (/\b(privacy|data|store my|my information|consent)\b/.test(t)) return "privacy";
  if (/\b(are you (a )?(bot|ai|human|robot|real|person))\b/.test(t)) return "ai_disclosure";
  if (/\b(contact|email|phone|reach|call you)\b/.test(t)) return "contact";
  return "unknown";
}

/** Consultation-request intake order. Never asks for medical detail. */
const NEXT_QUESTION: { field: keyof QualificationFields; ask: string }[] = [
  { field: "inquiry_type", ask: "What are you interested in — a consultation, or a particular treatment?" },
  { field: "visitor_name", ask: "Lovely. Who should we address the follow-up to?" },
  { field: "email", ask: "What's the best email or phone number for the team to confirm your consultation?" },
];

function nextQuestion(q: QualificationFields): string | null {
  for (const { field, ask } of NEXT_QUESTION) {
    // Accept either an email or a phone as the single contact detail.
    if (field === "email" && (q.email || q.phone)) continue;
    if (q[field] == null) return ask;
  }
  return null;
}

export class DemoModel implements ReceptionistModel {
  // Named "deterministic" so the engine records extraction_source consistently
  // with the production deterministic path — the demo is fully reproducible.
  readonly name = "deterministic";

  async respond(context: ModelContext): Promise<ModelReply> {
    const { transcript, qualification, visitorFlags } = context;
    const lastVisitor = [...transcript].reverse().find((t) => t.role === "visitor");
    const text = lastVisitor?.text ?? "";

    // 0. SAFETY FIRST — emergency language overrides everything. Direct to
    // emergency services, capture nothing, mark out of scope (terminal).
    if (detectEmergency(text)) {
      return { reply: DEMO_EMERGENCY_REPLY, proposedAction: { kind: "mark_out_of_scope" } };
    }

    // 1. Injection/manipulation: never obey; answer as data, hold the boundary.
    if (visitorFlags.some((f) => f === "system_prompt_exfil" || f === "override_attempt" || f === "role_reassignment" || f === "action_forgery" || f === "authority_claim" || f === "impersonation_owner" || f === "data_exfil")) {
      return {
        reply: `I can only help with general questions about ${"Northstar"} and arranging a consultation. ${DEMO_AI_DISCLOSURE} How can I help?`,
        proposedAction: { kind: "none" },
      };
    }

    // 2. No medical advice, no health information — deflect to an in-person consult.
    if (detectMedicalAdviceRequest(text)) {
      const q = nextQuestion(qualification);
      return {
        reply: q ? `${DEMO_MEDICAL_DEFLECTION}\n\n${q}` : DEMO_MEDICAL_DEFLECTION,
        // Do NOT extract anything from a medical-history message.
        proposedAction: { kind: "none" },
      };
    }

    // 3. Explicit human request always wins.
    const wantsHuman = qualification.human_requested || /\b(human|person|someone real|receptionist|staff|team member|talk to (?:someone|a person))\b/i.test(text);
    if (wantsHuman) {
      return {
        reply: "Of course — I'll pass this to the Northstar team so a person can follow up with you directly. What's the best email or phone number to reach you?",
        proposedExtraction: { human_requested: true },
        proposedAction: { kind: "request_human" },
      };
    }

    const topic = classifyTopic(text);

    // Deterministic free-text extraction proposal (contact-only; no health data).
    const baseExtraction: Partial<QualificationFields> = {};
    if (topic !== "unknown" && topic !== "ai_disclosure" && topic !== "privacy") baseExtraction.inquiry_type = topic;
    if (text.length >= 12 && !/^\s*(hi|hello|hey|thanks|thank you)\b/i.test(text)) baseExtraction.business_problem = text.slice(0, 600);
    // Keyword is matched case-insensitively; the captured name must still start
    // uppercase so filler words ("I'm interested…") are not mistaken for a name.
    const nameMatch = text.match(/\b(?:[Ii]'?m|[Ii] am|[Mm]y name is|[Tt]his is|[Ii]t'?s)\s+([A-Z][a-zA-Z'-]{1,30})\b/);
    if (nameMatch) baseExtraction.visitor_name = nameMatch[1];

    // 4. Escalation topics: defer to a human, don't guess.
    if (topic === "escalate") {
      return {
        reply: "I'll make sure a Northstar team member helps you with that directly. What's the best email or phone number for them to reach you?",
        proposedAction: { kind: "request_human" },
      };
    }

    // 5. Booking / consultation intent: gather contact + timing, engine decides.
    if (topic === "booking" || qualification.booking_intent) {
      const q = nextQuestion(qualification);
      return {
        reply: q
          ? `Happy to help arrange a complimentary consultation. First, ${q.charAt(0).toLowerCase()}${q.slice(1)}`
          : "Wonderful — I have what I need. The Northstar team will confirm your consultation and preferred timing by email or phone shortly.",
        proposedExtraction: { ...baseExtraction, booking_intent: true },
        proposedAction: q ? { kind: "none" } : { kind: "offer_booking" },
      };
    }

    // 6. Grounded answer + one intake question.
    const grounded = demoGroundedAnswer(topic);
    const q = nextQuestion(qualification);
    const action: ProposedAction = q == null ? { kind: "create_lead" } : { kind: "none" };

    let reply: string;
    if (grounded && q) reply = `${grounded}\n\n${q}`;
    else if (grounded) reply = `${grounded} I have what I need — the Northstar team will follow up shortly.`;
    else if (q) {
      reply = topic === "unknown"
        ? `A Northstar team member can confirm the details on that. In the meantime, ${q.charAt(0).toLowerCase()}${q.slice(1)}`
        : q;
    } else reply = "Thank you — I have what I need. The Northstar team will follow up shortly.";

    // Privacy nudge if the visitor volunteered something sensitive-looking.
    if (/\b(password|credit card|card number|sin|social insurance|ssn|health card)\b/i.test(text)) {
      reply = `${DEMO_CONSENT_NOTE}\n\n${reply}`;
    }

    return { reply, proposedExtraction: baseExtraction, proposedAction: action };
  }
}
