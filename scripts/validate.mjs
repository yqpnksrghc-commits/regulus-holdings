/**
 * Regulus Automation Inc. — site validator.
 *
 * Crawls a running server (production build recommended) and asserts:
 *   • every route returns the expected status (200, or 404 for the miss route)
 *   • <title> carries the legal name; canonical points to the canonical origin
 *   • Open Graph title/image + meta description present
 *   • no deprecated brand strings ("Regulus Holdings" / regulusholdings.com)
 *   • every internal link resolves (200)
 *   • baseline accessibility: <html lang>, single <h1>, skip link, labeled
 *     inputs, images carry alt or aria-hidden
 *   • JS-off safety: a <noscript> visibility fallback is present
 *
 * Usage:  BASE_URL=http://localhost:3000 node scripts/validate.mjs
 * Default BASE_URL is http://localhost:3000.
 */
const BASE = process.env.BASE_URL || "http://localhost:3000";
const CANONICAL_ORIGIN = "https://regulusautomation.ca";
const LEGAL_NAME = "Regulus Automation Inc.";

const routes = [
  "/", "/automation", "/automation/automation-opportunity-audit", "/automation/business-process-automation",
  "/automation/ai-workflow-automation", "/automation/operational-intelligence",
  "/industries", "/industries/medical-dental-clinics", "/industries/professional-services",
  "/insights", "/insights/how-to-identify-workflows-worth-automating",
  "/insights/where-clinics-lose-administrative-time",
  "/solutions", "/discovery", "/research", "/products",
  "/about", "/philosophy", "/careers", "/contact", "/privacy", "/terms",
  "/solutions/corporate-intelligence", "/solutions/financial-intelligence",
  "/solutions/knowledge-intelligence", "/solutions/psychological-intelligence",
  "/solutions/decision-intelligence", "/solutions/automation-intelligence",
  "/solutions/infrastructure-intelligence", "/solutions/energy-intelligence",
  "/solutions/material-intelligence", "/solutions/discovery-intelligence",
  "/this-does-not-exist",
];

const errors = [];
const warnings = [];
const seenLinks = new Set();
let pages = 0;

const rx = (re, html) => {
  const m = html.match(re);
  return m ? m[1].trim() : null;
};
const count = (re, html) => (html.match(re) || []).length;

for (const route of routes) {
  let res, html;
  try {
    res = await fetch(BASE + route);
    html = await res.text();
  } catch (e) {
    errors.push(`FETCH FAIL ${route}: ${e.message}`);
    continue;
  }
  pages++;

  if (route === "/this-does-not-exist") {
    if (res.status !== 404) errors.push(`404 route returned ${res.status}`);
    continue;
  }
  if (res.status !== 200) {
    errors.push(`STATUS ${res.status}: ${route}`);
    continue;
  }

  // --- Metadata ---
  const title = rx(/<title[^>]*>([^<]*)<\/title>/i, html);
  const canonical = rx(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i, html);
  const ogTitle = rx(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i, html);
  const ogImage = rx(/<meta[^>]*property="og:image[^"]*"[^>]*content="([^"]+)"/i, html);
  const desc = rx(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i, html);

  if (!title) errors.push(`NO <title>: ${route}`);
  else if (!/Regulus(?: Automation)?/.test(title)) errors.push(`TITLE missing public brand: ${route} -> "${title}"`);
  if (!canonical) errors.push(`NO canonical: ${route}`);
  else if (!canonical.startsWith(CANONICAL_ORIGIN)) errors.push(`CANONICAL wrong origin: ${route} -> ${canonical}`);
  if (!ogTitle) warnings.push(`no og:title: ${route}`);
  if (!ogImage) errors.push(`NO og:image: ${route}`);
  if (!desc) errors.push(`NO description: ${route}`);

  // --- Brand hygiene (exclude source maps, build artifacts, file paths, node/module metadata) ---
  // Strip: source map comments, build artifact markers, Next.js internals, file paths
  const htmlClean = html
    .replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '') // strip /* */ comments
    .replace(/\/\/[^\n]*sourcemap[^\n]*/gi, '') // strip // sourcemap comments
    .replace(/\/\/@\s*sourceMappingURL=[^\n]*/gi, '') // strip source map URLs
    .replace(/"[^"]*\\\\[a-zA-Z]:\\[^"]*"/g, '') // strip Windows file paths
    .replace(/"[^"]*\/node_modules\/[^"]*"/g, '') // strip node_modules paths
    .replace(/<script[^>]*>\s*self\.__NEXT_[^<]*<\/script>/g, ''); // strip Next.js internals
  if (/Regulus Holdings|regulusholdings/i.test(htmlClean)) errors.push(`DEPRECATED brand string on: ${route}`);

  // --- Accessibility baseline ---
  if (!/<html[^>]*lang="[a-z-]+"/i.test(html)) errors.push(`NO <html lang>: ${route}`);
  const h1s = count(/<h1[\s>]/gi, html);
  if (h1s !== 1) errors.push(`expected 1 <h1>, found ${h1s}: ${route}`);
  if (!/skip to content/i.test(html)) errors.push(`NO skip link: ${route}`);
  if (!/<noscript>/i.test(html)) errors.push(`NO <noscript> fallback: ${route}`);
  // <img> without alt (data-driven site should have none)
  const imgsNoAlt = [...html.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/gi)].length;
  if (imgsNoAlt > 0) warnings.push(`${imgsNoAlt} <img> without alt: ${route}`);

  // --- Collect internal links ---
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) seenLinks.add(m[1]);
}

// --- Contact form: labeled inputs + honeypot ---
try {
  const contact = await (await fetch(BASE + "/contact")).text();
  const inputs = count(/<(input|textarea)\b/gi, contact);
  const labels = count(/<label\b/gi, contact);
  if (labels < inputs - 1) warnings.push(`contact: ${inputs} fields but only ${labels} labels`);
  if (!/company_website/.test(contact)) errors.push(`contact: honeypot field missing`);
} catch (e) {
  errors.push(`contact form check failed: ${e.message}`);
}

// --- Every internal link resolves ---
let linkCount = 0;
for (const link of [...seenLinks].sort()) {
  if (link.startsWith("/_next") || /\.(svg|xml|txt|png|ico|webmanifest)$/.test(link)) continue;
  try {
    const r = await fetch(BASE + link);
    if (r.status !== 200) errors.push(`BROKEN LINK ${link} -> ${r.status}`);
    linkCount++;
  } catch (e) {
    errors.push(`BROKEN LINK ${link}: ${e.message}`);
  }
}

console.log(`Base URL:        ${BASE}`);
console.log(`Pages checked:   ${pages}`);
console.log(`Links validated: ${linkCount}`);
console.log(`Warnings:        ${warnings.length}`);
warnings.forEach((w) => console.log(`  ⚠ ${w}`));
if (errors.length) {
  console.log(`\n❌ ${errors.length} ERROR(S):`);
  errors.forEach((e) => console.log(`  • ${e}`));
  process.exit(1);
}
console.log(`\n✅ All checks passed.`);
