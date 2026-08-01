/**
 * Grounded industry and workflow knowledge for the Regulus Business Assistant.
 *
 * This module exists because the previous assistant had NO vocabulary for the
 * things visitors actually type ("Construction", "Payroll"). Every short answer
 * fell through to `intent: unknown`, which produced the same two boilerplate
 * paragraphs on every turn while the trailing question rotated.
 *
 * WHAT THIS IS: a deterministic map from visitor vocabulary to (a) the workflow
 * stages that industry/function typically contains, and (b) the discriminating
 * question that narrows the problem. It runs with no network and no paid API.
 *
 * WHAT THIS IS NOT: a claim about any specific business. Every orientation line
 * is phrased as a general pattern ("often", "typically") and is followed by a
 * question, because the assistant explores and a person validates. Nothing here
 * asserts savings, ROI, integrations, customer results, or compliance.
 */

export type IndustryKey =
  | "construction"
  | "home_services"
  | "clinic"
  | "professional_services"
  | "retail_ecommerce"
  | "general";

export type WorkflowKey =
  | "lead_intake"
  | "follow_up"
  | "scheduling"
  | "quoting"
  | "customer_support"
  | "payroll_admin"
  | "reporting"
  | "document_processing";

export type Industry = {
  key: IndustryKey;
  label: string;
  /** Vocabulary a visitor might type. Matched case-insensitively, word-bounded. */
  aliases: RegExp;
  /** The stages where time is typically lost. Used to build the orientation line. */
  chain: string[];
  /** Workflows most often relevant to this industry, best-first. */
  common: WorkflowKey[];
};

export type Workflow = {
  key: WorkflowKey;
  label: string;
  aliases: RegExp;
  /** How this function typically consumes time. Drives the orientation line. */
  drains: string[];
  /** The single discriminating question that splits the problem usefully. */
  discriminator: string;
  /** Automation patterns that are safe to describe as possibilities, not promises. */
  safeExamples: string[];
  /** Where automation is often the wrong answer, or needs care. Always surfaced. */
  contraindication: string;
  /** What a person must verify before anything is recommended. */
  verification: string;
};

const INDUSTRIES: Industry[] = [
  {
    key: "construction",
    label: "Construction",
    aliases: /\b(construction|contractor|contracting|builder|building|general contractor|gc|renovation|remodel(?:ing|ler)?|framing|concrete|excavation|drywall|landscap(?:ing|er)|site work|trades?)\b/i,
    chain: ["initial enquiries", "estimates", "scheduling", "field updates", "change orders", "invoicing"],
    common: ["quoting", "lead_intake", "scheduling", "document_processing", "payroll_admin"],
  },
  {
    key: "home_services",
    label: "Home services",
    aliases: /\b(plumb(?:ing|er|ers)?|hvac|heating|cooling|air conditioning|furnace|roof(?:ing|er|ers)?|electric(?:ian|al)?|home services?|field services?|pest control|cleaning service|garage door|appliance repair|restoration)\b/i,
    chain: ["incoming calls", "dispatch", "on-site work", "follow-up", "invoicing"],
    common: ["lead_intake", "scheduling", "quoting", "follow_up", "customer_support"],
  },
  {
    key: "clinic",
    label: "Clinics and appointment-based practices",
    aliases: /\b(clinic|dental|dentist|medical|doctor|physician|health|healthcare|med ?spa|aesthetic|chiropract(?:ic|or)|physio(?:therapy)?|massage|therapy|therapist|veterinar(?:y|ian)|vet|optometr(?:y|ist)|salon|spa)\b/i,
    chain: ["appointment requests", "confirmations and reminders", "intake paperwork", "rescheduling and no-shows", "recall and follow-up"],
    common: ["scheduling", "lead_intake", "follow_up", "document_processing", "customer_support"],
  },
  {
    key: "professional_services",
    label: "Professional services",
    aliases: /\b(law(?:yer|firm)?|legal|attorney|paralegal|account(?:ing|ant)|bookkeep(?:ing|er)|cpa|tax|consult(?:ing|ant)|advisory|architect(?:ure)?|engineer(?:ing)?|insurance|real ?estate|mortgage|agency|professional services?)\b/i,
    chain: ["enquiry intake", "consultation scheduling", "document collection", "matter or project updates", "billing"],
    common: ["lead_intake", "document_processing", "scheduling", "follow_up", "reporting"],
  },
  {
    key: "retail_ecommerce",
    label: "Retail and e-commerce",
    aliases: /\b(retail|e-?commerce|online store|shop(?:ify)?|storefront|wholesale|distribut(?:ion|or)|inventory|orders?|fulfil(?:l)?ment|warehouse)\b/i,
    chain: ["order intake", "fulfilment", "customer questions", "returns", "stock and reporting"],
    common: ["customer_support", "reporting", "document_processing", "follow_up", "lead_intake"],
  },
];

