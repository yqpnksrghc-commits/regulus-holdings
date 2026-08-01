/**
 * Conversation orchestrator — the pure reducer at the center of the engine.
 *
 * It sequences the seven separated concerns for one visitor turn:
 *   1. sanitize + guard (injection/spam)   [injection.ts, done by caller]
 *   2. model proposes reply + extraction    [model adapter]
 *   3. deterministic extraction (authoritative) + reconcile model proposal
 *   4. policy validation (knowledge/consent/booking gates)
 *   5. action PROPOSAL -> decided effect
 *   6. validated state transition
 *   7. user-facing reply
 *
 * It performs NO I/O. It returns the next record plus an `effect` the caller
 * executes deterministically (lead creation, booking) — the model never acts.
 */
import type { LeadInput } from "@/lib/leads";
import { detectInjection, detectSpam, redactSecrets, sanitize } from "@/lib/receptionist/injection";
import { extractFromVisitorText, extractSlotSelection, hasMinimumViableLead, reconcileModelExtraction } from "@/lib/receptionist/extraction";
import { AI_DISCLOSURE, PRIVACY_NOTE } from "@/lib/receptionist/knowledge";
import { classifyIntent } from "@/lib/receptionist/intent";
import { retrieveKnowledge } from "@/lib/receptionist/retrieval";
import { rememberAnsweredQuestion } from "@/lib/receptionist/conversation-memory";
import { draftConsultativeResponse } from "@/lib/receptionist/response";
import { evaluateQuality, evaluateSales, validateEvidence } from "@/lib/receptionist/evaluation";
import { evaluateConversationProgress } from "@/lib/receptionist/evaluation";
import { selectConversationGoal } from "@/lib/receptionist/goal";
import { createResponsePlan } from "@/lib/receptionist/response-plan";
import { industryByKey, opportunityReflection, workflowByKey } from "@/lib/receptionist/domain-knowledge";
import type { ReceptionistModel } from "@/lib/receptionist/model/adapter";
import type { AvailabilityProvider } from "@/lib/receptionist/calendar/adapter";
import { slotsAreFresh } from "@/lib/receptionist/calendar/availability";
import { transition } from "@/lib/receptionist/state-machine";
import {
  emptyQualification,
  isDurableBookingEvidence,
  isTerminal,
  type BookingEvidence,
  type ConversationRecord,
  type ConversationState,
  type OfferedSlot,
  type QualificationFields,
} from "@/lib/receptionist/schema";

/** Numbered list of offered slots for a receptionist reply. */
function slotList(slots: OfferedSlot[]): string {
  return slots.map((s, i) => `${i + 1}) ${s.label}`).join("\n");
}

/** Availability that returns no slots — the default when no calendar is configured. */
const noAvailability: AvailabilityProvider = async () => [];

/**
 * Phase 1 orientation. It opens on the visitor's problem, not on Regulus and
 * not on a form — the assistant has to be useful before it asks for anything.
 */
export const GREETING_MESSAGE =
  `${AI_DISCLOSURE}\n\nWhat takes too much time in your business — or too often gets missed?`;

/** Optional starting points offered as buttons. Tapping one sends its label. */
export const STARTING_POINTS = [
  "New enquiries",
  "Follow-up",
  "Scheduling",
  "Estimates or quotes",
  "Customer communication",
  "Payroll or administration",
  "Reporting",
  "Something else",
] as const;

/** A booking provider returns durable calendar evidence, or null. No calendar
 * is configured in Phase 1, so the default provider always returns null and
 * every booking attempt fails closed to FOLLOW_UP_REQUIRED. */
export type BookingProvider = (record: ConversationRecord) => Promise<BookingEvidence | null>;
export const noCalendarProvider: BookingProvider = async () => null;

export type TurnEffect =
  | { kind: "none" }
  | { kind: "create_lead"; reason: "qualified" | "human_requested" | "follow_up"; leadInput: LeadInput };

