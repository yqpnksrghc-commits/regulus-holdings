/**
 * Deterministic structured extraction.
 *
 * This is the authoritative extractor: it reads the sanitized transcript with
 * heuristics only (no model). A production model MAY *propose* extra fields, but
 * every proposed value is re-validated here before it is trusted — the model can
 * never write a field the deterministic layer would reject. Unknown stays null.
 */
import type { ConfidenceByField, OfferedSlot, QualificationFields } from "@/lib/receptionist/schema";

const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/;
const PHONE_RE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/;

const HUMAN_RE = /\b(?:talk|speak|connect|chat)\s+(?:to|with)\s+(?:a\s+)?(?:human|person|someone|real person|representative|agent|staff|team)\b|\b(?:need|want)\s+(?:a\s+)?human\b|\breal\s+person\b|\bhuman\s+(?:please|now)\b/i;
const BOOKING_RE = /\b(?:book|schedule|set up|arrange|get on)\b.{0,20}\b(?:call|meeting|consult|discovery|demo|time|appointment)\b|\b(?:discovery|consultation)\s+call\b|\blet'?s\s+(?:talk|meet)\b/i;
const CONSENT_YES_RE = /\b(?:yes|sure|ok(?:ay)?|please do|go ahead|sounds good|that works|you can|feel free)\b/i;
const CONSENT_NO_RE = /\b(?:no|don'?t|do not|stop|not interested|unsubscribe|leave me)\b/i;

const URGENCY_HIGH_RE = /\b(?:urgent|asap|immediately|right away|today|this week|losing (?:money|leads|clients)|bleeding)\b/i;
const URGENCY_LOW_RE = /\b(?:no rush|just (?:looking|browsing|curious)|someday|eventually|exploring|research)\b/i;

const AUTHORITY_YES_RE = /\b(?:i (?:own|run|decide|am the (?:owner|founder|ceo|director))|my (?:business|company|clinic|firm|practice)|we're a|i'?m the (?:owner|founder))\b/i;
const AUTHORITY_NO_RE = /\b(?:i'?ll (?:have to |need to )?(?:ask|check with)|not my (?:call|decision)|my (?:boss|manager|partner) (?:decides|would))\b/i;

const CONTACT_EMAIL_PREF_RE = /\b(?:email me|by email|via email|prefer email|reach me by email)\b/i;
const CONTACT_PHONE_PREF_RE = /\b(?:call me|by phone|via phone|prefer (?:a )?call|reach me by phone|text me)\b/i;

/** Extract fields from the full concatenated visitor text (already sanitized). */
export function extractFromVisitorText(
  allVisitorText: string,
  prior: QualificationFields,
): { fields: QualificationFields; confidence: ConfidenceByField } {
  const fields: QualificationFields = { ...prior };
  fields.pain_points = [...(prior.pain_points ?? [])];
  fields.goals = [...(prior.goals ?? [])];
  fields.requested_services = [...(prior.requested_services ?? [])];
  fields.questions_answered = [...(prior.questions_answered ?? [])];
  const confidence: ConfidenceByField = {};
  const t = allVisitorText;

  // Strip trailing sentence punctuation so "...@regulus.ca. Yes" yields a clean address.
  const email = t.match(EMAIL_RE)?.[0]?.toLowerCase().replace(/[.,;:!?)\]}'"]+$/, "") ?? null;
  if (email && !fields.email) { fields.email = email.slice(0, 254); confidence.email = 0.95; }

  const phone = t.match(PHONE_RE)?.[0] ?? null;
  if (phone && !fields.phone) { fields.phone = phone.slice(0, 40); confidence.phone = 0.85; }

  if (HUMAN_RE.test(t)) { fields.human_requested = true; confidence.human_requested = 0.95; }
  if (BOOKING_RE.test(t)) { fields.booking_intent = true; confidence.booking_intent = 0.8; }

  if (CONTACT_EMAIL_PREF_RE.test(t)) { fields.preferred_contact_method = "email"; confidence.preferred_contact_method = 0.8; }
  else if (CONTACT_PHONE_PREF_RE.test(t)) { fields.preferred_contact_method = "phone"; confidence.preferred_contact_method = 0.8; }

  if (URGENCY_HIGH_RE.test(t)) { fields.urgency = "high"; confidence.urgency = 0.7; }
  else if (URGENCY_LOW_RE.test(t)) { fields.urgency = "low"; confidence.urgency = 0.7; }

  if (AUTHORITY_YES_RE.test(t)) { fields.decision_authority = "yes"; confidence.decision_authority = 0.6; }
  else if (AUTHORITY_NO_RE.test(t)) { fields.decision_authority = "no"; confidence.decision_authority = 0.6; }

  if (!fields.industry) {
    const industry = t.match(/\b(dental|medical|med spa|clinic|law|legal|accounting|professional services?|home services?)\b/i)?.[0];
    if (industry) { fields.industry = industry.toLowerCase(); confidence.industry = 0.75; }
  }
  if (!fields.business_size) {
    const size = t.match(/\b(?:team of|we have|with)\s+(\d{1,5})\s+(?:people|employees|staff|locations?)\b/i)?.[0];
    if (size) { fields.business_size = size; confidence.business_size = 0.7; }
  }
  if (!fields.business_problem && /\b(?:miss(?:ed|ing)?|lose|lost|slow|manual|after hours|bottleneck|delay|repetitive|follow-?up|fragmented|scattered|no[- ]show|problem|issue|struggl|need to improve|want to improve)\b/i.test(t)) {
    fields.business_problem = t.slice(0, 1000);
    fields.pain_points = [t.slice(0, 300)];
    confidence.business_problem = 0.75;
  }
  if (/\b(short|brief|concise|quick answer)\b/i.test(t)) fields.preferred_communication_style = "concise";
  else if (/\b(detailed|detail|explain fully)\b/i.test(t)) fields.preferred_communication_style = "detailed";
  else if (/\b(technical|architecture|api|developer)\b/i.test(t)) fields.preferred_communication_style = "technical";

  // Consent is only affirmative on an explicit yes AND no explicit refusal.
  if (CONSENT_NO_RE.test(t)) { fields.consent_to_follow_up = false; confidence.consent_to_follow_up = 0.9; }
  else if (CONSENT_YES_RE.test(t)) { fields.consent_to_follow_up = true; confidence.consent_to_follow_up = 0.7; }

  return { fields, confidence };
}

/**
 * Re-validate a model-proposed extraction against deterministic rules. Only
 * whitelisted, well-formed values survive; everything else is dropped. This is
 * the wall between "model proposes" and "system trusts".
 */
export function reconcileModelExtraction(
  base: QualificationFields,
  proposed: Partial<QualificationFields> | undefined,
): { fields: QualificationFields; confidence: ConfidenceByField } {
  const fields = { ...base };
  const confidence: ConfidenceByField = {};
  if (!proposed || typeof proposed !== "object") return { fields, confidence };

  const str = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.trim().replace(/<[^>]*>/g, "").slice(0, n) : null);

  // Free-text descriptive fields: accept model text (bounded) when absent.
  for (const key of ["company_name", "business_type", "industry", "business_size", "inquiry_type", "business_problem", "current_process", "desired_outcome", "approximate_monthly_lead_volume", "approximate_staff_time_lost", "budget_signal", "visitor_name"] as const) {
    if (fields[key] == null) {
      const v = str(proposed[key], key === "business_problem" || key === "current_process" || key === "desired_outcome" ? 1000 : 160);
      if (v) { (fields[key] as string | null) = v; confidence[key] = 0.5; }
    }
  }
  // Email must pass the deterministic pattern even if the model proposes it.
  if (fields.email == null) {
    const v = str(proposed.email, 254)?.toLowerCase() ?? null;
    if (v && EMAIL_RE.test(v)) { fields.email = v; confidence.email = 0.6; }
  }
  // Enumerated fields: only accept the exact allowed literals.
  if (fields.urgency == null && (proposed.urgency === "low" || proposed.urgency === "medium" || proposed.urgency === "high")) { fields.urgency = proposed.urgency; confidence.urgency = 0.5; }
  if (fields.preferred_contact_method == null && (proposed.preferred_contact_method === "email" || proposed.preferred_contact_method === "phone")) { fields.preferred_contact_method = proposed.preferred_contact_method; confidence.preferred_contact_method = 0.5; }
  if (fields.preferred_communication_style == null && (proposed.preferred_communication_style === "concise" || proposed.preferred_communication_style === "detailed" || proposed.preferred_communication_style === "technical")) {
    fields.preferred_communication_style = proposed.preferred_communication_style;
    confidence.preferred_communication_style = 0.5;
  }
  // Booleans/authority the model may only *raise*, never silently clear a human/consent decision.
  if (proposed.booking_intent === true) { fields.booking_intent = true; confidence.booking_intent = 0.5; }
  if (proposed.human_requested === true) { fields.human_requested = true; confidence.human_requested = 0.6; }

  return { fields, confidence };
}