const WORKFLOWS: Workflow[] = [
  {
    key: "payroll_admin",
    label: "Payroll and administration",
    // "hours" alone is deliberately excluded: "we miss emergency calls after
    // hours" is an intake problem, not a payroll one. Only hours in an explicit
    // payroll sense counts.
    aliases: /\b(payroll|pay ?run|timesheets?|time ?sheets?|time ?tracking|wages|paycheck|pay ?stubs?|t4|remittance|bookkeeping|data entry|back ?office)\b|\b(?:collect(?:ing)?|track(?:ing)?|submit(?:ting)?|approv(?:e|ing)|log(?:ging)?)\s+hours\b|\badmin(?:istration|istrative)\b/i,
    drains: ["collecting hours", "chasing approvals", "correcting records", "re-entering data between systems", "answering employee questions"],
    discriminator: "Which part creates the most work: collecting hours, approving them, processing payroll, or correcting errors afterwards?",
    safeExamples: [
      "collecting hours through one structured entry point instead of texts, paper, and spreadsheets",
      "flagging missing or out-of-range entries before the pay run rather than after",
      "removing a re-entry step between the time record and the payroll system",
    ],
    contraindication: "Payroll touches employment records and statutory deductions, so calculation and compliance stay with your existing payroll provider and your accountant — automation should sit around that, not replace it.",
    verification: "how hours actually arrive today, how many people are involved, and where corrections originate",
  },
  {
    key: "quoting",
    label: "Estimating and quoting",
    aliases: /\b(quot(?:e|es|ing|ation)|estimat(?:e|es|ing|or)|bid(?:s|ding)?|proposal?s?|pricing sheet|takeoff|tender)\b/i,
    drains: ["gathering site or job details", "building the numbers", "getting the quote out", "chasing a response", "revising after changes"],
    discriminator: "Where does most of the time go: gathering the details to quote, producing the quote itself, or following up after it is sent?",
    safeExamples: [
      "capturing job details in a structured form so the estimate starts from complete information",
      "generating a consistent quote document from those details instead of rebuilding it each time",
      "scheduled reminders on quotes that have had no response",
    ],
    contraindication: "Pricing judgment should stay with a person — the useful automation is around the assembly and follow-up, not the number itself.",
    verification: "how many quotes go out in a typical month, how long one takes, and how many go unanswered",
  },
  {
    key: "lead_intake",
    label: "Enquiry and lead intake",
    aliases: /\b(new (?:enquir|inquir|lead)|enquir(?:y|ies)|inquir(?:y|ies)|leads?|missed calls?|phone calls?|calls?|voicemail|after ?hours|contact form|web ?form|walk-?ins?|first contact|intake)\b/i,
    drains: ["catching enquiries across phone, email, forms, and social", "capturing details consistently", "responding quickly enough", "routing to the right person"],
    discriminator: "Where do enquiries most often get lost: nobody available to answer, details captured inconsistently, or the response going out too late?",
    safeExamples: [
      "one structured intake record for every enquiry regardless of the channel it arrived on",
      "an immediate acknowledgement so the enquirer knows they have been received",
      "routing and alerting so an enquiry is not sitting unowned",
    ],
    contraindication: "An automated first response only helps if a person still follows up — it should shorten the gap, not replace the human reply.",
    verification: "roughly how many enquiries arrive per week, through which channels, and how many currently go unanswered",
  },
  {
    key: "follow_up",
    label: "Follow-up",
    aliases: /\b(follow[- ]?ups?|following up|chas(?:e|ing)|no response|went (?:cold|quiet)|nurtur(?:e|ing)|re-?engage|reminders? to call|stale)\b/i,
    drains: ["remembering who is owed a reply", "timing the next contact", "keeping track across people", "knowing when to stop"],
    discriminator: "Is the harder part remembering who needs following up, or finding the time to actually do it?",
    safeExamples: [
      "a visible list of who is awaiting a response and for how long",
      "scheduled reminders tied to the last contact rather than to memory",
      "a consistent sequence so follow-up does not depend on who is in that day",
    ],
    contraindication: "Automated follow-up must respect consent and unsubscribe requests, and it should not replace a real conversation on a live opportunity.",
    verification: "how follow-up is tracked today, and how many opportunities typically go quiet",
  },
  {
    key: "scheduling",
    label: "Scheduling and appointments",
    aliases: /\b(schedul(?:e|es|ing)|appointments?|bookings?|calendar|dispatch(?:ing)?|reschedul(?:e|ing)|no[- ]?shows?|cancellations?|availability|routing crews?)\b/i,
    drains: ["back-and-forth to find a time", "confirmations and reminders", "rescheduling and cancellations", "no-shows", "coordinating people or crews"],
    discriminator: "Which costs more: the back-and-forth to book a time, or the no-shows and rescheduling afterwards?",
    safeExamples: [
      "structured availability so booking does not require several messages",
      "automatic confirmations and reminders before the appointment",
      "a clear rescheduling path that does not require a phone call",
    ],
    contraindication: "Where scheduling depends on clinical, site, or capacity judgment, the automation should propose and a person should confirm.",
    verification: "how bookings arrive today, and the current no-show or reschedule rate",
  },
  {
    key: "customer_support",
    label: "Customer communication and support",
    aliases: /\b(customer (?:service|support|communication|questions?)|support (?:tickets?|requests?|queue)|client communication|answering questions|status updates?|complaints?|where is my order)\b/i,
    drains: ["answering the same questions repeatedly", "finding the answer across systems", "keeping people updated", "handling it outside working hours"],
    discriminator: "Are most messages the same few repeated questions, or does each one need a genuine individual answer?",
    safeExamples: [
      "answering a defined set of repeated questions from approved content",
      "proactive status updates so people do not need to ask",
      "routing anything outside that defined set straight to a person",
    ],
    contraindication: "Automated answers must be limited to content you have approved; anything uncertain should reach a person rather than be guessed at.",
    verification: "the actual mix of incoming messages and which are genuinely repetitive",
  },
  {
    key: "reporting",
    label: "Reporting and visibility",
    aliases: /\b(report(?:s|ing)?|dashboards?|kpis?|metrics|visibility|spreadsheets?|excel|month[- ]?end|reconcil(?:e|ing|iation)|what.s going on)\b/i,
    drains: ["pulling numbers from several systems", "rebuilding the same report", "reconciling disagreements between sources", "the delay before anyone sees it"],
    discriminator: "Is the problem assembling the report, or trusting the numbers once it is assembled?",
    safeExamples: [
      "assembling a recurring report from its sources on a schedule",
      "showing the source of each number so disagreements are traceable",
      "surfacing absent or stale data as unknown rather than as zero",
    ],
    contraindication: "Automated reporting is only as good as the underlying records — if sources disagree today, that has to be resolved first.",
    verification: "which systems hold the numbers, and how long the report currently takes to produce",
  },
  {
    key: "document_processing",
    label: "Document and paperwork handling",
    aliases: /\b(documents?|paperwork|forms?|contracts?|invoices?|receipts?|scanning|pdfs?|filing|records?|intake forms?|change orders?|permits?|compliance docs?)\b/i,
    drains: ["collecting documents from people", "re-typing their contents", "filing and finding them later", "chasing what is missing"],
    discriminator: "Is the bigger cost collecting the documents in the first place, or handling their contents once they arrive?",
    safeExamples: [
      "a structured request so documents arrive complete and correctly labelled",
      "extracting recurring fields into a record instead of re-typing them",
      "an explicit checklist of what is still outstanding",
    ],
    contraindication: "Extraction from documents needs verification on anything that carries legal, financial, or clinical weight — a person should confirm before it is relied on.",
    verification: "the document types and volumes involved, and what happens to their contents afterwards",
  },
];

