import { AI_DISCLOSURE, PRIVACY_NOTE } from "@/lib/receptionist/knowledge";
import { draftConsultativeResponse } from "@/lib/receptionist/response";
import type { ModelContext, ModelReply, ProposedAction, ReceptionistModel } from "@/lib/receptionist/model/adapter";
import type { QualificationFields } from "@/lib/receptionist/schema";

export class DeterministicModel implements ReceptionistModel {
  readonly name = "deterministic";

  async respond(context: ModelContext): Promise<ModelReply> {
    const { transcript, qualification, visitorFlags, classification, retrieval, plan } = context;
    const text = [...transcript].reverse().find((t) => t.role === "visitor")?.text ?? "";

    if (visitorFlags.some((f) => [
      "system_prompt_exfil", "override_attempt", "role_reassignment", "action_forgery",
      "authority_claim", "impersonation_owner", "data_exfil",
    ].includes(f))) {
      return {
        reply: `I can help with Regulus services and automation opportunities, but I cannot change system controls or expose private information. ${AI_DISCLOSURE} What business workflow would you like to improve?`,
        proposedAction: { kind: "none" },
        evidenceIds: ["ai.disclosure"],
      };
    }

    const wantsHuman = qualification.human_requested || /\b(human|person|someone real|representative|agent)\b/i.test(text);
    if (wantsHuman) {
      return {
        reply: "Yes — I can route your request to the Regulus team. What is the best email for the follow-up?",
        proposedExtraction: { human_requested: true },
        proposedAction: { kind: "request_human" },
        evidenceIds: ["company.contact"],
      };
    }

    const baseExtraction: Partial<QualificationFields> = {};
    if (classification.intent !== "unknown" && !["ai_disclosure", "privacy"].includes(classification.intent)) {
      baseExtraction.inquiry_type = classification.intent;
    }
    const problemSignal = /\b(?:miss(?:ed|ing)?|lose|lost|slow|manual|after hours|bottleneck|delay|repetitive|follow-?up|fragmented|scattered|no[- ]show|problem|issue|struggl|need to improve|want to improve)\b/i;
    if (text.length >= 15 && problemSignal.test(text)) {
      baseExtraction.business_problem = text.slice(0, 1000);
      baseExtraction.pain_points = [text.slice(0, 300)];
    }
    const nameMatch = text.match(/\b(?:i'?m|i am|my name is|this is)\s+([A-Z][a-zA-Z'-]{1,30})\b/);
    if (nameMatch) baseExtraction.visitor_name = nameMatch[1];
    const orgMatch = text.match(/\b(?:i (?:run|own)|we're|at|for|my (?:business|company|clinic|firm|practice) is)\s+([A-Z][\w &'-]{2,40})/);
    if (orgMatch) baseExtraction.company_name = orgMatch[1].trim();

    const previousReplies = transcript.filter((t) => t.role === "receptionist").map((t) => t.text);
    const draft = draftConsultativeResponse(classification, retrieval, qualification, plan, text, previousReplies);
    let reply = draft.reply;
    if (/\b(password|credit card|card number|sin|social insurance|ssn)\b/i.test(text)) {
      reply = `${PRIVACY_NOTE}\n\n${reply}`;
    }

    const action: ProposedAction = { kind: plan.proposed_action };
    if (plan.primary_goal === "offer_booking") {
      baseExtraction.booking_intent = true;
    }

    return {
      reply,
      proposedExtraction: baseExtraction,
      proposedAction: action,
      evidenceIds: draft.evidenceIds,
    };
  }
}
