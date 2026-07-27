import assert from "node:assert/strict";
import test from "node:test";
import { classifyIntent, RECEPTIONIST_INTENTS } from "../src/lib/receptionist/intent";
import { retrieveKnowledge } from "../src/lib/receptionist/retrieval";
import { draftConsultativeResponse } from "../src/lib/receptionist/response";
import { evaluateQuality, evaluateSales, validateEvidence } from "../src/lib/receptionist/evaluation";
import { emptyQualification } from "../src/lib/receptionist/schema";
import { DeterministicModel } from "../src/lib/receptionist/model/deterministic";
import { newConversation, processVisitorTurn } from "../src/lib/receptionist/conversation";
import type { ModelContext, ModelReply, ReceptionistModel } from "../src/lib/receptionist/model/adapter";

const NOW = new Date("2026-07-27T14:00:00Z");
const model = new DeterministicModel();

class UnsupportedModel implements ReceptionistModel {
  readonly name = "unsupported-test";
  async respond(_context: ModelContext): Promise<ModelReply> {
    return {
      reply: "Our clients always double revenue and we guarantee results. Contact a representative.",
      evidenceIds: ["invented.claim"],
      proposedAction: { kind: "none" },
    };
  }
}

test("intent classifier returns primary, confidence, and secondary intents", () => {
  const result = classifyIntent("How much is implementation for a dental clinic, and can I book a call?");
  assert.equal(result.intent, "pricing");
  assert.ok(result.confidence >= 0.9);
  assert.ok(result.secondary_intents.includes("booking"));
});

test("retrieval is narrow: company overview excludes pricing and technical context", () => {
  const classification = classifyIntent("What does Regulus Automation do?");
  assert.equal(classification.intent, "company_overview");
  const result = retrieveKnowledge(classification);
  assert.deepEqual(result.facts.map((f) => f.id), ["company.identity", "company.audience"]);
  assert.equal(result.facts.some((f) => f.id.startsWith("pricing.")), false);
  assert.equal(result.facts.some((f) => f.id.startsWith("service.")), false);
});

test("every supported intent drafts a direct answer plus exactly one qualification question", () => {
  for (const intent of RECEPTIONIST_INTENTS) {
    const classification = { intent, confidence: 1, secondary_intents: [] };
    const retrieval = retrieveKnowledge(classification);
    const draft = draftConsultativeResponse(classification, retrieval, emptyQualification());
    assert.ok(draft.reply.startsWith(draft.directAnswer), `${intent} must answer first`);
    assert.equal((draft.reply.match(/\?/g) || []).length, 1, `${intent} must ask exactly one question`);
    assert.doesNotMatch(draft.reply, /\bI don't know\b|a (?:human|representative) can answer that/i);
  }
});

test("quality, sales, and evidence evaluators pass approved consultative output", () => {
  const classification = classifyIntent("How much do you charge?");
  const retrieval = retrieveKnowledge(classification);
  const draft = draftConsultativeResponse(classification, retrieval, emptyQualification());
  const quality = evaluateQuality(draft.reply, draft.directAnswer);
  const sales = evaluateSales(draft.reply);
  const evidence = validateEvidence(draft.reply, draft.evidenceIds, retrieval.facts, draft.reply);
  assert.equal(quality.passed, true, JSON.stringify(quality.checks));
  assert.equal(sales.passed, true, JSON.stringify(sales.checks));
  assert.equal(evidence.passed, true, JSON.stringify(evidence.checks));
});

test("evidence evaluator rejects unsupported claim ids and guarantee language", () => {
  const retrieval = retrieveKnowledge(classifyIntent("What do you do?"));
  const result = validateEvidence("We guarantee revenue.", ["invented.claim"], retrieval.facts);
  assert.equal(result.passed, false);
  assert.equal(result.checks.ids_retrieved, false);
  assert.equal(result.checks.no_forbidden_claims, false);
});

test("weak or unsupported model output is regenerated from approved knowledge", async () => {
  const record = newConversation("regen", "/", null, NOW);
  const turn = await processVisitorTurn(record, "What does Regulus do?", new UnsupportedModel(), { now: NOW });
  assert.equal(turn.record.response_intelligence?.regenerated, true);
  assert.ok((turn.record.response_intelligence?.quality_score ?? 0) >= 6);
  assert.ok((turn.record.response_intelligence?.sales_score ?? 0) >= 5);
  assert.equal(turn.record.response_intelligence?.evidence_score, 5);
  assert.doesNotMatch(turn.reply, /double revenue|guarantee|contact a representative/i);
  assert.match(turn.reply, /^Regulus Automation Inc\./);
});

test("conversation memory updates and avoids the same qualification question", async () => {
  let record = newConversation("memory", "/", null, NOW);
  const first = await processVisitorTurn(record, "What services do you offer?", model, { now: NOW });
  record = first.record;
  assert.match(first.reply, /What industry/i);
  assert.ok(record.qualification.questions_answered.includes("services"));

  const second = await processVisitorTurn(record, "We run a dental clinic.", model, { now: NOW });
  assert.equal(second.record.qualification.industry, "dental");
  assert.doesNotMatch(second.reply, /What industry/i);
  assert.equal((second.reply.match(/\?/g) || []).length, 1);
});

test("response-intelligence evidence is stored with every normal turn", async () => {
  const record = newConversation("evidence", "/", null, NOW);
  const turn = await processVisitorTurn(record, "How much do you charge?", model, { now: NOW });
  assert.equal(turn.record.response_intelligence?.intent, "pricing");
  assert.ok((turn.record.response_intelligence?.knowledge_ids.length ?? 0) >= 2);
  assert.ok((turn.record.response_intelligence?.quality_score ?? 0) >= 6);
  assert.ok((turn.record.response_intelligence?.sales_score ?? 0) >= 5);
  assert.equal(turn.record.response_intelligence?.evidence_score, 5);
});

test("already-a-client phrasing routes to the verified support path", async () => {
  const record = newConversation("existing-client", "/", null, NOW);
  const turn = await processVisitorTurn(record, "I'm already a client and need help.", model, { now: NOW });
  assert.equal(turn.record.response_intelligence?.intent, "existing_client");
  assert.match(turn.reply, /info@regulusautomation\.ca/);
  assert.equal(turn.record.human_takeover, false);
});

test("privacy questions retrieve only the privacy boundary and do not fall back", async () => {
  const record = newConversation("privacy-boundary", "/", null, NOW);
  const turn = await processVisitorTurn(record, "How do you handle my personal data?", model, { now: NOW });
  assert.equal(turn.record.error, null);
  assert.equal(turn.record.response_intelligence?.intent, "privacy");
  assert.deepEqual(turn.record.response_intelligence?.knowledge_ids, ["privacy.note"]);
  assert.match(turn.reply, /used only to respond to your inquiry/i);
});
