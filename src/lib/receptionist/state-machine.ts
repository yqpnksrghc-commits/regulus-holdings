/**
 * Explicit, validated conversation state machine. Every transition is checked
 * against this table; illegal transitions are rejected (and become an audit
 * flag), so no code path can silently move a conversation into a bad state.
 */
import { CONVERSATION_STATES, isTerminal } from "@/lib/receptionist/schema";
import type { ConversationState as State } from "@/lib/receptionist/schema";

/**
 * Allowed transitions. Escalation/terminal states are reachable from any active
 * state (a visitor can always ask for a human, abandon, or trip spam/error).
 */
const ALWAYS_REACHABLE: readonly State[] = [
  "HUMAN_REQUESTED",
  "OUT_OF_SCOPE",
  "SPAM",
  "ABANDONED",
  "ERROR_RECOVERABLE",
  "FOLLOW_UP_REQUIRED",
  "COMPLETED",
];

const TRANSITIONS: Record<State, readonly State[]> = {
  NEW: ["GREETING"],
  GREETING: ["INTENT_IDENTIFIED", "QUALIFYING", "CONTACT_CAPTURE"],
  INTENT_IDENTIFIED: ["QUALIFYING", "CONTACT_CAPTURE"],
  QUALIFYING: ["QUALIFYING", "CONTACT_CAPTURE", "READY_TO_BOOK"],
  CONTACT_CAPTURE: ["CONTACT_CAPTURE", "QUALIFYING", "READY_TO_BOOK"],
  READY_TO_BOOK: ["BOOKED", "FOLLOW_UP_REQUIRED", "CONTACT_CAPTURE"],
  // Terminal / escalation states have no onward active transitions.
  BOOKED: [],
  FOLLOW_UP_REQUIRED: [],
  HUMAN_REQUESTED: [],
  OUT_OF_SCOPE: [],
  SPAM: [],
  ABANDONED: [],
  ERROR_RECOVERABLE: ["GREETING", "QUALIFYING", "CONTACT_CAPTURE"],
  COMPLETED: [],
};

export { CONVERSATION_STATES, isTerminal };

export function canTransition(from: State, to: State): boolean {
  if (from === to && (from === "QUALIFYING" || from === "CONTACT_CAPTURE")) return true;
  if (ALWAYS_REACHABLE.includes(to) && !isTerminal(from)) return true;
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Validate and apply a transition. Returns the target state when legal, or the
 * unchanged `from` state plus a flag string when illegal — callers record the
 * flag rather than crashing, and the conversation stays in a known state.
 */
export function transition(from: State, to: State): { state: State; flag?: string } {
  if (canTransition(from, to)) return { state: to };
  return { state: from, flag: `illegal_transition:${from}->${to}` };
}
