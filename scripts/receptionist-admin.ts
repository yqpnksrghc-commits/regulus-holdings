/**
 * Receptionist operator view — internal dashboard.
 *
 * Extends the existing internal tooling convention (scripts/ahura-admin.ts):
 * a Netlify-Blobs reader driven through the netlify CLI, so operators use the
 * same authenticated, audited path they already use for reviewer invitations —
 * not a new, disconnected dashboard.
 *
 * Usage (requires `netlify link` to the production site):
 *   npx tsx scripts/receptionist-admin.ts unread                     # review queue: leads awaiting review
 *   npx tsx scripts/receptionist-admin.ts leads [--q <text>]         # all leads (search email/name/desc)
 *   npx tsx scripts/receptionist-admin.ts lead --id <lead-id>        # one lead, full detail
 *   npx tsx scripts/receptionist-admin.ts list [--state S] [--flagged]
 *   npx tsx scripts/receptionist-admin.ts follow-ups                 # conversations needing follow-up
 *   npx tsx scripts/receptionist-admin.ts search --q <text>          # search conversations
 *   npx tsx scripts/receptionist-admin.ts show --id <conversation-id>
 *   npx tsx scripts/receptionist-admin.ts archived                   # list archived conversations
 *   npx tsx scripts/receptionist-admin.ts archive --id <id>          # archive one conversation
 *   npx tsx scripts/receptionist-admin.ts archive --before-days 90   # retention sweep (terminal only)
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { ConversationRecord } from "../src/lib/receptionist/schema";

const CONVO_STORE = "regulus-receptionist-conversations";
const LEAD_STORE = "regulus-inbound-leads";
const [action, ...args] = process.argv.slice(2);
const option = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : ""; };
const flag = (name: string) => args.includes(`--${name}`);
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

function getBlob(store: string, key: string): string {
  const file = join(work, "read.json");
  netlify(["blobs:get", store, key, "--output", file]);
  return readFileSync(file, "utf8");
}

function setBlob(store: string, key: string, value: string): void {
  const file = join(work, "write.json");
  writeFileSync(file, value, "utf8");
  netlify(["blobs:set", store, key, "--input", file]);
}

function listKeys(store: string, prefix: string): string[] {
  const outStr = netlify(["blobs:list", store, "--json"]);
  const parsed = JSON.parse(outStr) as { blobs?: { key: string }[] };
  return (parsed.blobs ?? []).map((b) => b.key).filter((k) => k.startsWith(prefix));
}

type LeadRecord = {
  lead_id: string; name?: string; email?: string; organization?: string; value_leak_description?: string;
  source_page?: string; consent?: boolean; created_at?: string; pipeline_state?: string; origin?: string;
  notification_status?: string; notified_at?: string | null;
};

function summarizeConvo(r: ConversationRecord) {
  const q = r.qualification;
  const lowConfidence = Object.entries(r.confidence_by_field).filter(([, v]) => typeof v === "number" && v < 0.6).map(([k]) => k);
  return {
    conversation_id: r.conversation_id, state: r.state, follow_up_required: r.follow_up_required, human_takeover: r.human_takeover,
    lead_id: r.lead_id, lead_pipeline_state: r.lead_pipeline_state, duplicate_of: r.duplicate_of, booking_evidence: r.booking_evidence,
    contact: { name: q.visitor_name, company: q.company_name, email: q.email, phone: q.phone, preferred: q.preferred_contact_method },
    qualification: { inquiry_type: q.inquiry_type, business_problem: q.business_problem, urgency: q.urgency, decision_authority: q.decision_authority, consent: q.consent_to_follow_up },
    confidence_warnings: lowConfidence, flags: r.flags, error: r.error, updated_at: r.updated_at,
  };
}

function summarizeLead(l: LeadRecord) {
  return {
    lead_id: l.lead_id, created_at: l.created_at, origin: l.origin ?? "(form)", pipeline_state: l.pipeline_state,
    notification: l.notification_status ?? "PENDING", email: l.email, name: l.name, organization: l.organization, source_page: l.source_page,
  };
}

const out = (v: unknown) => process.stdout.write(`${JSON.stringify(v, null, 2)}\n`);
const readConvos = (prefix = "conversations/") => listKeys(CONVO_STORE, prefix).map((k) => JSON.parse(getBlob(CONVO_STORE, k)) as ConversationRecord);
const readLeads = () => listKeys(LEAD_STORE, "leads/").map((k) => JSON.parse(getBlob(LEAD_STORE, k)) as LeadRecord);

try {
  if (action === "list" || action === "follow-ups") {
    const wantState = action === "follow-ups" ? "FOLLOW_UP_REQUIRED" : option("state");
    let rows = readConvos().filter((r) => !wantState || r.state === wantState);
    if (flag("flagged")) rows = rows.filter((r) => r.flags.length > 0);
    const view = rows.map((r) => ({ id: r.conversation_id, state: r.state, follow_up: r.follow_up_required, human: r.human_takeover, lead: r.lead_id, flags: r.flags, updated: r.updated_at }));
    out(view);
    process.stdout.write(`${view.length} conversation(s).\n`);

  } else if (action === "show") {
    const id = option("id");
    if (!id) throw new Error("Usage: show --id <conversation-id>");
    const record = JSON.parse(getBlob(CONVO_STORE, `conversations/${id}`)) as ConversationRecord;
    out({ ...summarizeConvo(record), transcript: record.transcript });

  } else if (action === "unread") {
    const rows = readLeads().filter((l) => (l.pipeline_state ?? "REVIEW_REQUIRED") === "REVIEW_REQUIRED")
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).map(summarizeLead);
    out(rows);
    process.stdout.write(`${rows.length} lead(s) awaiting review.\n`);

  } else if (action === "leads") {
    const q = option("q").toLowerCase();
    let rows = readLeads();
    if (q) rows = rows.filter((l) => `${l.email} ${l.name} ${l.organization} ${l.value_leak_description}`.toLowerCase().includes(q));
    const view = rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).map(summarizeLead);
    out(view);
    process.stdout.write(`${view.length} lead(s).\n`);

  } else if (action === "lead") {
    const id = option("id");
    if (!id) throw new Error("Usage: lead --id <lead-id>");
    out(JSON.parse(getBlob(LEAD_STORE, `leads/${id}`)) as LeadRecord);

  } else if (action === "search") {
    const q = option("q").toLowerCase();
    if (!q) throw new Error("Usage: search --q <text>");
    const rows = readConvos().filter((r) => {
      const hay = `${r.qualification.email} ${r.qualification.visitor_name} ${r.qualification.company_name} ${r.qualification.business_problem} ${r.transcript.map((t) => t.text).join(" ")}`.toLowerCase();
      return hay.includes(q);
    }).map((r) => ({ id: r.conversation_id, state: r.state, email: r.qualification.email, lead: r.lead_id, updated: r.updated_at }));
    out(rows);
    process.stdout.write(`${rows.length} match(es).\n`);

  } else if (action === "archived") {
    const rows = listKeys(CONVO_STORE, "archived/").map((k) => k.replace("archived/", ""));
    out(rows);
    process.stdout.write(`${rows.length} archived conversation(s).\n`);

  } else if (action === "archive") {
    const id = option("id");
    const beforeDays = Number(option("before-days"));
    const TERMINAL = new Set(["BOOKED", "FOLLOW_UP_REQUIRED", "OUT_OF_SCOPE", "SPAM", "ABANDONED", "COMPLETED", "HUMAN_REQUESTED"]);
    const archiveOne = (r: ConversationRecord) => {
      setBlob(CONVO_STORE, `archived/${r.conversation_id}`, JSON.stringify(r));
      netlify(["blobs:delete", CONVO_STORE, `conversations/${r.conversation_id}`]);
      for (const tk of listKeys(CONVO_STORE, `turns/${r.conversation_id}/`)) netlify(["blobs:delete", CONVO_STORE, tk]);
    };
    if (id) {
      archiveOne(JSON.parse(getBlob(CONVO_STORE, `conversations/${id}`)) as ConversationRecord);
      process.stdout.write(`Archived ${id}.\n`);
    } else if (Number.isFinite(beforeDays) && beforeDays > 0) {
      const cutoff = Date.now() - beforeDays * 86_400_000;
      const stale = readConvos().filter((r) => TERMINAL.has(r.state) && Date.parse(r.updated_at) < cutoff);
      for (const r of stale) archiveOne(r);
      out(stale.map((r) => r.conversation_id));
      process.stdout.write(`Archived ${stale.length} terminal conversation(s) older than ${beforeDays} day(s).\n`);
    } else {
      throw new Error("Usage: archive --id <id> | archive --before-days <N>");
    }

  } else {
    throw new Error("Use: unread | leads [--q <t>] | lead --id <id> | list [--state S] [--flagged] | follow-ups | search --q <t> | show --id <id> | archived | archive (--id <id> | --before-days N)");
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
