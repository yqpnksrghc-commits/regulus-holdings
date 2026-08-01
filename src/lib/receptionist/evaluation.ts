import type { KnowledgeFact } from "@/lib/receptionist/retrieval";
import type { ConversationGoalSelection } from "@/lib/receptionist/goal";
import type { ResponsePlan } from "@/lib/receptionist/response-plan";
import { questionForField } from "@/lib/receptionist/conversation-memory";

export type Evaluation = {
  score: number;
  threshold: number;
  passed: boolean;
  checks: Record<string, boolean>;
};

function questionCount(text: string): number {
  return (text.match(/\?/g) || []).length;
}

export function evaluateQuality(reply: string, directAnswer: string): Evaluation {
  const checks = {
    direct_answer: reply.trim().toLowerCase().startsWith(directAnswer.trim().toLowerCase().slice(0, 24)),
    concise: reply.length >= 60 && reply.length <= 1000,
    understandable: !/\b(utilize|synerg|leverag(?:e|ing))\b/i.test(reply),
    confident: !/\b(maybe|probably|i think|i don't know)\b/i.test(reply),
    one_question: questionCount(reply) <= 1,
    no_repetition: new Set(reply.split(/\s+/).map((w) => w.toLowerCase())).size / Math.max(1, reply.split(/\s+/).length) > 0.45,
    useful: reply.split(/\s+/).length >= 18,
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { score, threshold: 6, passed: score >= 6, checks };
}

export function evaluateSales(reply: string): Evaluation {
  const checks = {
    trust: !/\bguarantee|risk-free|best in class|industry-leading\b/i.test(reply),
    expertise: /\bworkflow|operational|evidence|automation|inquiry|follow-up|assessment|audit|verified contact|account-specific|private client-account\b/i.test(reply),
    professionalism: !/[!]{2,}|\bawesome|amazing|revolutionary\b/i.test(reply),
    reduced_friction: !/\bcontact (?:a|the) representative\b/i.test(reply),
    continuation: questionCount(reply) <= 1,
    booking_path: /\bdiscovery|next step|arrange|book|business|workflow|problem|outcome|Regulus team|follow-up|verified contact\b/i.test(reply),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { score, threshold: 5, passed: score >= 5, checks };
}

const FORBIDDEN_CLAIMS = /\bguaranteed|guarantee revenue|typical savings|average roi|clients? (?:save|increase|grow)|proven to\b/i;

function normalized(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function validateEvidence(
  reply: string,
  evidenceIds: string[],
  retrieved: KnowledgeFact[],
  approvedComposition?: string,
): Evaluation {
  const allowed = new Set(retrieved.map((f) => f.id));
  const checks = {
    evidence_present: evidenceIds.length > 0,
    ids_retrieved: evidenceIds.every((id) => allowed.has(id)),
    no_forbidden_claims: !FORBIDDEN_CLAIMS.test(reply),
    approved_contact_only: !/@/.test(reply) || /info@regulusautomation\.ca/i.test(reply),
    approved_composition: approvedComposition === undefined || normalized(reply) === normalized(approvedComposition),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { score, threshold: 5, passed: score === 5, checks };
}

export function evaluateConversationProgress(
  reply: string,
  goal: ConversationGoalSelection,
  plan: ResponsePlan,
  previousReceptionistReplies: string[],
): Evaluation {
  // The plan carries its own question text (interpretive goals need wording no
  // generic field question can express); fall back to the field question.
  const plannedQuestion = plan.question_text ?? questionForField(plan.question_field);
  const latestPreviousQuestion = [...previousReceptionistReplies].reverse()
    .map((text) => text.split(/\n+/).findLast((part) => part.includes("?")) ?? "")
    .find(Boolean);
  const currentQuestion = reply.split(/\n+/).findLast((part) => part.includes("?")) ?? "";
  const checks = {
    one_primary_goal: Boolean(goal.selected_goal),
    plan_matches_goal: plan.primary_goal === goal.selected_goal,
    direct_answer_preserved: !plan.direct_answer_required || reply.split(/\n+/)[0].trim().length > 10,
    planned_question_used: plannedQuestion === null
      ? questionCount(reply) === 0
      : reply.includes(plannedQuestion),
    no_repeated_question: !latestPreviousQuestion || normalized(latestPreviousQuestion) !== normalized(currentQuestion),
    booking_not_forced: plan.proposed_action !== "offer_booking" || goal.selected_goal === "offer_booking",
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { score, threshold: 6, passed: score === 6, checks };
}
