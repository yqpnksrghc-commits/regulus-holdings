export const RECEPTIONIST_INTENTS = [
  "company_overview",
  "services",
  "industries",
  "pricing",
  "booking",
  "technical_question",
  "implementation",
  "support",
  "existing_client",
  "career",
  "privacy",
  "ai_disclosure",
  "contact",
  "unknown",
] as const;

export type ReceptionistIntent = (typeof RECEPTIONIST_INTENTS)[number];

export type IntentClassification = {
  intent: ReceptionistIntent;
  confidence: number;
  secondary_intents: ReceptionistIntent[];
};

const RULES: { intent: ReceptionistIntent; pattern: RegExp; weight: number }[] = [
  { intent: "pricing", pattern: /\b(price|pricing|cost|how much|fee|charge|rate|budget)\b/i, weight: 0.98 },
  { intent: "booking", pattern: /\b(?:book|schedule|arrange|set up)\b.{0,24}\b(?:call|meeting|consultation|discovery|demo|appointment|time)\b|\b(?:discovery|consultation)\s+call\b/i, weight: 0.97 },
  { intent: "career", pattern: /\b(job|career|hiring|resume|application|work for)\b/i, weight: 0.96 },
  { intent: "existing_client", pattern: /\b(?:(?:existing|current) client|already (?:a|an) client)\b|\bour (account|project|invoice)\b/i, weight: 0.94 },
  { intent: "support", pattern: /\b(support|help with my|not working|issue with|problem with my)\b/i, weight: 0.9 },
  { intent: "technical_question", pattern: /\b(api|integration|software|technology|tech stack|security|data|model|ai)\b/i, weight: 0.88 },
  { intent: "implementation", pattern: /\b(implement|deployment|timeline|how long|build|install|connect to)\b/i, weight: 0.9 },
  { intent: "industries", pattern: /\b(industry|industries|clinic|dental|medical|med spa|professional service|law firm)\b/i, weight: 0.92 },
  { intent: "services", pattern: /\b(service|offer|what do you do|help with|automat(?:e|ed|es|ing|ion)?|receptionist|follow-?up|lead|miss(?:ed|ing)? calls?|manual|fragmented|scattered)\b/i, weight: 0.9 },
  { intent: "company_overview", pattern: /\b(who are you|what is regulus|about regulus|tell me about|what does regulus(?: automation)? do)\b/i, weight: 0.96 },
  { intent: "privacy", pattern: /\b(privacy|store my|my information|personal data|gdpr)\b/i, weight: 0.96 },
  { intent: "ai_disclosure", pattern: /\b(are you (a )?(bot|ai|human|robot|real))\b/i, weight: 0.98 },
  { intent: "contact", pattern: /\b(contact|email|phone|reach)\b/i, weight: 0.9 },
];

export function classifyIntent(text: string): IntentClassification {
  const matches = RULES.filter((r) => r.pattern.test(text)).sort((a, b) => b.weight - a.weight);
  if (!matches.length) return { intent: "unknown", confidence: 0.35, secondary_intents: [] };
  const unique = [...new Set(matches.map((m) => m.intent))];
  const primary = unique[0];
  return {
    intent: primary,
    confidence: matches[0].weight,
    secondary_intents: unique
      .slice(1)
      .filter((intent) =>
        !(primary === "company_overview" && intent === "services") &&
        !(primary === "privacy" && intent === "technical_question"),
      )
      .slice(0, 3),
  };
}
