/**
 * The Intelligence Platform — ten domains. Each is a coherent lens on the same
 * mission: find avoidable loss, quantify it, recover persistent value.
 *
 * `evidence` follows the Regulus evidence classes and is surfaced honestly in
 * the UI. We never present research or speculation as an operational capability.
 */
export type EvidenceClass = "operational" | "research" | "speculative";

export type IntelligenceDomain = {
  slug: string;
  name: string;
  short: string;
  summary: string;
  /** The loss this domain addresses, in one line. */
  loss: string;
  /** How Regulus recovers value in this domain. */
  approach: string[];
  evidence: EvidenceClass;
  /** Simple monogram icon key rendered as SVG. */
  icon: IconKey;
};

export type IconKey =
  | "corporate"
  | "financial"
  | "knowledge"
  | "psychological"
  | "decision"
  | "automation"
  | "infrastructure"
  | "energy"
  | "material"
  | "discovery";

export const intelligenceDomains: IntelligenceDomain[] = [
  {
    slug: "corporate-intelligence",
    name: "Corporate Intelligence",
    short: "See the whole organization as one connected system.",
    summary:
      "A living model of how an organization actually operates — its flows, dependencies, and friction — so leaders act on evidence instead of anecdote.",
    loss: "Decisions made on fragments of a picture no one holds completely.",
    approach: [
      "Integrate signals across departments into one coherent model.",
      "Surface the dependencies and bottlenecks that reports hide.",
      "Quantify the cost of friction before recommending change.",
    ],
    evidence: "operational",
    icon: "corporate",
  },
  {
    slug: "financial-intelligence",
    name: "Financial Intelligence",
    short: "Find the value already inside the balance sheet.",
    summary:
      "Cash, capital, and working-capital efficiency read as a system. We locate trapped value and quantify the cost of leaving it trapped.",
    loss: "Capital sitting idle, mispriced risk, and avoidable financing cost.",
    approach: [
      "Model cash and capital flows across a rolling horizon.",
      "Separate structural cost from recoverable inefficiency.",
      "Prioritize recovery by evidence-weighted impact.",
    ],
    evidence: "operational",
    icon: "financial",
  },
  {
    slug: "knowledge-intelligence",
    name: "Knowledge Intelligence",
    short: "Stop paying twice for what you already know.",
    summary:
      "Institutional knowledge — documents, decisions, expertise — connected into a graph that answers questions instead of hiding answers.",
    loss: "Knowledge that walks out the door or is rediscovered at full cost.",
    approach: [
      "Build a knowledge graph over the organization's real artifacts.",
      "Preserve provenance so every answer is traceable to a source.",
      "Make recall a query, not an archaeology project.",
    ],
    evidence: "operational",
    icon: "knowledge",
  },
  {
    slug: "psychological-intelligence",
    name: "Psychological Intelligence",
    short: "Understand how teams actually decide and align.",
    summary:
      "A disciplined, consent-respecting view of team dynamics, alignment, and decision friction — grounded in observable signals, never speculation about individuals.",
    loss: "Misalignment and unspoken friction that quietly tax every project.",
    approach: [
      "Measure alignment and friction from observable, consented signals.",
      "Keep the unit of analysis the system, not the individual.",
      "Recommend structural changes, not surveillance.",
    ],
    evidence: "research",
    icon: "psychological",
  },
  {
    slug: "decision-intelligence",
    name: "Decision Intelligence",
    short: "Make the next decision measurably better than the last.",
    summary:
      "Structured decision support that separates what is known from what is assumed, tracks outcomes, and compounds judgment over time.",
    loss: "Repeated decisions with no memory and no measured improvement.",
    approach: [
      "Frame decisions with explicit evidence and assumptions.",
      "Record outcomes and feed them back into the next decision.",
      "Compound institutional judgment instead of resetting it.",
    ],
    evidence: "operational",
    icon: "decision",
  },
  {
    slug: "automation-intelligence",
    name: "Automation Intelligence",
    short: "Automate the work that should never have been manual.",
    summary:
      "Identify repetitive, low-judgment work, quantify its true cost, and recover that time — automating last, only where it durably pays.",
    loss: "Skilled people spending hours on work a system should carry.",
    approach: [
      "Map repetitive workflows and their real, loaded cost.",
      "Automate last — only where it removes durable friction.",
      "Return recovered hours to judgment-bearing work.",
    ],
    evidence: "operational",
    icon: "automation",
  },
  {
    slug: "infrastructure-intelligence",
    name: "Infrastructure Intelligence",
    short: "Recover capacity from systems you already own.",
    summary:
      "Read physical and digital infrastructure as a system to recover latent capacity before recommending replacement.",
    loss: "Capacity paid for and never used; replacement bought too early.",
    approach: [
      "Instrument utilization across existing infrastructure.",
      "Recover latent capacity before proposing new spend.",
      "Time replacement to evidence, not vendor cycles.",
    ],
    evidence: "research",
    icon: "infrastructure",
  },
  {
    slug: "energy-intelligence",
    name: "Energy Intelligence",
    short: "Quantify energy loss, then recover what physics allows.",
    summary:
      "Evidence-first energy analysis bounded by physical law. We quantify avoidable loss and pursue recovery that respects thermodynamics — no over-unity claims.",
    loss: "Energy dissipated through avoidable inefficiency and poor timing.",
    approach: [
      "Measure loss against a physically grounded baseline.",
      "Recover only what the second law permits — stated plainly.",
      "Separate operational savings from research hypotheses.",
    ],
    evidence: "research",
    icon: "energy",
  },
  {
    slug: "material-intelligence",
    name: "Material Intelligence",
    short: "Turn material waste into recovered value.",
    summary:
      "Track material flows to find recoverable waste, quantify it, and route it toward reuse — recovery over replacement, measured in real units.",
    loss: "Material discarded that still carries recoverable value.",
    approach: [
      "Trace material flows end to end.",
      "Quantify recoverable value in physical and financial units.",
      "Design reuse paths before disposal is assumed.",
    ],
    evidence: "research",
    icon: "material",
  },
  {
    slug: "discovery-intelligence",
    name: "Discovery Intelligence",
    short: "Find the opportunity before anyone names it.",
    summary:
      "A continuous search for recoverable waste, new capability, and high-leverage opportunity — the engine that feeds every other domain.",
    loss: "Opportunity that expires unseen for lack of a system to look.",
    approach: [
      "Search continuously across heterogeneous sources.",
      "Cluster weak signals into named, testable opportunities.",
      "Route the strongest to a pilot before scaling.",
    ],
    evidence: "operational",
    icon: "discovery",
  },
];

