/**
 * Integrations the production AI Receptionist can connect to in a real
 * deployment. This is presentational copy for the demo's "what you'd get in
 * production" panel. Each item maps to a real capability of the current engine
 * (see src/lib/receptionist/*), stated honestly — nothing here is a claim that
 * an integration is live in the demo. In the demo, all of these are SIMULATED.
 */
export type DemoIntegration = {
  name: string;
  /** Grounded in an existing engine capability. */
  capability: string;
  /** Honest status inside this sandbox. */
  demoStatus: "simulated";
};

export const DEMO_INTEGRATIONS: DemoIntegration[] = [
  {
    name: "Lead capture & review queue",
    capability: "Structured leads enter a review-required queue with a durable record — the same gate the production site uses.",
    demoStatus: "simulated",
  },
  {
    name: "Verified calendar availability",
    capability: "Real, conflict-free discovery-call times are generated from the connected calendar's busy data — the receptionist never invents a slot.",
    demoStatus: "simulated",
  },
  {
    name: "Automated booking (evidence-gated)",
    capability: "A booking only becomes BOOKED when the calendar returns durable event evidence; otherwise it fails closed to a human follow-up. Bookings are idempotent per conversation.",
    demoStatus: "simulated",
  },
  {
    name: "Staff notifications (email / SMS)",
    capability: "Immediate alert to clinic staff when a consultation is requested, booked, or a human is asked for.",
    demoStatus: "simulated",
  },
  {
    name: "CRM / ledger sync",
    capability: "Qualified consultation requests can be pushed into an existing CRM or operations ledger.",
    demoStatus: "simulated",
  },
  {
    name: "Human handoff",
    capability: "Any visitor can reach a person at any time; the conversation and captured details route to a staff-owned queue.",
    demoStatus: "simulated",
  },
  {
    name: "Safety & compliance guards",
    capability: "Prompt-injection resistance, spam filtering, consent capture, emergency routing, and a no-medical-advice boundary are built in.",
    demoStatus: "simulated",
  },
];
