/**
 * Provider-neutral model interface.
 *
 * The conversation engine, validation, business rules, and action execution
 * depend ONLY on this interface — never on a concrete provider. A deterministic
 * adapter (default, no network) and an Anthropic adapter (config-enabled)
 * implement it. A model may only *propose* a reply, an extraction, and an
 * action; deterministic code decides and executes.
 */
import type { QualificationFields, TranscriptTurn } from "@/lib/receptionist/schema";

export type ModelContext = {
  transcript: TranscriptTurn[];
  qualification: QualificationFields;
  sourcePage: string | null;
  /** Flags raised by the injection/spam guard for the latest visitor turn. */
  visitorFlags: string[];
};

export type ProposedAction =
  | { kind: "none" }
  | { kind: "offer_booking" }
  | { kind: "request_human" }
  | { kind: "create_lead" }
  | { kind: "mark_out_of_scope" };

export type ModelReply = {
  /** The receptionist's user-facing message. Always plain text. */
  reply: string;
  /** Optional structured extraction PROPOSAL (re-validated before trust). */
  proposedExtraction?: Partial<QualificationFields>;
  /** Optional action PROPOSAL (never self-executed by the model). */
  proposedAction?: ProposedAction;
};

export interface ReceptionistModel {
  readonly name: string;
  respond(context: ModelContext): Promise<ModelReply>;
}