export const evidenceMeta: Record<EvidenceClass, { label: string; blurb: string; tone: string }> = {
  operational: {
    label: "Operational",
    blurb: "Demonstrated capability, running in production contexts.",
    tone: "emerald",
  },
  research: {
    label: "Regulus Research",
    blurb: "Active investigation with promising but not yet operational evidence.",
    tone: "accent",
  },
  speculative: {
    label: "Speculative",
    blurb: "A hypothesis or long-term direction, clearly labeled as such.",
    tone: "gold",
  },
};

export function getDomain(slug: string) {
  return intelligenceDomains.find((d) => d.slug === slug);
}

/**
 * How the domains connect — grounded relationships, not decoration. Hovering
 * one domain illuminates these (the "constellation"). Discovery feeds every
 * domain, so it connects to all. Relationships are made symmetric at runtime
 * by `relatedSlugs`.
 */
export const domainRelations: Record<string, string[]> = {
  "corporate-intelligence": ["financial-intelligence", "knowledge-intelligence", "decision-intelligence"],
  "financial-intelligence": ["corporate-intelligence", "decision-intelligence"],
  "knowledge-intelligence": ["corporate-intelligence", "decision-intelligence", "psychological-intelligence"],
  "psychological-intelligence": ["knowledge-intelligence", "decision-intelligence"],
  "decision-intelligence": [
    "corporate-intelligence",
    "financial-intelligence",
    "knowledge-intelligence",
    "psychological-intelligence",
  ],
  "automation-intelligence": ["infrastructure-intelligence", "corporate-intelligence"],
  "infrastructure-intelligence": ["automation-intelligence", "energy-intelligence", "material-intelligence"],
  "energy-intelligence": ["infrastructure-intelligence", "material-intelligence"],
  "material-intelligence": ["infrastructure-intelligence", "energy-intelligence"],
  // The Discovery Engine feeds every other domain.
  "discovery-intelligence": intelligenceDomains
    .map((d) => d.slug)
    .filter((s) => s !== "discovery-intelligence"),
};

/** The symmetric set of domains related to `slug` (excludes `slug` itself). */
export function relatedSlugs(slug: string): Set<string> {
  const set = new Set<string>(domainRelations[slug] ?? []);
  for (const [key, list] of Object.entries(domainRelations)) {
    if (list.includes(slug)) set.add(key);
  }
  set.delete(slug);
  return set;
}
