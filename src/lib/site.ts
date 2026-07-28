/**
 * Global site configuration — canonical metadata, navigation, and contact.
 * Imported by layout, header, footer, and SEO helpers so there is one source
 * of truth for anything that appears in more than one place.
 */
export const site = {
  /** Registered legal entity — used in footer, legal, metadata, structured data. */
  name: "Regulus Automation Inc.",
  /** Public short brand — used where a shorter display name is appropriate. */
  shortName: "Regulus",
  /** Wordmark display (header logo). */
  displayName: "Regulus Automation",
  tagline: "Recovering Value. Building Intelligence.",
  description:
    "Regulus builds operational intelligence and practical systems that identify avoidable loss, recover value, and strengthen organizational capability.",
  mission: "Identify avoidable loss, quantify it, and recover persistent value.",
  url: "https://regulusautomation.ca",
  locale: "en_CA",
  email: "info@regulusautomation.ca",
  // Social links are intentionally empty: display only verified, explicitly
  // supplied URLs. Do NOT add placeholder/inferred handles.
  social: [] as { label: string; href: string }[],
} as const;

export type NavItem = { label: string; href: string; description?: string };

/** Primary navigation — mirrored in the header and the footer sitemap. */
export const primaryNav: NavItem[] = [
  { label: "Business Systems", href: "/business-systems", description: "Practical systems for growing businesses." },
  { label: "Solutions", href: "/solutions", description: "Ten domains of applied intelligence." },
  { label: "Products", href: "/products", description: "What is shipping and what is next." },
  { label: "Discovery", href: "/discovery", description: "How Regulus finds opportunity." },
  { label: "Research", href: "/research", description: "Evidence, clearly classified." },
  { label: "About", href: "/about", description: "Mission, doctrine, and long view." },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Philosophy", href: "/philosophy" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "Business Systems", href: "/business-systems" },
      { label: "Home Services", href: "/business-systems/home-services" },
      { label: "Automation Services", href: "/automation" },
      { label: "Solutions", href: "/solutions" },
      { label: "Discovery Engine", href: "/discovery" },
      { label: "Products", href: "/products" },
      { label: "Research", href: "/research" },
      { label: "Industries", href: "/industries" },
      { label: "Insights", href: "/insights" },
    ],
  },
  {
    title: "Engage",
    items: [
      { label: "Free Time & Workflow Recovery Audit", href: "/free-audit" },
      { label: "Industries", href: "/industries" },
      { label: "Insights", href: "/insights" },
      { label: "Evidence over assumptions", href: "/philosophy#evidence" },
    ],
  },
];