/** True once we have enough to create a useful, human-reviewable lead. */
export function hasMinimumViableLead(f: QualificationFields): boolean {
  return Boolean(f.email && (f.business_problem || f.inquiry_type));
}

/**
 * Resolve the visitor's EXPLICIT slot selection against the offered options.
 * Accepts a position ("1"/"2"/"3", "option 2", "#3"), an ordinal ("first",
 * "second", "third", "last"), or a time token present in exactly one label.
 * Returns null when the choice is missing OR ambiguous (matches >1) — the flow
 * then re-prompts rather than guessing.
 */
export function extractSlotSelection(text: string, slots: OfferedSlot[]): OfferedSlot | null {
  if (!slots.length) return null;
  const t = ` ${text.toLowerCase()} `;
  const TIME_RE = /\b\d{1,2}(:\d{2})?\s*(am|pm)\b/g;

  // 1. An explicit clock time (with am/pm) is the clearest intent — match it by label.
  const timeTok = t.match(TIME_RE);
  if (timeTok) {
    const hits = new Set<number>();
    for (const tok of timeTok) {
      const wanted = tok.replace(/\s+/g, "");
      slots.forEach((s, i) => { if (s.label.toLowerCase().replace(/\s+/g, "").includes(wanted)) hits.add(i); });
    }
    if (hits.size === 1) return slots[[...hits][0]];
  }

  // 2. Ordinal / position. Strip time tokens first so "2:00pm" isn't read as "option 2".
  const idxs = new Set<number>();
  const ordinals: RegExp[] = [/\b(first|1st|option\s*one)\b/, /\b(second|2nd|option\s*two)\b/, /\b(third|3rd|option\s*three)\b/];
  ordinals.forEach((re, i) => { if (i < slots.length && re.test(t)) idxs.add(i); });
  if (/\b(last|final)\b/.test(t)) idxs.add(slots.length - 1);
  const noTime = t.replace(TIME_RE, " ");
  for (const n of (noTime.match(/\b[1-9]\b/g) || []).map(Number)) if (n >= 1 && n <= slots.length) idxs.add(n - 1);

  return idxs.size === 1 ? slots[[...idxs][0]] : null; // exactly one -> selected; else ambiguous/none
}
