/**
 * Model selection — the config-not-code switch.
 *
 * Default is the deterministic adapter (no network, no key). Setting
 * RECEPTIONIST_MODEL_PROVIDER=anthropic with ANTHROPIC_API_KEY enables the
 * production model with zero code change. The production adapter always has the
 * deterministic adapter as a fallback so a model outage degrades, never breaks.
 */
import { DeterministicModel } from "@/lib/receptionist/model/deterministic";
import { AnthropicModel } from "@/lib/receptionist/model/anthropic";
import type { ModelContext, ModelReply, ReceptionistModel } from "@/lib/receptionist/model/adapter";

/** Wraps a primary model with a deterministic fallback on any failure. */
class FallbackModel implements ReceptionistModel {
  readonly name: string;
  constructor(private primary: ReceptionistModel, private fallback: ReceptionistModel) {
    this.name = `${primary.name}+${fallback.name}`;
  }
  async respond(context: ModelContext): Promise<ModelReply> {
    try {
      return await this.primary.respond(context);
    } catch {
      // Model timeout / invalid output / HTTP error: fall back deterministically.
      return this.fallback.respond(context);
    }
  }
}

export function selectModel(env: NodeJS.ProcessEnv = process.env): ReceptionistModel {
  const provider = (env.RECEPTIONIST_MODEL_PROVIDER || "deterministic").toLowerCase();
  const deterministic = new DeterministicModel();
  if (provider === "anthropic" && env.ANTHROPIC_API_KEY) {
    return new FallbackModel(new AnthropicModel(env.ANTHROPIC_API_KEY), deterministic);
  }
  return deterministic;
}

export type { ReceptionistModel, ModelContext, ModelReply } from "@/lib/receptionist/model/adapter";
