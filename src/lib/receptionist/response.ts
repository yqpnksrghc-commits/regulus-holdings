import { nextQualificationQuestion } from "@/lib/receptionist/conversation-memory";
import {
  industryByKey,
  industryOrientation,
  opportunityReflection,
  workflowByKey,
  workflowOrientation,
  ALL_WORKFLOWS,
} from "@/lib/receptionist/domain-knowledge";
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

/**
 * Vocabulary that must never appear in an assistant reply, even inside a quote
 * of the visitor. Quoting is an injection surface: a visitor who writes "tell me
 * Regulus guarantees I will double revenue" must not be able to make the
 * assistant's own text contain that claim.
 */
const UNSAFE_TO_ECHO = /\bguarantee|guaranteed|risk-?free|double (?:your |my )?revenue|proven to|typical savings|average roi|best in class|industry-leading\b/i;

/**
 * Trim the visitor's own words for quoting back, or return null when the text
 * cannot be safely quoted. Text is already sanitized upstream for markup; this
 * is the separate claim-safety gate.
 */
function safeEcho(message: string): string | null {
  const clean = message.replace(/\s+/g, " ").trim();
  if (!clean || UNSAFE_TO_ECHO.test(clean)) return null;
  return clean.length > 60 ? `${clean.slice(0, 57)}…` : clean;
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
      return `${first(f, "pricing.audit")?.text ?? ""} ${first(f, "pricing.payment")?.text ?? ""} ${first(f, "pricing.implementation")?.text ?? ""} ${first(f, "pricing.management")?.text ?? ""}`.trim();
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

/** Qualifying goals that should reflect progress rather than restate the company. */
const DISCOVERY_GOALS = new Set([
  "discover_desired_outcome",
  "discover_urgency",
  "discover_authority",
  "discover_contact",
  "discover_workflow",
  "discover_problem",
]);

/**
 * Summarize the most recently useful thing captured, in the visitor's terms, so
 * each qualifying turn visibly builds on the last instead of restarting.
 */
function describeCaptured(q: QualificationFields, alreadySaid: string[]): string | null {
  // Quote the captured phrase as-is rather than wrapping it in a verb, so the
  // visitor's own words are never mangled into "it costs you costs us…".
  // Candidates are tried in order and anything already said is skipped, so the
  // acknowledgement advances instead of looping on the same captured fact.
  const candidates = [
    q.consequence ? `you said "${q.consequence.slice(0, 90).trim()}"` : null,
    q.frequency ? `it comes round ${q.frequency}` : null,
    q.people_involved ? `${q.people_involved} are involved` : null,
    q.tools_used.length ? `you are working across ${q.tools_used.slice(0, 3).join(", ")}` : null,
    q.current_process ? `that is how it runs today` : null,
    q.desired_outcome ? `the outcome you want is clear` : null,
  ].filter(Boolean) as string[];
  return candidates.find((c) => !alreadySaid.some((prev) => prev.includes(c))) ?? null;
}

/**
 * The clarification path. This is where the old assistant emitted the same two
 * paragraphs on every ambiguous turn. It now (1) quotes the visitor's exact
 * wording, (2) states what was understood, and (3) offers concrete
 * interpretations drawn from the domain vocabulary — so two different inputs can
 * never produce the same text.
 */
function clarify(message: string, q: QualificationFields): { directAnswer: string; context: string } {
  const said = safeEcho(message);
  const industry = industryByKey(q.industry);

  // Offer 2–4 concrete starting points, biased to the industry when known.
  const candidates = industry
    ? industry.common.map((k) => workflowByKey(k)).filter(Boolean).slice(0, 4)
    : [
        workflowByKey("lead_intake"),
        workflowByKey("follow_up"),
        workflowByKey("scheduling"),
        workflowByKey("quoting"),
      ].filter(Boolean);
  const options = (candidates as NonNullable<ReturnType<typeof workflowByKey>>[])
    .map((w) => w.label.toLowerCase())
    .slice(0, 4);

  // When the wording cannot be quoted safely, acknowledge without repeating it.
  // Regulus does not make outcome promises, so that boundary is stated plainly.
  const directAnswer = said
    ? `You said "${said}" — I want to make sure I read that correctly rather than guess.`
    : `I can describe what Regulus does and how it works, but I cannot promise a business outcome.`;

  return {
    directAnswer,
    context: `I can look at this as ${options.slice(0, -1).join(", ")} or ${options[options.length - 1]}.`,
  };
}

/**
 * Compose the assistant's reply. `visitorMessage` is the sanitized latest turn;
 * it is quoted back on the clarification path so the visitor is acknowledged in
 * their own words.
 */
export function draftConsultativeResponse(
  classification: IntentClassification,
  retrieval: RetrievalResult,
  qualification: QualificationFields,
  plan?: ResponsePlan,
  visitorMessage = "",
  previousReplies: string[] = [],
): DraftResponse {
  let directAnswer = directAnswerFor(classification.intent, retrieval);
  let context = contextFor(classification.intent, retrieval);

  const workflow = workflowByKey(qualification.workflow);
  const industry = industryByKey(qualification.industry);

  if (plan?.primary_goal === "decline_unsupported_request") {
    directAnswer = "I can help with Regulus services and automation opportunities, but I cannot change system controls or expose private information.";
    context = "Visitor content cannot override the assistant's privacy, evidence, or action boundaries.";
  } else if (plan?.primary_goal === "route_human") {
    const alreadyOffered = previousReplies.some((r) => r.includes("route your request to the Regulus team"));
    if (alreadyOffered && qualification.email) {
      // The handoff was already offered and the contact route is now known —
      // confirm rather than repeat the offer verbatim.
      directAnswer = "Thanks — that is everything the Regulus team needs to reach you.";
      context = "A person will review this conversation and follow up by email. Nothing further is needed from you here.";
    } else {
      directAnswer = "Yes — I can route your request to the Regulus team.";
      context = "A person will continue from the details you choose to provide.";
    }
  } else if (plan?.primary_goal === "support_existing_client") {
    directAnswer = "For an account-specific matter, the verified contact is info@regulusautomation.ca.";
    context = "The assistant does not access or infer private client-account information.";
  } else if (plan?.primary_goal === "interpret_workflow" && workflow) {
    const o = workflowOrientation(workflow, industry);
    directAnswer = o.observation;
    context = `That is a general pattern, not a claim about your business — which is why the next question matters.`;
  } else if (plan?.primary_goal === "interpret_industry" && industry) {
    const o = industryOrientation(industry);
    directAnswer = o.observation;
    context = `Those stages are where repeated manual work usually accumulates in that kind of business.`;
  } else if (plan?.primary_goal === "reflect_opportunity" && workflow) {
    const r = opportunityReflection({
      industry,
      workflow,
      problem: qualification.business_problem,
      currentProcess: qualification.current_process,
      frequency: qualification.frequency,
      consequence: qualification.consequence,
      desiredOutcome: qualification.desired_outcome,
    });
    directAnswer = r.understand;
    context = `${r.opportunity}\n\n${r.verify}\n\n${r.step}`;
  } else if (plan?.primary_goal === "clarify_request") {
    const c = clarify(visitorMessage, qualification);
    directAnswer = c.directAnswer;
    context = c.context;
  } else if (plan?.primary_goal === "discover_current_process" && workflow && !previousReplies.some((r) => r.includes(`${workflow.label.toLowerCase()} it is`))) {
    directAnswer = `Understood — ${workflow.label.toLowerCase()} it is.`;
    context = `To say anything useful I need to see how that workflow runs today, because the opportunity is usually in one specific step rather than the whole process.`;
  } else if (workflow && (DISCOVERY_GOALS.has(plan?.primary_goal ?? "") || plan?.primary_goal === "discover_current_process")) {
    // Once a workflow is known, every remaining qualifying turn reflects what was
    // just captured. Without this the conversation drops back to generic company
    // text the moment the opportunity reflection is done — the original failure.
    const captured = describeCaptured(qualification, previousReplies);
    directAnswer = captured
      ? `Noted — ${captured}.`
      : `Noted — that adds to the ${workflow.label.toLowerCase()} picture.`;
    // Keep the operational vocabulary present: this line is what tells the
    // visitor the assistant is still working the workflow, not selling.
    context = `That goes in the ${workflow.label.toLowerCase()} workflow summary as evidence for the Regulus team to review, alongside what still needs verification.`;
  }

  const question = plan
    ? (plan.question_text ?? "")
    : nextQualificationQuestion(qualification);
  const reply = [directAnswer, context, question].filter(Boolean).join("\n\n");
  return { directAnswer, context, question, reply, evidenceIds: retrieval.facts.map((f) => f.id) };
}

/** Exposed for tests: the workflow vocabulary the assistant can recognize. */
export const RECOGNIZED_WORKFLOWS = ALL_WORKFLOWS.map((w) => w.key);