export function newConversation(id: string, sourcePage: string | null, campaign: string | null, now: Date): ConversationRecord {
  const iso = now.toISOString();
  return {
    schema_version: "1.0",
    conversation_id: id,
    channel: "website",
    state: "GREETING",
    qualification: { ...emptyQualification(), source_page: sourcePage, campaign_parameters: campaign },
    confidence_by_field: {},
    transcript: [{ role: "receptionist", text: GREETING_MESSAGE, at: iso }],
    lead_id: null,
    lead_pipeline_state: null,
    booking_evidence: null,
    offered_slots: [],
    offered_at: null,
    selected_slot: null,
    booked_at: null,
    follow_up_required: false,
    human_takeover: false,
    duplicate_of: null,
    flags: [],
    error: null,
    created_at: iso,
    updated_at: iso,
    source_page: sourcePage,
    campaign_parameters: campaign,
    extraction_source: "deterministic",
  };
}

function mergeConfidence(a: ConversationRecord["confidence_by_field"], b: ConversationRecord["confidence_by_field"]) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) if (typeof v === "number") out[k as keyof typeof out] = v;
  return out;
}

/**
 * Phase 6 — the structured internal brief.
 *
 * Every line is either something the visitor actually said or an explicitly
 * labelled hypothesis. Unknowns are printed as "not stated" rather than omitted,
 * so a reader can tell the difference between "no problem here" and "we never
 * asked". This text becomes the lead's value_leak_description, which is what
 * lands in the existing review pipeline.
 */
export function buildLeadBrief(record: ConversationRecord): string {
  const q = record.qualification;
  const v = (x: string | null | undefined) => (x && String(x).trim() ? String(x).trim() : "not stated");
  const list = (x: string[]) => (x.length ? x.join(", ") : "not stated");
  const workflow = workflowByKey(q.workflow);
  const industry = industryByKey(q.industry);

  return [
    `REGULUS BUSINESS ASSISTANT — LEAD BRIEF`,
    `Conversation: ${record.conversation_id}`,
    ``,
    `CONTACT`,
    `- Name: ${v(q.visitor_name)}`,
    `- Business: ${v(q.company_name)}`,
    `- Role: ${v(q.visitor_role)}`,
    `- Email: ${v(q.email)}`,
    `- Phone: ${v(q.phone)}`,
    `- Preferred contact: ${v(q.preferred_contact_method)}`,
    `- Consent to follow up: ${q.consent_to_follow_up ? "yes" : "not given"}`,
    ``,
    `SITUATION`,
    `- Industry: ${industry ? industry.label : v(q.industry)}`,
    `- Company size: ${v(q.business_size)}`,
    `- Workflow: ${workflow ? workflow.label : v(q.workflow)}`,
    `- Stated problem: ${v(q.business_problem)}`,
    `- Current process: ${v(q.current_process)}`,
    `- Frequency: ${v(q.frequency)}`,
    `- People involved: ${v(q.people_involved)}`,
    `- Tools named: ${list(q.tools_used)}`,
    `- Consequence: ${v(q.consequence)}`,
    `- Desired outcome: ${v(q.desired_outcome)}`,
    `- Urgency: ${v(q.urgency)}`,
    ``,
    `ASSESSMENT (assistant hypothesis — not verified)`,
    `- Possible automation: ${v(q.automation_hypothesis)}`,
    `- Confidence: ${v(q.hypothesis_confidence)}`,
    `- Missing evidence: ${list(q.missing_evidence)}`,
    `- Contraindication: ${workflow ? workflow.contraindication : "not assessed"}`,
    ``,
    `NEXT STEP`,
    `- Requested: ${q.booking_intent ? "discovery conversation" : q.human_requested ? "speak with a person" : "follow-up"}`,
    `- Recommended human follow-up: confirm the current process and volumes before proposing anything.`,
    ``,
    `PROVENANCE`,
    `- Source page: ${v(q.source_page || record.source_page)}`,
    `- Campaign: ${v(q.campaign_parameters || record.campaign_parameters)}`,
    `- Turns: ${record.transcript.length}`,
    `- Flags: ${list(record.flags)}`,
    ``,
    `TRANSCRIPT (excerpt — full transcript is on the stored conversation record)`,
    ...transcriptExcerpt(record),
  ].join("\n");
}

