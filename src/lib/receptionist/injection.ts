/**
 * Input sanitization and prompt-injection resistance.
 *
 * Visitor text is UNTRUSTED DATA. It can never override receptionist authority,
 * the knowledge boundary, privacy rules, booking-evidence requirements, lead
 * validation, or escalation rules. This module (a) hard-caps and cleans input,
 * and (b) *flags* manipulation attempts so downstream policy can refuse — it
 * never tries to "obey safely". Flags are recorded for audit; the model is still
 * instructed to treat the text as data.
 */

export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_TURNS = 40;

// Control chars to strip (keep \t = 0x09 and \n = 0x0A). Built from an escaped
// string so the source file itself contains no raw control bytes.
const CONTROL_CHARS = new RegExp("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]", "g");

/** Strip control chars and HTML-ish tags, collapse whitespace, hard-cap length. */
export function sanitize(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL_CHARS, "")
    .replace(/<[^>]*>/g, "") // tags
    .replace(/[ \t]{3,}/g, "  ")
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
}

const INJECTION_PATTERNS: { flag: string; re: RegExp }[] = [
  { flag: "override_attempt", re: /\b(ignore|disregard|forget|override)\b.{0,30}\b(previous|prior|above|earlier|all)?\s*(instructions?|rules?|prompt|context)\b/i },
  { flag: "role_reassignment", re: /\b(you are now|act as|pretend to be|from now on you|new (system )?(prompt|role|instructions?))\b/i },
  { flag: "system_prompt_exfil", re: /\b(system prompt|your (instructions?|prompt|rules|configuration)|reveal|print|repeat|show)\b.{0,30}\b(prompt|instructions?|rules|config|system)\b/i },
  { flag: "impersonation_owner", re: /\bi(?:'m| am)\s+(?:ian|the (?:founder|owner|ceo|admin|developer))\b|\bas (?:ian|the (?:owner|admin|founder))\b/i },
  { flag: "authority_claim", re: /\b(?:admin|developer|override) (?:mode|access|code)\b|\bsudo\b|\bpre-?authoriz/i },
  { flag: "action_forgery", re: /\b(?:mark|set|treat) (?:this|me|it) as (?:booked|confirmed|approved|paid|complete)\b/i },
  { flag: "data_exfil", re: /\b(?:other (?:visitors?|conversations?|users?|customers?|leads?)|all (?:leads?|conversations?|records?)|credentials?|api ?key|secret|token|env(?:ironment)? var)/i },
];

/** Detect manipulation attempts. Returns flags; callers never *act on* the text. */
export function detectInjection(sanitized: string): string[] {
  const flags: string[] = [];
  for (const { flag, re } of INJECTION_PATTERNS) if (re.test(sanitized)) flags.push(flag);
  return flags;
}

const SPAM_PATTERNS: { flag: string; re: RegExp }[] = [
  { flag: "spam_link_flood", re: /(?:https?:\/\/|www\.)\S+.*(?:https?:\/\/|www\.)\S+.*(?:https?:\/\/|www\.)\S+/i },
  { flag: "spam_promo", re: /\b(?:viagra|casino|crypto giveaway|forex signals|seo services|buy followers|loan offer|bitcoin doubl)/i },
];

export function detectSpam(sanitized: string): string[] {
  const flags: string[] = [];
  for (const { flag, re } of SPAM_PATTERNS) if (re.test(sanitized)) flags.push(flag);
  return flags;
}

/**
 * Wrap visitor text for a model prompt so it is unambiguously data, not
 * instruction. The delimiter is announced in the system prompt.
 */
export function asUntrustedData(sanitized: string): string {
  return `<visitor_message>\n${sanitized.replace(/<\/?visitor_message>/gi, "")}\n</visitor_message>`;
}

/** Redact anything that looks like a secret before it can reach a log or record. */
export function redactSecrets(text: string): string {
  return text
    .replace(/\b(?:sk|pk|rk)_[A-Za-z0-9_]{12,}\b/g, "[redacted]")
    .replace(/\bBearer\s+[A-Za-z0-9._-]{16,}\b/gi, "Bearer [redacted]")
    .replace(/\b[A-Za-z0-9]{32,}\b/g, (m) => (/^[0-9]+$/.test(m) ? m : "[redacted]"));
}
