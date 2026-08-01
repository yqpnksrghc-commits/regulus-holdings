/**
 * Responsive audit for the Business Assistant.
 *
 * At every required width it opens the assistant, sends a message, and measures:
 *   - horizontal page overflow (must be exactly 0)
 *   - clipped message bubbles (scrollWidth > clientWidth)
 *   - Send button reachability (inside the viewport, >= 44px tap target)
 *   - composer overlap with the conversation log
 *   - console errors
 *
 * Usage: node scripts/responsive-audit.mjs http://localhost:8813
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] || "http://localhost:8813";
const WIDTHS = [320, 375, 390, 430, 768, 900, 1280, 1440];
const SHOT_DIR = "artifacts/responsive";
mkdirSync(SHOT_DIR, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const width of WIDTHS) {
  const context = await browser.newContext({
    viewport: { width, height: width < 500 ? 844 : 900 },
    deviceScaleFactor: 2,
    isMobile: width < 500,
    hasTouch: width < 500,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  // Netlify Blobs is unavailable outside the Netlify runtime, so the local API
  // returns 503. This audit measures LAYOUT, so the endpoint is stubbed with the
  // engine's real output (verbatim strings the deterministic engine produces and
  // that the unit tests assert). Conversation behaviour is covered by the 138
  // engine tests; end-to-end behaviour is verified against production.
  let turn = 0;
  await page.route("**/api/receptionist", async (route) => {
    const replies = [
      "I'm the Regulus Business Assistant — an automated assistant, not a human. I can explore where automation might help, and pass your details to the team. You can ask to speak with a person at any time.\n\nWhat takes too much time in your business — or too often gets missed?",
      "Construction businesses often lose time between initial enquiries, estimates, scheduling, field updates, change orders and invoicing.\n\nThose stages are where repeated manual work usually accumulates in that kind of business.\n\nWhich of those creates the most repeated work for you?",
      "Payroll and administration in construction often consumes time through collecting hours, chasing approvals, correcting records, re-entering data between systems and answering employee questions.\n\nThat is a general pattern, not a claim about your business — which is why the next question matters.\n\nWhich part creates the most work: collecting hours, approving them, processing payroll, or correcting errors afterwards?",
    ];
    const body = { conversation_id: "audit", state: "QUALIFYING", reply: replies[Math.min(turn, replies.length - 1)], done: false };
    turn += 1;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });

  await page.goto(BASE, { waitUntil: "networkidle" });

  const pageOverflowClosed = await page.evaluate(() =>
    Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));

  // Open the assistant and wait for the greeting to arrive from the API.
  await page.getByRole("button", { name: /Open the Regulus Business Assistant/i }).click();
  await page.getByRole("dialog", { name: /Regulus Business Assistant/i }).waitFor();
  await page.getByRole("log", { name: "Conversation" }).getByText(/automated assistant/i).waitFor({ timeout: 20000 });

  // Send a realistic message so bubbles of both roles are measured.
  const input = page.locator("#assistant-input");
  await input.fill("Construction");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page.getByText(/creates the most repeated work/i).waitFor({ timeout: 20000 });

  // A long unbroken token is the classic overflow trigger — test it explicitly.
  await input.fill("supercalifragilisticexpialidociousworkflowautomationproblemthatneverendsandkeepsgoing");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page.waitForTimeout(1500);

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const bubbles = [...document.querySelectorAll('[role="log"] p')];
    const clipped = bubbles.filter((b) => b.scrollWidth > b.clientWidth + 1).length;
    const overflowing = bubbles.filter((b) => b.getBoundingClientRect().right > window.innerWidth + 1).length;
    const send = [...document.querySelectorAll("button")].find((b) => /^Send|^Sending/.test(b.textContent || ""));
    const sendRect = send?.getBoundingClientRect();
    const log = document.querySelector('[role="log"]');
    const logRect = log?.getBoundingClientRect();
    const composer = send?.closest("div")?.parentElement?.getBoundingClientRect();
    return {
      pageOverflow: Math.max(0, doc.scrollWidth - doc.clientWidth),
      bubbleCount: bubbles.length,
      clippedBubbles: clipped,
      bubblesPastViewport: overflowing,
      sendVisible: Boolean(sendRect && sendRect.right <= window.innerWidth + 1 && sendRect.left >= -1 &&
        sendRect.bottom <= window.innerHeight + 1 && sendRect.top >= -1),
      sendHeight: sendRect ? Math.round(sendRect.height) : 0,
      sendWidth: sendRect ? Math.round(sendRect.width) : 0,
      // The composer must sit below the log, never on top of it.
      composerOverlapsLog: Boolean(logRect && composer && composer.top < logRect.bottom - 2),
    };
  });

  await page.screenshot({ path: `${SHOT_DIR}/assistant-${width}.png`, fullPage: false });

  results.push({ width, pageOverflowClosed, ...metrics, consoleErrors: consoleErrors.slice(0, 3) });
  await context.close();
}

await browser.close();

console.log(JSON.stringify(results, null, 2));

const failures = results.filter((r) =>
  r.pageOverflowClosed !== 0 || r.pageOverflow !== 0 || r.clippedBubbles !== 0 ||
  r.bubblesPastViewport !== 0 || !r.sendVisible || r.sendHeight < 44 ||
  r.composerOverlapsLog || r.consoleErrors.length > 0);

if (failures.length) {
  console.error(`\nFAILED at widths: ${failures.map((f) => f.width).join(", ")}`);
  process.exit(1);
}
console.log("\nAll widths pass: zero overflow, no clipping, Send reachable, composer clear, no console errors.");
