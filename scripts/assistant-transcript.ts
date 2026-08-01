/**
 * Developer utility: print a full assistant transcript for a scenario so a
 * person can read what a visitor would actually experience.
 *
 *   npx tsx scripts/assistant-transcript.ts "Construction" "Payroll" "..."
 */
import { newConversation, processVisitorTurn, buildLeadBrief } from "@/lib/receptionist/conversation";
import { DeterministicModel } from "@/lib/receptionist/model/deterministic";

const model = new DeterministicModel();
const now = new Date("2026-08-01T12:00:00.000Z");
const turns = process.argv.slice(2);
if (!turns.length) {
  console.error('Usage: tsx scripts/assistant-transcript.ts "Construction" "Payroll"');
  process.exit(1);
}

async function main() {
  let record = newConversation("transcript-demo", "/", null, now);
  console.log(`[assistant] ${record.transcript[0].text}\n`);

  for (const turn of turns) {
    const result = await processVisitorTurn(record, turn, model, { now });
    record = result.record;
    console.log(`[visitor]   ${turn}`);
    console.log(`[assistant] ${result.reply}`);
    console.log(`            (state=${record.state} goal=${record.response_intelligence?.selected_goal} industry=${record.qualification.industry} workflow=${record.qualification.workflow})\n`);
  }

  console.log("─".repeat(70));
  console.log(buildLeadBrief(record));
}

void main();
