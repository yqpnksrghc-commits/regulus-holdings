import type { ConversationGoalSelection, ConversationGoal } from "@/lib/receptionist/goal";
import type { IntentClassification } from "@/lib/receptionist/intent";
import type { RetrievalResult } from "@/lib/receptionist/retrieval";
import type { QualificationFields } from "@/lib/receptionist/schema";
import { questionForField } from "@/lib/receptionist/conversation-memory";

export type ResponsePlan = {
  primary_goal: ConversationGoal;
  direct_answer_required: boolean;
  knowledge_ids: string[];
  context_purpose: "explain" | "build_trust" | "set_boundary" | "show_relevance" | "none";
  question_field: keyof QualificationFields | null;
  proposed_action: "none" | "offer_booking" | "request_human" | "create_lead" | "mark_out_of_scope";
  expected_progress: string;
};

const GOAL_FIELD: Partial<Record<ConversationGoal, keyof QualificationFields>> = {
  discover_business_type: "business_type",
  discover_industry: "industry",
  discover_workflow: "business_problem",
  discover_problem: "business_problem",
  discover_current_process: "current_process",
  discover_desired_outcome: "desired_outcome",
  discover_urgency: "urgency",
  discover_authority: "decision_authority",
  discover_contact: "email",
};

function earliestRelevantMissing(q: QualificationFields): keyof QualificationFields | null {
  if (!q.business_type && !q.industry) return "industry";
  if (!q.business_problem && !q.current_process) return "business_problem";
  if (!q.desired_outcome) return "desired_outcome";
  if (!q.urgency) return "urgency";
  if (q.decision_authority == null) return "decision_authority";
  if (!q.email) return "email";
  return null;
}

function nextNonRepeatedField(
  q: QualificationFields,
  preferred: keyof QualificationFields | null,
  previousReplies: string[],
): keyof QualificationFields | null {
  const wasAsked = (field: keyof QualificationFields) =>
    previousReplies.some((reply) => reply.includes(questionForField(field) ?? ""));
  if (!preferred || !wasAsked(preferred)) return preferred;
  const candidates: (keyof QualificationFields)[] = [
    "industry", "business_problem", "desired_outcome", "urgency", "decision_authority", "email",
  ];
  for (const field of candidates) {
    if (field === preferred) continue;
    const value = q[field];
    if ((value == null || value === "") && !wasAsked(field)) return field;
  }
  return null;
}

export function createResponsePlan(
  goal: ConversationGoalSelection,
  classification: IntentClassification,
  retrieval: RetrievalResult,
  q: QualificationFields,
  previousReceptionistReplies: string[] = [],
): ResponsePlan {
  const primary = goal.selected_goal;
  const directAnswerRequired = primary === "answer_question" || [
    "explain_service", "explain_pricing", "build_trust", "support_existing_client",
    "decline_unsupported_request", "route_human", "offer_booking",
  ].includes(primary);

  let questionField = GOAL_FIELD[primary] ?? null;
  if (primary === "answer_question" || primary === "establish_relevance" || primary === "build_trust") {
    questionField = earliestRelevantMissing(q);
  }
  if (primary === "clarify_request") questionField = "business_problem";
  if (primary === "route_human" && !q.email) questionField = "email";
  if (primary === "offer_booking" && !q.email) questionField = "email";
  if (primary === "support_existing_client") questionField = null;
  if (primary === "decline_unsupported_request") questionField = "business_problem";
  questionField = nextNonRepeatedField(q, questionField, previousReceptionistReplies);

  let contextPurpose: ResponsePlan["context_purpose"] = "show_relevance";
  if (primary === "answer_question" || primary.startsWith("explain_")) contextPurpose = "explain";
  else if (primary === "build_trust") contextPurpose = "build_trust";
  else if (primary === "decline_unsupported_request" || primary === "support_existing_client") contextPurpose = "set_boundary";
  else if (primary === "close_gracefully") contextPurpose = "none";

  let action: ResponsePlan["proposed_action"] = "none";
  if (primary === "offer_booking" && q.email) action = "offer_booking";
  else if (primary === "route_human") action = "request_human";
  else if (primary === "decline_unsupported_request" && classification.intent === "unknown") action = "mark_out_of_scope";
  else if (primary === "discover_contact" && q.email) action = "create_lead";

  return {
    primary_goal: primary,
    direct_answer_required: directAnswerRequired,
    knowledge_ids: retrieval.facts.map((f) => f.id),
    context_purpose: contextPurpose,
    question_field: questionField,
    proposed_action: action,
    expected_progress: goal.expected_state_change,
  };
}
