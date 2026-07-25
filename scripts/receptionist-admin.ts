/**
 * Receptionist operator view — internal dashboard.
 *
 * Extends the existing internal tooling convention (scripts/ahura-admin.ts):
 * a Netlify-Blobs reader driven through the netlify CLI, so operators use the
 * same authenticated, audited path they already use for reviewer invitations —
 * not a new, disconnected dashboard.
 *
 * Usage (requires `netlify link` to the production site):
 *   npx tsx scripts/receptionist-admin.ts list [--state FOLLOW_UP_REQUIRED]
 *   npx tsx scripts/receptionist-admin.ts show --id <conversation-id>
 *   npx tsx scripts/receptionist-admin.ts follow-ups
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { ConversationRecord } from "../src/lib/receptionist/schema";

const CONVO_STORE = "regulus-receptionist-conversations";
const [action, ...args] = process.argv.slice(2);
const option = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : ""; };
const work = mkdtempSync(join(tmpdir(), "receptionist-admin-"));

function netlify(a: string[]) {
  const command = process.platform === "win32" ? process.execPath : "npx";
  const commandArgs = process.platform === "win32"
    ? [join(dirname(process.execPath), "node_modules", "npm", "bin", "npx-cli.js"), "--yes", "netlify-cli", ...a]
    : ["--yes", "netlify-cli", ...a];
  const r = spawnSync(command, commandArgs, { cwd: process.cwd(), encoding: "utf8", windowsHide: true });
  if (r.status !== 0) throw new Error(r.error?.message || r.stderr || r.stdout || "Netlify operation failed.");
  return r.stdout;
}

function get(key: string): string {
  const file = join(work, "read.json");
  netlify(["blobs:get", CONVO_STORE, key, "--output", file]);
  return readFileSync(file, "utf8");
}

function listKeys(): string[] {
  const out = netlify(["blobs:list", CONVO_STORE]);
  return out.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.startsWith("conversations/"));
}

function summarize(r: ConversationRecord) {
  const q = r.qualification;
  const lowConfidence = Object.entries(r.confidence_by_field).filter(([, v]) => typeof v === "number" && v < 0.6).map(([k]) => k);
  return {
    conversation_id: r.conversation_id,
    state: r.state,
    follow_up_required: r.follow_up_required,
    human_takeover: r.human_takeover,
    lead_id: r.lead_id,
    lead_pipeline_state: r.lead_pipeline_state,
    duplicate_of: r.duplicate_of,
    booking_evidence: r.booking_evidence,
    contact: { name: q.visitor_name, company: q.company_name, email: q.email, phone: q.phone, preferred: q.preferred_contact_method },
    qualification: { inquiry_type: q.inquiry_type, business_problem: q.business_problem, urgency: q.urgency, decision_authority: q.decision_authority, consent: q.consent_to_follow_up },
    confidence_warnings: lowConfidence,
    flags: r.flags,
    error: r.error,
    updated_at: r.updated_at,
  };
}

try {
  if (action === "list" || action === "follow-ups") {
    const wantState = action === "follow-ups" ? "FOLLOW_UP_REQUIRED" : option("state");
    const rows = listKeys().map((k) => JSON.parse(get(k)) as ConversationRecord)
      .filter((r) => !wantState || r.state === wantState)
      .map((r) => ({ id: r.conversation_id, state: r.state, follow_up: r.follow_up_required, human: r.human_takeover, lead: r.lead_id, updated: r.updated_at }));
    process.stdout.write(`${JSON.stringify(rows, null, 2)}\n${rows.length} conversation(s).\n`);
  } else if (action === "show") {
    const id = option("id");
    if (!id) throw new Error("Usage: show --id <conversation-id>");
    const record = JSON.parse(get(`conversations/${id}`)) as ConversationRecord;
    const view = { ...summarize(record), transcript: record.transcript };
    process.stdout.write(`${JSON.stringify(view, null, 2)}\n`);
  } else {
    throw new Error("Use: list [--state <STATE>] | show --id <id> | follow-ups");
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
