import type { EvidenceClass } from "./platform";

/**
 * Narrative content for the marketing surfaces. Kept in data so copy is
 * editable without touching component logic (see CONTENT.md for the strategy).
 */

export const corePrinciples = [
  {
    title: "Evidence over assumptions",
    body: "We measure before we recommend. A claim that cannot be checked is not a conclusion — it is a hypothesis, and we label it as one.",
    anchor: "evidence",
  },
  {
    title: "Recovery over replacement",
    body: "Most value is not missing — it is trapped. We recover capacity from what already exists before we ever propose replacing it.",
    anchor: "recovery",
  },
  {
    title: "Intelligence through integration",
    body: "A signal in isolation is noise. Value appears when separate systems are connected into one coherent, queryable whole.",
    anchor: "integration",
  },
] as const;

export const lossVectors = [
  { label: "Energy", note: "Dissipated through avoidable inefficiency." },
  { label: "Materials", note: "Discarded while still carrying value." },
  { label: "Information", note: "Generated, then lost or never connected." },
  { label: "Time", note: "Spent on work a system should carry." },
  { label: "Capital", note: "Idle, mispriced, or financing itself." },
  { label: "Knowledge", note: "Rediscovered at full cost, again and again." },
  { label: "Attention", note: "Fragmented across noise no one filtered." },
] as const;

export const approachLoop = [
  {
    step: "Observe",
    body: "Instrument the system as it truly runs — not as the org chart imagines it.",
  },
  {
    step: "Measure",
    body: "Quantify loss against a grounded baseline, in real units.",
  },
  {
    step: "Understand",
    body: "Connect signals into a model that explains why the loss occurs.",
  },
  {
    step: "Recover",
    body: "Return trapped value — capacity, capital, time — to productive use.",
  },
  {
    step: "Improve",
    body: "Feed outcomes back so the next cycle starts ahead of this one.",
  },
] as const;

export const discoveryModes = [
  { title: "Need Discovery", body: "Surface unmet needs before they are voiced." },
  { title: "Technology Discovery", body: "Track emerging capability across fields." },
  { title: "Capability Discovery", body: "Find what the organization could already do." },
  { title: "Opportunity Discovery", body: "Name high-leverage openings while they are open." },
  { title: "Timing Intelligence", body: "Judge when a move is early, ripe, or late." },
  { title: "Compound Detection", body: "See where small opportunities combine into large ones." },
] as const;

export const values = [
  { name: "Evidence", body: "We hold ourselves to what can be shown." },
  { name: "Integrity", body: "We say what is true, including what we do not know." },
  { name: "Stewardship", body: "We treat resources — and trust — as things to preserve." },
  { name: "Recovery", body: "We repair and recover before we replace." },
  { name: "Continuous Learning", body: "Every outcome is fuel for the next decision." },
  { name: "Long-term Thinking", body: "We build for the decade, not the demo." },
] as const;

export const industries = [
  { name: "Manufacturing", note: "Material and energy recovery on the line." },
  { name: "Construction", note: "Capacity and waste across the project." },
  { name: "Professional Services", note: "Knowledge and time, made recoverable." },
  { name: "Healthcare", note: "Decisions and resources under real constraint." },
  { name: "Finance", note: "Trapped capital and mispriced risk." },
  { name: "Government", note: "Stewardship of public capacity." },
  { name: "Energy", note: "Loss quantified within physical law." },
  { name: "Education", note: "Knowledge that compounds instead of leaking." },
] as const;

export type Product = {
  name: string;
  slug: string;
  status: "Available" | "In Development" | "Research";
  summary: string;
  evidence: EvidenceClass;
};

export const products: Product[] = [
  {
    name: "Corporate Intelligence System",
    slug: "corporate-intelligence-system",
    status: "Available",
    summary: "The connected model of an organization — its flows, dependencies, and recoverable friction.",
    evidence: "operational",
  },
  {
    name: "Executive Dashboard",
    slug: "executive-dashboard",
    status: "Available",
    summary: "One surface where leaders see evidence, not anecdote — and act on it.",
    evidence: "operational",
  },
  {
    name: "AI Workforce",
    slug: "ai-workforce",
    status: "In Development",
    summary: "Judgment-respecting agents that carry the repetitive work and return recovered time.",
    evidence: "research",
  },
  {
    name: "Knowledge Platform",
    slug: "knowledge-platform",
    status: "In Development",
    summary: "Institutional knowledge as a queryable graph, with provenance preserved.",
    evidence: "research",
  },
  {
    name: "Discovery Engine",
    slug: "discovery-engine",
    status: "Available",
    summary: "Continuous search for recoverable waste, new capability, and high-leverage opportunity.",
    evidence: "operational",
  },
  {
    name: "Adaptive Reality Engine",
    slug: "adaptive-reality-engine",
    status: "Research",
    summary: "A long-horizon research direction in adaptive, responsive environments.",
    evidence: "speculative",
  },
];

export const roadmap = [
  { horizon: "Now", items: ["Corporate Intelligence", "Discovery Engine", "Executive Dashboard"] },
  { horizon: "Next", items: ["Federated AI", "Knowledge Platform", "AI Workforce"] },
  {
    horizon: "Long-term research",
    items: ["Adaptive Reality", "Living Worlds", "Psychological Intelligence", "Materials Recovery", "Energy Recovery"],
  },
] as const;
