import type { ConversationState, QualificationFields } from "@/lib/receptionist/schema";
import type { IntentClassification } from "@/lib/receptionist/intent";

export const CONVERSATION_GOALS = [
  "answer_question",
  "clarify_request",
  "establish_relevance",
  "discover_business_type",
  "discover_industry",
  "discover_workflow",
  "discover_problem",
  "discover_current_process",
  "discover_desired_outcome",
  "discover_urgency",
  "discover_authority",
  "discover_contact",
  "explain_service",
  "explain_pricing",
  "build_trust",
  "offer_assessment",
  "offer_booking",
  "route_human",
  "support_existing_client",
  "decline_unsupported_request",
  "close_gracefully",
] as const;

export type ConversationGoal = (typeof CONVERSATION_GOALS)[number];

export type ConversationGoalSelection = {
  selected_goal: ConversationGoal;
  reason: string;
  confidence: number;
  blocked_goals: ConversationGoal[];
  required_known_fields: (keyof QualificationFields)[];
  expected_state_change: string;
};

export type GoalSelectionInput = {
  state: ConversationState;
  message: string;
  classification: IntentClassification;
  qualification: QualificationFields;
  visitorFlags: string[];
};

const DIRECT_QUESTION = /\?|^(who|what|when|where|why|how|can|could|do|does|is|are|will|would|should)\b/i;
const BUSINESS_RELEVANT = new Set([
  "company_overview", "services", "industries", "pricing", "booking",
  "technical_question", "implementation", "unknown",
]);

function result(
  selected_goal: ConversationGoal,
  reason: string,
  confidence: number,
  blocked_goals: ConversationGoal[],
  required_known_fields: (keyof QualificationFields)[],
  expected_state_change: string,
): ConversationGoalSelection {
  return { selected_goal, reason, confidence, blocked_goals, required_known_fields, expected_state_change };
}

export function selectConversationGoal(input: GoalSelectionInput): ConversationGoalSelection {
  const { state, message, classification, qualification: q, visitorFlags } = input;
  const blocked: ConversationGoal[] = [];
  const unsafe = visitorFlags.some((f) => [
    "system_prompt_exfil", "override_attempt", "role_reassignment", "action_forgery",
    "authority_claim", "impersonation_owner", "data_exfil",
  ].includes(f));

  if (unsafe) return result("decline_unsupported_request", "Safety boundary takes priority.", 0.99, ["offer_booking"], [], "Boundary held; conversation remains safe.");
  if (classification.intent === "privacy") return result("build_trust", "Visitor asked about privacy or data handling.", 0.98, ["discover_contact"], [], "Privacy boundary explained.");
  if (q.human_requested || /\b(?:talk|speak|connect|chat)\s+(?:to|with)\s+(?:a\s+)?(?:human|person|someone|real person|representative|agent|staff|team)\b|\b(?:need|want)\s+(?:a\s+)?human\b|\breal\s+person\b|\bhuman\s+(?:please|now)\b/i.test(message)) {
    return result("route_human", "Visitor explicitly requested a person.", 0.99, [], ["email"], "Human takeover requested.");
  }
  if (classification.intent === "existing_client" || classification.intent === "support") {
    return result("support_existing_client", "Account-specific support requires the verified support route.", 0.96, ["offer_booking"], [], "Visitor receives the verified support path.");
  }
  if (classification.intent === "booking" || q.booking_intent) {
    const knownRelevance = Boolean(q.business_problem || q.current_process || (q.inquiry_type && q.inquiry_type !== "booking"));
    if (!knownRelevance) blocked.push("offer_booking");
    return result(
      knownRelevance ? "offer_booking" : "discover_workflow",
      knownRelevance ? "Visitor requested booking and a relevant need is known." : "Booking was requested before a meaningful workflow was known.",
      knownRelevance ? 0.98 : 0.92,
      blocked,
      knownRelevance ? ["email"] : ["business_problem"],
      knownRelevance ? "Move toward verified availability." : "Establish enough relevance to justify a call.",
    );
  }

  if (DIRECT_QUESTION.test(message.trim())) {
    return result("answer_question", "A direct visitor question must be answered before qualification advances.", 0.98, [], [], "Question answered; one relevant next step may be offered.");
  }

  if (classification.intent === "unknown" && !q.business_problem && !q.current_process) {
    return result("clarify_request", "The request is too ambiguous to answer meaningfully from approved knowledge.", 0.82, ["offer_booking"], [], "Visitor supplies a clearer request.");
  }

  if (!BUSINESS_RELEVANT.has(classification.intent)) {
    return result("close_gracefully", "No safe or relevant commercial progression is available.", 0.8, ["offer_booking"], [], `Conversation remains in ${state}.`);
  }

  if (!q.business_type && !q.industry) return result("discover_industry", "Industry is the earliest relevant missing context.", 0.88, [], ["industry"], "Industry becomes known.");
  if (!q.business_problem && !q.current_process) return result("discover_workflow", "A concrete workflow or operational problem is needed.", 0.9, [], ["business_problem"], "Workflow or problem becomes known.");
  if (!q.desired_outcome) return result("discover_desired_outcome", "Desired outcome is the next useful qualification distinction.", 0.86, [], ["desired_outcome"], "Desired outcome becomes known.");
  if (!q.urgency) return result("discover_urgency", "Timing is relevant after the problem and outcome are known.", 0.82, [], ["urgency"], "Urgency becomes known.");
  if (q.decision_authority == null) return result("discover_authority", "Decision involvement is relevant after need and timing.", 0.78, [], ["decision_authority"], "Decision path becomes known.");
  if (!q.email) return result("discover_contact", "A useful opportunity is established and a follow-up route is missing.", 0.9, [], ["email"], "Contact route becomes known.");
  return result("offer_booking", "Relevance and qualification are sufficient for a discovery call.", 0.9, [], ["email"], "Move toward verified availability.");
}
