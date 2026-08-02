export const commercialServices = [
  {
    slug: "automation-opportunity-audit",
    name: "Automation Opportunity Audit",
    description: "A CAD $500 prepaid bounded review of work taking too much time, being missed, or waiting too long, with a prioritized recommendation.",
    problem: "Growing businesses often feel the cost of missed inquiries and manual work before they can locate or prioritize the underlying workflow.",
    outcome: "A prioritized recommendation separating observations, assumptions, unknowns, follow-up gaps, and practical automation opportunities. Implementation is separate and optional.",
    measures: ["work taking too much time", "work being missed or delayed", "fragmented inquiry and follow-up paths"],
  },
  {
    slug: "business-process-automation",
    name: "Business Process Automation",
    description: "Design and implementation of accountable workflows that reduce repetitive administration while preserving human decisions.",
    problem: "Manual handoffs, duplicate entry, and inbox-driven processes consume time and make work difficult to trace.",
    outcome: "A scoped workflow with explicit inputs, states, exceptions, human controls, and measurable operating signals.",
    measures: ["manual steps per workflow", "handoff delay", "exceptions requiring human action"],
  },
  {
    slug: "ai-workflow-automation",
    name: "AI Workflow Automation",
    description: "Carefully bounded AI assistance for classification, drafting, routing, and knowledge-supported work.",
    problem: "Teams can spend substantial time interpreting routine inputs or locating the context needed for a next action.",
    outcome: "An evidence-bounded workflow that uses AI where appropriate and routes uncertainty or consequential decisions to people.",
    measures: ["items routed correctly", "human review volume", "unknown and exception handling"],
  },
  {
    slug: "operational-intelligence",
    name: "Operational Intelligence",
    description: "Decision surfaces that connect workflow evidence, bottlenecks, ownership, and outcomes without inventing certainty.",
    problem: "Leaders may have activity data without a coherent view of where work stalls, value leaks, or decisions wait.",
    outcome: "A traceable operational view built from available source systems, with absent evidence shown as unknown.",
    measures: ["workflow state coverage", "overdue actions", "evidence completeness"],
  },
  {
    slug: "ai-receptionist",
    name: "AI Receptionist",
    description: "A measured first-response layer for calls and inquiries when your team is busy or unavailable.",
    problem: "New inquiries can arrive while staff are serving clients, after hours, or between systems.",
    outcome: "Acknowledge the inquiry immediately, capture the reason for contact, and route the next step to a human-owned queue.",
    measures: ["time to first acknowledgement", "qualified inquiries captured", "human handoffs completed"],
  },
  {
    slug: "missed-lead-recovery",
    name: "Missed Lead Recovery",
    description: "Recover follow-up opportunities from unanswered calls and incomplete inquiry paths.",
    problem: "A missed call or delayed reply can become an untracked, unworked lead.",
    outcome: "Create an immediate acknowledgement, a clear follow-up task, and a visible pipeline record without inventing an outcome.",
    measures: ["missed inquiries acknowledged", "follow-ups completed on time", "consultation requests recovered"],
  },
  {
    slug: "appointment-automation",
    name: "Appointment Automation",
    description: "Move qualified inquiries into a clear appointment-request workflow while preserving human control.",
    problem: "Phone and email coordination can create delays, duplicate work, and incomplete booking context.",
    outcome: "Collect the information needed for a consultation request, route it to the right calendar process, and track its state.",
    measures: ["qualified appointment requests", "time from inquiry to request", "requests awaiting staff action"],
  },
  {
    slug: "follow-up-automation",
    name: "Follow-Up Automation",
    description: "Make ownership, timing, and status visible for every approved follow-up.",
    problem: "Follow-up can depend on memory, inbox searches, or disconnected notes.",
    outcome: "Schedule the next action, alert the responsible operator, and keep the pipeline current.",
    measures: ["overdue follow-ups", "follow-up completion rate", "reply and meeting progression"],
  },
] as const;

export type CommercialService = (typeof commercialServices)[number];

export const businessSystemsOffers = [
  {
    name: "Lead Capture",
    description: "Give every inquiry a clear next action across calls, forms, email, social channels, and after-hours contact.",
    items: ["Missed-call response", "Web-form acknowledgement", "After-hours capture", "Inquiry qualification", "Lead routing", "Follow-up visibility"],
  },
  {
    name: "Workflow Recovery",
    description: "Reduce routine coordination work and prevent important tasks from waiting unnoticed.",
    items: ["Quoting and estimates", "Scheduling and reminders", "Dispatch and job coordination", "Forms and document movement", "Internal notifications", "Routine administration"],
  },
  {
    name: "Owner Intelligence",
    description: "See what needs attention without searching across disconnected systems.",
    items: ["Leads awaiting response", "Jobs scheduled next", "Quotes needing follow-up", "Invoices overdue", "Work blocked or waiting", "Items requiring owner attention"],
  },
] as const;

export const engagementModel = [
  {
    name: "Automation Opportunity Audit — CAD $500, prepaid",
    description: "A bounded review of the current workflow and likely automation opportunities. Paid in advance; a Regulus team member confirms scope and sends a secure payment link before the review begins.",
  },
  {
    name: "Implementation — typically CAD $2,500–$5,000",
    description: "Optional and separately scoped around the selected opportunity, integrations, complexity, and delivery requirements.",
  },
  {
    name: "Ongoing management — typically CAD $750–$1,500 per month",
    description: "Optional monitoring, maintenance, adjustment, reporting, and continued improvement.",
  },
] as const;