/**
 * The lead store caps value_leak_description at 3000 characters, so the brief
 * carries a bounded transcript excerpt: the visitor's own words, most recent
 * last. The complete transcript always remains on the conversation record in
 * Blobs, keyed by conversation_id, so nothing is lost.
 */
function transcriptExcerpt(record: ConversationRecord): string[] {
  const lines = record.transcript.map((t) => `[${t.role}] ${t.text.replace(/\s+/g, " ").slice(0, 200)}`);
  let budget = 900;
  const out: string[] = [];
  for (const line of lines.slice().reverse()) {
    if (budget - line.length < 0) break;
    budget -= line.length;
    out.unshift(line);
  }
  if (out.length < lines.length) out.unshift(`… ${lines.length - out.length} earlier turn(s) omitted`);
  return out;
}

function toLeadInput(record: ConversationRecord, now: number): LeadInput {
  const q = record.qualification;
  const description = buildLeadBrief(record);
  return {
    name: q.visitor_name || "Website visitor",
    email: q.email || "",
    organization: q.company_name || "",
    value_leak_description: description.length >= 10 ? description : `${description} (receptionist)`,
    source_page: q.source_page || record.source_page || "/",
    referral_data: "",
    utm: q.campaign_parameters || record.campaign_parameters || "",
    consent: q.consent_to_follow_up,
    company_website: "", // never a honeypot hit — the receptionist guards spam per-turn
    // The conversation's own per-turn guards stand in for the form-timing check.
    form_started_at: now - 3000,
  };
}

/** Decide the active (non-terminal) next state from what is still missing. */
function activeNext(from: ConversationState, q: QualificationFields): ConversationState {
  if (!q.inquiry_type && !q.business_problem) return from === "GREETING" ? "INTENT_IDENTIFIED" : "QUALIFYING";
  if (!q.email) return "CONTACT_CAPTURE";
  return "QUALIFYING";
}

function applyState(record: ConversationRecord, to: ConversationState) {
  const { state, flag } = transition(record.state, to);
  record.state = state;
  if (flag) record.flags.push(flag);
}

/**
 * Process one visitor message. Pure: returns the mutated-copy record and the
 * effect for the caller to execute. `rawMessage` is untrusted; it is sanitized
 * here so callers cannot forget.
 */