/** Recognize an industry from free text. Returns null when nothing matches. */
export function recognizeIndustry(text: string): Industry | null {
  return INDUSTRIES.find((i) => i.aliases.test(text)) ?? null;
}

/** Recognize a workflow from free text. Returns null when nothing matches. */
export function recognizeWorkflow(text: string): Workflow | null {
  return WORKFLOWS.find((w) => w.aliases.test(text)) ?? null;
}

export function industryByKey(key: string | null | undefined): Industry | null {
  return INDUSTRIES.find((i) => i.key === key) ?? null;
}

export function workflowByKey(key: string | null | undefined): Workflow | null {
  return WORKFLOWS.find((w) => w.key === key) ?? null;
}

/** Join a list as "a, b, c and d" for readable orientation lines. */
function series(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/**
 * The orientation reflection for a known industry with no workflow yet.
 * Phrased as a general pattern and always followed by a narrowing question.
 */
export function industryOrientation(industry: Industry): { observation: string; question: string } {
  return {
    observation: `${industry.label} businesses often lose time between ${series(industry.chain)}.`,
    question: `Which of those creates the most repeated work for you?`,
  };
}

/** The orientation reflection for a known workflow. */
export function workflowOrientation(workflow: Workflow, industry: Industry | null): { observation: string; question: string } {
  const where = industry && industry.key !== "general" ? ` in ${industry.label.toLowerCase()}` : "";
  return {
    observation: `${workflow.label}${where} often consumes time through ${series(workflow.drains)}.`,
    question: workflow.discriminator,
  };
}

/**
 * Phase 4 opportunity reflection. Deliberately four labelled parts so the
 * visitor can see what is understood, what is only a hypothesis, and what a
 * person still has to check. Never asserts a saving or a result.
 */
export function opportunityReflection(input: {
  industry: Industry | null;
  workflow: Workflow;
  problem: string | null;
  currentProcess: string | null;
  frequency: string | null;
  consequence: string | null;
  desiredOutcome: string | null;
}): { understand: string; opportunity: string; verify: string; step: string; confidence: "low" | "medium" } {
  const { industry, workflow, problem, currentProcess, frequency, consequence, desiredOutcome } = input;
  const who = industry && industry.key !== "general" ? `a ${industry.label.toLowerCase()} business` : "your business";

  const known = [
    problem ? `the friction is around ${workflow.label.toLowerCase()}` : `you are looking at ${workflow.label.toLowerCase()}`,
    currentProcess ? `today it runs as: ${currentProcess}` : null,
    frequency ? `it happens ${frequency}` : null,
    consequence ? `the cost of it is ${consequence}` : null,
    desiredOutcome ? `you want to get to: ${desiredOutcome}` : null,
  ].filter(Boolean) as string[];

  // Confidence is medium only when process AND (frequency or consequence) are known.
  const confidence: "low" | "medium" = currentProcess && (frequency || consequence) ? "medium" : "low";

  return {
    understand: `What I understand: you run ${who} and ${series(known)}.`,
    opportunity: `Where automation may help: ${workflow.safeExamples[0]}. ${workflow.contraindication}`,
    verify: `What still needs verification: ${workflow.verification}. I have not seen your systems, so this is a hypothesis rather than a finding.`,
    step: `A sensible first step: a contained review of just this one workflow — not a broad transformation — so the opportunity is either confirmed with evidence or ruled out cheaply.`,
    confidence,
  };
}

export const ALL_INDUSTRIES = INDUSTRIES;
export const ALL_WORKFLOWS = WORKFLOWS;
