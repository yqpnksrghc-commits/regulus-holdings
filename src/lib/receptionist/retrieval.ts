import {
  AI_DISCLOSURE,
  APPROVED_AUDIENCE,
  APPROVED_DISCOVERY,
  APPROVED_PRICING,
  APPROVED_OFFER_FAMILIES,
  APPROVED_SERVICES,
  COMPANY_FACTS,
  PRIVACY_NOTE,
} from "@/lib/receptionist/knowledge";
import type { IntentClassification, ReceptionistIntent } from "@/lib/receptionist/intent";

export type KnowledgeFact = {
  id: string;
  text: string;
  source: string;
};

export type RetrievalResult = {
  intents: ReceptionistIntent[];
  facts: KnowledgeFact[];
};

const FACTS: Record<Exclude<ReceptionistIntent, "unknown">, KnowledgeFact[]> = {
  company_overview: [
    { id: "company.identity", text: `${COMPANY_FACTS.name} is the larger institution focused on operational intelligence, products, discovery, research, and long-term capability creation. Regulus Business Systems is its practical commercial implementation department for growing businesses.`, source: "src/lib/site.ts + src/app/business-systems/page.tsx" },
    { id: "company.audience", text: APPROVED_AUDIENCE, source: "src/lib/site.ts + industry pages" },
  ],
  services: [
    ...APPROVED_OFFER_FAMILIES.map((offer) => ({
      id: `offer.${offer.name.toLowerCase().replaceAll(" ", "-")}`,
      text: `${offer.name}: ${offer.description} Includes ${offer.items}.`,
      source: "src/lib/commercial-services.ts",
    })),
    ...APPROVED_SERVICES.map((s) => ({
      id: `service.${s.slug}`,
      text: `${s.name}: ${s.description} ${s.outcome}`,
      source: "src/lib/commercial-services.ts",
    })),
  ],
  industries: [{ id: "company.audience", text: APPROVED_AUDIENCE, source: "src/lib/site.ts + industry pages" }],
  pricing: [
    { id: "pricing.free_audit", text: APPROVED_PRICING.free_audit, source: "src/app/free-audit/page.tsx" },
    { id: "pricing.implementation", text: APPROVED_PRICING.implementation, source: "src/lib/commercial-services.ts" },
    { id: "pricing.management", text: APPROVED_PRICING.management, source: "src/lib/commercial-services.ts" },
    { id: "pricing.boundary", text: APPROVED_PRICING.note, source: "src/lib/commercial-services.ts" },
  ],
  booking: [{ id: "process.discovery", text: APPROVED_DISCOVERY, source: "src/app/contact/page.tsx" }],
  technical_question: APPROVED_SERVICES.filter((s) => /AI|Process|Intelligence/i.test(s.name)).map((s) => ({
    id: `service.${s.slug}`,
    text: `${s.name}: ${s.description} ${s.outcome}`,
    source: "src/lib/commercial-services.ts",
  })),
  implementation: [
    { id: "process.discovery", text: APPROVED_DISCOVERY, source: "src/app/contact/page.tsx" },
    { id: "implementation.boundary", text: "The free audit is separate from optional paid implementation and optional ongoing management.", source: "src/lib/commercial-services.ts" },
  ],
  support: [{ id: "company.contact", text: `Regulus can be reached at ${COMPANY_FACTS.email}.`, source: "src/lib/site.ts" }],
  existing_client: [{ id: "company.contact", text: `Regulus can be reached at ${COMPANY_FACTS.email}.`, source: "src/lib/site.ts" }],
  career: [{ id: "company.contact", text: `Regulus can be reached at ${COMPANY_FACTS.email}.`, source: "src/lib/site.ts" }],
  privacy: [{ id: "privacy.note", text: PRIVACY_NOTE, source: "src/lib/receptionist/knowledge.ts" }],
  ai_disclosure: [{ id: "ai.disclosure", text: AI_DISCLOSURE, source: "src/lib/receptionist/knowledge.ts" }],
  contact: [{ id: "company.contact", text: `Regulus can be reached at ${COMPANY_FACTS.email}.`, source: "src/lib/site.ts" }],
};

export function retrieveKnowledge(classification: IntentClassification): RetrievalResult {
  const intents = [classification.intent, ...classification.secondary_intents];
  const facts: KnowledgeFact[] = [];
  for (const intent of intents) {
    if (intent === "unknown") continue;
    for (const fact of FACTS[intent]) if (!facts.some((f) => f.id === fact.id)) facts.push(fact);
  }
  if (!facts.length) facts.push(FACTS.company_overview[0]);
  return { intents, facts: facts.slice(0, classification.intent === "services" ? 4 : 5) };
}

export function knowledgeFact(id: string): KnowledgeFact | null {
  for (const facts of Object.values(FACTS)) {
    const match = facts.find((fact) => fact.id === id);
    if (match) return match;
  }
  return null;
}