export async function processVisitorTurn(
  prior: ConversationRecord,
  rawMessage: unknown,
  model: ReceptionistModel,
  opts: { now?: Date; booking?: BookingProvider; availability?: AvailabilityProvider } = {},
): Promise<{ record: ConversationRecord; reply: string; effect: TurnEffect }> {
  const now = opts.now ?? new Date();
  const booking = opts.booking ?? noCalendarProvider;
  const availability = opts.availability ?? noAvailability;
  const record: ConversationRecord = structuredClone(prior);

  if (isTerminal(record.state)) {
    return { record, reply: "This conversation has been handed to the Regulus team. You can email info@regulusautomation.ca anytime.", effect: { kind: "none" } };
  }

  const clean = sanitize(rawMessage);
  if (!clean) {
    return { record, reply: "Sorry, I didn't catch that — could you rephrase?", effect: { kind: "none" } };
  }

  const injectionFlags = detectInjection(clean);
  const spamFlags = detectSpam(clean);
  const visitorFlags = [...injectionFlags, ...spamFlags];
  record.transcript.push({ role: "visitor", text: clean, at: now.toISOString(), ...(visitorFlags.length ? { flags: visitorFlags } : {}) });
  for (const f of visitorFlags) if (!record.flags.includes(f)) record.flags.push(f);

  // Hard spam gate: obvious spam terminates without a lead (auditable non-lead).
  if (spamFlags.length) {
    applyState(record, "SPAM");
    record.updated_at = now.toISOString();
    return { record, reply: "Thanks for reaching out. If this is a genuine business inquiry, please email info@regulusautomation.ca.", effect: { kind: "none" } };
  }

  // 2. Conversation state -> intent -> narrowly scoped approved knowledge.
  // Extract from the current turn and merge into durable prior fields. Replaying
  // the full transcript would let an unrelated old "yes" or "no" rewrite the
  // visitor's current consent signal.
  const pre = extractFromVisitorText(clean, record.qualification);
  record.qualification = pre.fields;
  record.confidence_by_field = mergeConfidence(record.confidence_by_field, pre.confidence);
  const classification = classifyIntent(clean);
  const retrieval = retrieveKnowledge(classification);
  const sensitiveInput = /\b(password|credit card|card number|sin|social insurance|ssn)\b/i.test(clean);
  if (sensitiveInput && !retrieval.facts.some((f) => f.id === "privacy.note")) {
    retrieval.facts.unshift({ id: "privacy.note", text: PRIVACY_NOTE, source: "src/lib/receptionist/knowledge.ts" });
  }
  const previousReceptionistReplies = record.transcript
    .filter((turn) => turn.role === "receptionist")
    .map((turn) => turn.text);
  const goal = selectConversationGoal({
    state: record.state,
    message: clean,
    classification,
    qualification: record.qualification,
    visitorFlags,
    previousReplies: previousReceptionistReplies,
  });
  const plan = createResponsePlan(goal, classification, retrieval, record.qualification, previousReceptionistReplies);

  // When the assistant reflects an opportunity, record the hypothesis, its
  // confidence, and what a person must still verify. These travel with the lead
  // brief so Ian sees the reasoning and its limits, never a bare assertion.
  const activeWorkflow = workflowByKey(record.qualification.workflow);
  if (goal.selected_goal === "reflect_opportunity" && activeWorkflow) {
    const reflection = opportunityReflection({
      industry: industryByKey(record.qualification.industry),
      workflow: activeWorkflow,
      problem: record.qualification.business_problem,
      currentProcess: record.qualification.current_process,
      frequency: record.qualification.frequency,
      consequence: record.qualification.consequence,
      desiredOutcome: record.qualification.desired_outcome,
    });
    record.qualification.automation_hypothesis = activeWorkflow.safeExamples[0];
    record.qualification.hypothesis_confidence = reflection.confidence;
    record.qualification.missing_evidence = [activeWorkflow.verification];
  }

  // 3. Model drafts from the retrieved knowledge only.
  let proposal;
  try {
    proposal = await model.respond({
      transcript: record.transcript,
      qualification: record.qualification,
      sourcePage: record.source_page,
      visitorFlags,
      classification,
      retrieval,
      goal,
      plan,
    });
    record.extraction_source = model.name === "deterministic" ? "deterministic" : "model+deterministic";
  } catch {
    applyState(record, "ERROR_RECOVERABLE");
    record.error = "model_unavailable";
    record.updated_at = now.toISOString();
    return { record, reply: "I'm having a brief technical issue. Please try again, or email info@regulusautomation.ca and the team will help.", effect: { kind: "none" } };
  }

  // 4. Deterministic extraction is authoritative; model proposal is reconciled.
  const rec = reconcileModelExtraction(record.qualification, proposal.proposedExtraction);
  record.qualification = rec.fields;
  record.confidence_by_field = mergeConfidence(record.confidence_by_field, rec.confidence);
  record.qualification = rememberAnsweredQuestion(record.qualification, classification);

  let reply = redactSecrets(proposal.reply).slice(0, 2000);
  // 5/6/7. Regulus responses are evaluated against Regulus-approved retrieval.
  // Isolated tenant adapters retain their own approved knowledge boundary; they
  // still use the shared extraction, action, booking, state, and safety gates.
  if (model.approvedKnowledgeScope !== "external") {
    const canonical = draftConsultativeResponse(classification, retrieval, record.qualification, plan, clean, previousReceptionistReplies);
    if (sensitiveInput) {
      canonical.reply = `${PRIVACY_NOTE}\n\n${canonical.reply}`;
      canonical.directAnswer = PRIVACY_NOTE;
      if (!canonical.evidenceIds.includes("privacy.note")) canonical.evidenceIds.unshift("privacy.note");
    }
    let evidenceIds = proposal.evidenceIds ?? [];
    let quality = evaluateQuality(reply, canonical.directAnswer);
    let sales = evaluateSales(reply);
    let evidence = validateEvidence(reply, evidenceIds, retrieval.facts, canonical.reply);
    let progress = evaluateConversationProgress(reply, goal, plan, previousReceptionistReplies);
    let regenerated = false;
    if (!quality.passed || !sales.passed || !evidence.passed || !progress.passed) {
      reply = canonical.reply;
      evidenceIds = canonical.evidenceIds;
      quality = evaluateQuality(reply, canonical.directAnswer);
      sales = evaluateSales(reply);
      evidence = validateEvidence(reply, evidenceIds, retrieval.facts, canonical.reply);
      progress = evaluateConversationProgress(reply, goal, plan, previousReceptionistReplies);
      regenerated = true;
    }
    record.response_intelligence = {
      intent: classification.intent,
      confidence: classification.confidence,
      secondary_intents: classification.secondary_intents,
      knowledge_ids: evidenceIds,
      quality_score: quality.score,
      sales_score: sales.score,
      evidence_score: evidence.score,
      progress_score: progress.score,
      regenerated,
      selected_goal: goal.selected_goal,
      goal_reason: goal.reason,
      goal_confidence: goal.confidence,
      blocked_goals: goal.blocked_goals,
      required_known_fields: goal.required_known_fields,
      expected_state_change: goal.expected_state_change,
      response_plan: plan,
    };
    if (!quality.passed || !sales.passed || !evidence.passed || !progress.passed) {
      applyState(record, "ERROR_RECOVERABLE");
      record.error = "response_evaluation_failed";
      record.updated_at = now.toISOString();
      return {
        record,
        reply: "Regulus begins by examining the workflow and the evidence available. What business process would you like to improve?",
        effect: { kind: "none" },
      };
    }
  }
  record.updated_at = now.toISOString();

  const q = record.qualification;
  // The deterministic plan is authoritative when it selects an action. When it
  // selects none, preserve the existing validated model-proposal path (notably
  // mark_out_of_scope and create_lead); the downstream gates still decide.
  const action = plan.proposed_action !== "none"
    ? plan.proposed_action
    : (proposal.proposedAction?.kind ?? "none");
  let effect: TurnEffect = { kind: "none" };

  // 8. Policy → decided effect → validated transition.
  if (q.human_requested || action === "request_human") {
    record.human_takeover = true;
    record.follow_up_required = true;
    if (q.email) {
      applyState(record, "HUMAN_REQUESTED");
      effect = { kind: "create_lead", reason: "human_requested", leadInput: toLeadInput(record, now.getTime()) };
    } else {
      applyState(record, "CONTACT_CAPTURE");
    }
  } else if (action === "mark_out_of_scope") {
    applyState(record, "OUT_OF_SCOPE");
  } else if (action === "offer_booking" || record.offered_slots.length > 0) {
    // Two-step booking: offer VERIFIED availability, capture an EXPLICIT selection,
    // then book. The engine controls every booking reply so the model can never
    // claim availability or a BOOKED it cannot prove. A qualified visitor's lead
    // is preserved regardless of booking outcome.
    const leadReady = hasMinimumViableLead(q) && Boolean(q.email);
    const awaitingSelection = record.offered_slots.length > 0 && slotsAreFresh(record.offered_at, now);

    if (awaitingSelection) {
      const sel = extractSlotSelection(clean, record.offered_slots);
      if (!sel) {
        // Missing or ambiguous choice -> re-prompt with the same verified options.
        applyState(record, "READY_TO_BOOK");
        reply = `Just to confirm — which time works? Reply with the number:\n${slotList(record.offered_slots)}`;
        if (leadReady) effect = { kind: "create_lead", reason: "follow_up", leadInput: toLeadInput(record, now.getTime()) };
      } else {
        record.selected_slot = sel;
        const evidence = await booking(record); // provider-confirmed durable evidence, or null
        if (isDurableBookingEvidence(evidence)) {
          record.booking_evidence = evidence;
          record.booked_at = now.toISOString();
          applyState(record, "BOOKED");
          reply = `You're booked for ${sel.label}. A calendar invite is on its way to ${q.email}. Talk soon — a Regulus team member will be there.`;
          if (q.email) effect = { kind: "create_lead", reason: "qualified", leadInput: toLeadInput(record, now.getTime()) };
        } else {
          // Provider could not confirm -> never BOOKED; preserve the lead + escalate.
          record.follow_up_required = true;
          applyState(record, "FOLLOW_UP_REQUIRED");
          reply = `I couldn't lock that time in just now, so a Regulus team member will email ${q.email} to confirm it. Sorry for the hiccup.`;
          if (q.email) effect = { kind: "create_lead", reason: "follow_up", leadInput: toLeadInput(record, now.getTime()) };
        }
      }
    } else {
      // First booking turn (or expired slots) -> query VERIFIED availability.
      applyState(record, activeNext(record.state, q));
      const slots = await availability(now); // [] = none, null = provider error
      if (slots && slots.length > 0) {
        record.offered_slots = slots;
        record.offered_at = now.toISOString();
        record.selected_slot = null;
        applyState(record, "READY_TO_BOOK");
        reply = `Happy to set up a discovery call. Here are the next available times (${slots[0].timezone}):\n${slotList(slots)}\nReply with the number that works.`;
        if (leadReady) effect = { kind: "create_lead", reason: "follow_up", leadInput: toLeadInput(record, now.getTime()) };
      } else {
        // No availability OR provider error -> fail closed to human follow-up.
        record.offered_slots = [];
        record.offered_at = null;
        record.follow_up_required = true;
        applyState(record, "FOLLOW_UP_REQUIRED");
        reply = `I'd love to get you booked — I couldn't pull live times right now, so a Regulus team member will email ${q.email || "you"} to lock in a time.`;
        if (leadReady) effect = { kind: "create_lead", reason: "follow_up", leadInput: toLeadInput(record, now.getTime()) };
      }
    }
  } else if (action === "create_lead" || (hasMinimumViableLead(q) && q.email)) {
    if (q.email) {
      // Capture the lead so nothing is lost, but do NOT end the conversation.
      // Terminating here meant that a visitor who offered their email early was
      // cut off before the assistant had been useful — the opposite of the
      // intended flow. Only an explicit handoff, a booking outcome, spam, or the
      // turn cap may terminate. Re-creating the lead on later turns is safe: the
      // store de-duplicates on (email, description).
      applyState(record, activeNext(record.state, q));
      effect = { kind: "create_lead", reason: "qualified", leadInput: toLeadInput(record, now.getTime()) };
    } else {
      applyState(record, activeNext(record.state, q));
    }
  } else {
    applyState(record, activeNext(record.state, q));
  }

  // Record the (possibly engine-overridden) receptionist reply once the turn is decided.
  record.transcript.push({ role: "receptionist", text: reply, at: now.toISOString() });

  return { record, reply, effect };
}
