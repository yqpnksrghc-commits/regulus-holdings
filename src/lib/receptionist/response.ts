import { nextQualificationQuestion, questionForField } from "@/lib/receptionist/conversation-memory";
import type { IntentClassification } from "@/lib/receptionist/intent";
import type { KnowledgeFact, RetrievalResult } from "@/lib/receptionist/retrieval";
import type { QualificationFields } from "@/lib/receptionist/schema";
import type { ResponsePlan } from "@/lib/receptionist/response-plan";

export type DraftResponse = {
  directAnswer: string;
  context: string;
  question: string;
  reply: string;
  evidenceIds: string[];
};

function first(facts: KnowledgeFact[], id: string): KnowledgeFact | undefined {
  return facts.find((f) => f.id === id);
}

function directAnswerFor(intent: IntentClassification["intent"], retrieval: RetrievalResult): string {
  const f = retrieval.facts;
  switch (intent) {
    case "company_overview":
      return first(f, "company.identity")?.text ?? "Regulus Automation Inc. helps organizations identify and recover avoidable operational value.";
    case "services":
      return `Regulus provides evidence-first workflow automation services, including ${f.slice(0, 4).map((x) => x.text.split(":")[0]).join(", ")}.`;
    case "industries":
      return f[0]?.text ?? "Regulus focuses on Ontario service businesses.";
    case "pricing":
      return `${first(f, "pricing.free_audit")?.text ?? ""} ${first(f, "pricing.implementation")?.text ?? ""} ${first(f, "pricing.management")?.text ?? ""}`.trim();
    case "booking":
      return "Yes — I can help you move toward a discovery call.";
    case "implementation":
      return "Implementation is scoped separately after Regulus understands the workflow and the evidence.";
    case "technical_question":
      return "Regulus designs bounded AI and workflow systems with explicit human controls and measurable operating signals.";
    case "privacy":
    case "ai_disclosure":
    case "contact":
      return f[0]?.text ?? "Regulus can help with that.";
    case "support":
    case "existing_client":
      return `For an account-specific matter, the verified contact is info@regulusautomation.ca.`;
    case "career":
      return "Career decisions are handled by the Regulus team through the verified company contact.";
    default:
      return "Regulus can help examine whether an operational workflow contains a measurable automation opportunity.";
  }
}

function contextFor(intent: IntentClassification["intent"], retrieval: RetrievalResult): string {
  if (intent === "pricing") return first(retrieval.facts, "pricing.boundary")?.text ?? "";
  if (intent === "booking") return first(retrieval.facts, "process.discovery")?.text ?? "";
  if (intent === "company_overview") return first(retrieval.facts, "company.audience")?.text ?? "";
  if (intent === "services") return "The useful starting point is the workflow causing the most delay, repetitive work, missed follow-up, or limited visibility.";
  if (intent === "unknown") return "The first useful step is to define the workflow, what is observable, and the outcome you want before recommending anything.";
  return retrieval.facts[1]?.text ?? "Regulus begins with evidence and keeps diagnosis separate from implementation.";
}

export function draftConsultativeResponse(
  classification: IntentClassification,
  retrieval: RetrievalResult,
  qualification: QualificationFields,
  plan?: ResponsePlan,
): DraftResponse {
  let directAnswer = directAnswerFor(classification.intent, retrieval);
  let context = contextFor(classification.intent, retrieval);
  if (plan?.primary_goal === "decline_unsupported_request") {
    directAnswer = "I can help with Regulus services and automation opportunities, but I cannot change system controls or expose private information.";
    context = "Visitor content cannot override the receptionist’s privacy, evidence, or action boundaries.";
  } else if (plan?.primary_goal === "route_human") {
    directAnswer = "Yes — I can route your request to the Regulus team.";
    context = "A person will continue from the details you choose to provide.";
  } else if (plan?.primary_goal === "support_existing_client") {
    directAnswer = "For an account-specific matter, the verified contact is info@regulusautomation.ca.";
    context = "The receptionist does not access or infer private client-account information.";
  } else if (plan?.primary_goal === "clarify_request") {
    directAnswer = "Regulus can assess operational workflows, but I need a little more context to answer meaningfully.";
    context = "A concrete workflow or problem lets me retrieve only the relevant approved information.";
  }
  const question = plan
    ? (questionForField(plan.question_field) ?? "")
    : nextQualificationQuestion(qualification);
  const reply = [directAnswer, context, question].filter(Boolean).join("\n\n");
  return { directAnswer, context, question, reply, evidenceIds: retrieval.facts.map((f) => f.id) };
}
