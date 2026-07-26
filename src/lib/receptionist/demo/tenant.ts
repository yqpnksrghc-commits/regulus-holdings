/**
 * Demo tenant configuration — Northstar Aesthetics (Demonstration Clinic).
 *
 * This is a FICTIONAL prospect-facing tenant used only by the sales demo. It is
 * the demo's equivalent of src/lib/receptionist/knowledge.ts: the ONLY body of
 * clinic-specific fact the demo receptionist may assert. It contains no real
 * clinic, no real medical claims, and no real contact details.
 *
 * Nothing in this module performs I/O or touches the production stores. It is
 * pure data + pure detectors, imported only by the demo model and demo session
 * (never by the production route, model selection, or store).
 */

/** Explicit sandbox marker. The demo path is gated by living behind this mode. */
export const RECEPTIONIST_MODE = "demo" as const;
export type ReceptionistMode = "production" | typeof RECEPTIONIST_MODE;

/** Fictional clinic identity. Clearly labelled as a demonstration everywhere. */
export const DEMO_TENANT = {
  name: "Northstar Aesthetics",
  label: "Northstar Aesthetics — Demonstration Clinic",
  shortName: "Northstar",
  tagline: "Considered aesthetic care, on your schedule.",
  /** Fictional demo contact. Not a real inbox — used only inside the sandbox. */
  email: "hello@northstar-aesthetics.example",
  region: "Toronto, Ontario",
  hours: "Tuesday–Saturday, 9:00am–6:00pm",
} as const;

/** The one-line AI disclosure, mirroring the production AI_DISCLOSURE contract. */
export const DEMO_AI_DISCLOSURE =
  `I'm the ${DEMO_TENANT.name} virtual receptionist — an automated assistant, not a human and not a clinician. ` +
  `I can share general information about the clinic and help you request a consultation. You can ask to speak with our team at any time.`;

/** Consent + privacy copy. Explicit, shown before any detail is captured. */
export const DEMO_CONSENT_NOTE =
  "To arrange a consultation we only need your name, an email or phone number, and what you're interested in. " +
  "With your consent, those details are shared with the Northstar team to follow up. " +
  "Please don't share medical history, health conditions, or any sensitive personal information here — a clinician will discuss that privately at your consultation.";

/** Fictional, non-clinical service catalogue (marketing descriptions only). */
export const DEMO_SERVICES = [
  {
    slug: "consultation",
    name: "Complimentary Consultation",
    description:
      "A relaxed, no-obligation conversation with a Northstar specialist to talk through your goals and answer questions.",
    outcome: "A clear, personalised plan and transparent pricing before anything is booked.",
  },
  {
    slug: "skin-refresh",
    name: "Signature Skin Refresh",
    description:
      "A tailored facial treatment focused on hydration, texture, and a healthy-looking glow.",
    outcome: "Refreshed, comfortable skin with no downtime.",
  },
  {
    slug: "injectable-consults",
    name: "Injectable Consultations",
    description:
      "Specialist-led consultations for popular injectable treatments, always beginning with an in-person assessment.",
    outcome: "An honest recommendation — including when a treatment isn't right for you.",
  },
  {
    slug: "laser",
    name: "Laser & Light Treatments",
    description:
      "A range of laser and light-based treatments matched to your skin during consultation.",
    outcome: "A staged plan with realistic timelines and aftercare guidance.",
  },
] as const;

/** Grounded FAQ answers keyed by topic. Every string is demo-fictional marketing copy. */
export function demoGroundedAnswer(topic: string): string | null {
  switch (topic) {
    case "what_is_clinic":
      return `${DEMO_TENANT.name} is a demonstration aesthetic clinic in ${DEMO_TENANT.region}. ${DEMO_TENANT.tagline} We focus on consultation-first, unhurried care.`;
    case "services":
      return `Northstar offers ${DEMO_SERVICES.map((s) => s.name).join(", ")}. Which of these are you most curious about?`;
    case "pricing":
      return "The initial consultation is complimentary. Treatment pricing is confirmed by a specialist during your consultation, because it depends on your goals and assessment — there are no obligations.";
    case "booking":
    case "consultation":
      return "The best next step is a complimentary consultation. I can capture a few details and the preferred timing that suits you, and the Northstar team will confirm an appointment by email or phone.";
    case "hours":
      return `Northstar's demonstration hours are ${DEMO_TENANT.hours}.`;
    case "location":
      return `Northstar is a demonstration clinic based in ${DEMO_TENANT.region}.`;
    case "contact":
      return `You can reach the demonstration team at ${DEMO_TENANT.email}. I can also take your details here so someone follows up.`;
    case "privacy":
      return DEMO_CONSENT_NOTE;
    case "ai_disclosure":
      return DEMO_AI_DISCLOSURE;
    default:
      return null;
  }
}

/** Topics escalated to a human rather than answered by the assistant. */
export const DEMO_ESCALATION_TOPICS = [
  "specific treatment suitability for your individual case",
  "pricing quotes beyond the complimentary consultation",
  "complaints, refunds, or existing appointment changes",
  "anything about a specific patient record",
] as const;

/**
 * Emergency-language detection. If a visitor describes a medical emergency, the
 * receptionist must STOP the intake flow and direct them to emergency services.
 * Kept deliberately broad — a false positive costs only a safety message.
 */
const EMERGENCY_RE =
  /\b(?:chest pain|can'?t breathe|cannot breathe|difficulty breathing|trouble breathing|short(?:ness)? of breath|anaphyla|severe (?:allergic|reaction|bleeding|pain)|bleeding (?:heavily|badly|won'?t stop)|won'?t stop bleeding|passed out|unconscious|fainted|stroke|numb (?:face|arm)|slurred speech|heart attack|seizure|overdose|suicid|kill myself|want to die|emergency|call 911|911)\b/i;

export function detectEmergency(text: string): boolean {
  return EMERGENCY_RE.test(text);
}

export const DEMO_EMERGENCY_REPLY =
  "This sounds like it may be a medical emergency. Please stop and call 911 (or your local emergency number) right now, " +
  "or go to your nearest emergency department. I'm an automated assistant and can't help with medical emergencies. " +
  "Once you're safe, the Northstar team is here whenever you'd like to talk.";

/**
 * Medical-advice / health-information detection. The demo must not give medical
 * advice or collect medical history. On a match the assistant deflects to an
 * in-person consultation instead of engaging.
 */
const MEDICAL_ADVICE_RE =
  /\b(?:is[\w\s]{0,25}safe|safe for me|safe (?:to|with) (?:my|me)|right for me|suitable for me|am i (?:a )?(?:good )?candidate|can i (?:take|use|get|still)|should i (?:take|use|get|stop|mix)|side effects?|contraindicat|drug interaction|interact with|diagnos|what'?s wrong|treat my|cure|prescri|dosage|doses?|medications?|pregnan|breastfeed|my (?:heart |skin |health )?(?:condition|allerg|diagnosis|medical history|meds))\b/i;

export function detectMedicalAdviceRequest(text: string): boolean {
  return MEDICAL_ADVICE_RE.test(text);
}

export const DEMO_MEDICAL_DEFLECTION =
  "I'm not able to give medical advice or take any health information here — that's important to get right in person. " +
  "A Northstar specialist will review anything medical with you privately at your consultation. " +
  "I can help you request that consultation now if you'd like.";

/** Demo greeting, mirroring conversation.ts GREETING_MESSAGE but tenant-specific. */
export const DEMO_GREETING_MESSAGE =
  `Hi, and welcome to ${DEMO_TENANT.name}. ${DEMO_AI_DISCLOSURE} What can I help you with today?`;
