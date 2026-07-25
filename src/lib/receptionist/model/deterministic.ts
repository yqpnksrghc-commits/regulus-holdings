/**
 * Deterministic receptionist model — the default adapter.
 *
 * It runs with no network and no paid API, so the entire system (and every test)
 * is reproducible. It is a genuine, useful receptionist: it classifies intent
 * from the latest message, answers ONLY from the approved knowledge, asks one
 * qualifying question at a time, and proposes actions the engine then validates.
 * Phase-1 production runs on this until a model provider is configured.
 */
import { groundedAnswer, requiresHumanConfirmation, AI_DISCLOSURE, PRIVACY_NOTE } from "@/lib/receptionist/knowledge";
import type { ModelContext, ModelReply, ProposedAction, ReceptionistModel } from "@/lib/receptionist/model/adapter";
import type { QualificationFields } from "@/lib/receptionist/schema";

/** Map the latest visitor message to an approved knowledge topic. */
function classifyTopic(text: string): string {
  const t = text.toLowerCase();
  if (/\b(price|pricing|cost|how much|fee|charge|rate|budget)\b/.test(t)) return "pricing";
  if (/\b(book|schedule|call|meeting|consult|discovery|demo|appointment)\b/.test(t)) return "booking";
  if (/\b(service|offer|do you|what do you|help with|automat|receptionist|follow-?up|lead)\b/.test(t)) return "services";
  if (/\b(who are you|what is regulus|about regulus|tell me about)\b/.test(t)) return "what_is_regulus";
  if (/\b(privacy|data|gdpr|store my|my information)\b/.test(t)) return "privacy";
  if (/\b(are you (a )?(bot|ai|human|robot|real))\b/.test(t)) return "ai_disclosure";
  if (/\b(contact|email|phone|reach)\b/.test(t)) return "contact";
  if (/\b(who do you (work|serve)|industr|clinic|dental|medical|professional service)\b/.test(t)) return "audience";
  // Escalation topics not in approved knowledge:
  if (/\b(refund|guarantee|warranty|contract|legal|sla|hire|job|career|discount|custom price)\b/.test(t)) return "escalate";
  return "unknown";
}

const NEXT_QUESTION: { field: keyof QualificationFields; ask: string }[] = [
  { field: "inquiry_type", ask: "What brings you to Regulus today — is there a specific workflow or problem you're looking to solve?" },
  { field: "business_problem", ask: "Where is value leaking most right now — missed leads, slow follow-up, or something else?" },
  { field: "company_name", ask: "What's the name of your business?" },
  { field: "email", ask: "What's the best email for a Regulus team member to reach you?" },
  { field: "visitor_name", ask: "And who should we address the follow-up to?" },
];

function nextQuestion(q: QualificationFields): string | null {
  for (const { field, ask } of NEXT_QUESTION) if (q[field] == null) return ask;
  return null;
}

export class DeterministicModel implements ReceptionistModel {
  readonly name = "deterministic";

  async respond(context: ModelContext): Promise<ModelReply> {
    const { transcript, qualification, visitorFlags } = context;
    const lastVisitor = [...transcript].reverse().find((t) => t.role === "visitor");
    const text = lastVisitor?.text ?? "";

    // 1. Injection/manipulation: never obey; answer as data, hold the boundary.
    if (visitorFlags.some((f) => f === "system_prompt_exfil" || f === "override_attempt" || f === "role_reassignment" || f === "action_forgery" || f === "authority_claim" || f === "impersonation_owner" || f === "data_exfil")) {
      return {
        reply: `I can only help with questions about Regulus and capturing your details for the team. ${AI_DISCLOSURE} How can I help with your automation needs?`,
        proposedAction: { kind: "none" },
      };
    }

    // 2. Explicit human request always wins.
    const wantsHuman = qualification.human_requested || /\b(human|person|someone real|representative|agent)\b/i.test(text);
    if (wantsHuman) {
      return {
        reply: "Of course — I'll flag this for a Regulus team member to follow up with you directly. Could you share the best email so they can reach you?",
        proposedExtraction: { human_requested: true },
        proposedAction: { kind: "request_human" },
      };
    }

    const topic = classifyTopic(text);

    // Deterministic free-text extraction proposal. reconcile only fills fields
    // that are still unknown, so proposing every turn is safe.
    const baseExtraction: Partial<QualificationFields> = {};
    if (topic !== "unknown" && topic !== "ai_disclosure" && topic !== "privacy") baseExtraction.inquiry_type = topic;
    if (text.length >= 15 && !/^\s*(hi|hello|hey|thanks|thank you)\b/i.test(text)) baseExtraction.business_problem = text.slice(0, 1000);
    const nameMatch = text.match(/\b(?:i'?m|i am|my name is|this is)\s+([A-Z][a-zA-Z'-]{1,30})\b/);
    if (nameMatch) baseExtraction.visitor_name = nameMatch[1];
    const orgMatch = text.match(/\b(?:i (?:run|own)|we're|at|for|my (?:business|company|clinic|firm|practice) is)\s+([A-Z][\w &'-]{2,40})/);
    if (orgMatch) baseExtraction.company_name = orgMatch[1].trim();

    // 3. Escalation topics: defer to a human, don't guess.
    if (topic === "escalate" || (topic === "unknown" && requiresHumanConfirmation(topic) && /\?/.test(text))) {
      const grounded = groundedAnswer(topic);
      if (!grounded && topic === "escalate") {
        return {
          reply: "That's a great question, and I want to get it exactly right — a Regulus team member will confirm the specifics for your situation. Could you share your email so someone can follow up?",
          proposedAction: { kind: "request_human" },
        };
      }
    }

    // 4. Booking intent: offer a discovery call (engine decides bookability).
    if (topic === "booking" || qualification.booking_intent) {
      const q = nextQuestion(qualification);
      return {
        reply: q
          ? `Happy to set up a discovery call. ${groundedAnswer("discovery")} First, ${q.charAt(0).toLowerCase()}${q.slice(1)}`
          : "Happy to set up a discovery call. A Regulus team member will confirm a time with you by email — I'll pass your details along now.",
        proposedExtraction: { ...baseExtraction, booking_intent: true },
        proposedAction: q ? { kind: "none" } : { kind: "offer_booking" },
      };
    }

    // 5. Grounded answer + one qualifying question.
    const grounded = groundedAnswer(topic);
    const q = nextQuestion(qualification);
    const action: ProposedAction = q == null ? { kind: "create_lead" } : { kind: "none" };

    let reply: string;
    if (grounded && q) reply = `${grounded}\n\n${q}`;
    else if (grounded) reply = `${grounded} I have what I need to pass this to the team — a Regulus team member will follow up shortly.`;
    else if (q) {
      // No approved answer for the topic: acknowledge, keep to the boundary, qualify.
      reply = topic === "unknown"
        ? `A Regulus team member can confirm the details on that. ${q}`
        : q;
    } else reply = "Thank you — I have what I need. A Regulus team member will follow up with you shortly.";

    // Privacy nudge if the visitor volunteered something sensitive-looking.
    if (/\b(password|credit card|card number|sin|social insurance|ssn)\b/i.test(text)) {
      reply = `${PRIVACY_NOTE}\n\n${reply}`;
    }

    return { reply, proposedExtraction: baseExtraction, proposedAction: action };
  }
}
