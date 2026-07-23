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
    "Regulus helps Ontario service businesses recover missed leads and improve appointment follow-up with evidence-first automation.",
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
  { label: "Services", href: "/automation", description: "Lead response, appointments, and follow-up automation." },
  { label: "Industries", href: "/industries", description: "Workflow automation shaped around real operating contexts." },
  { label: "Insights", href: "/insights", description: "Practical guidance for evaluating automation opportunities." },
  { label: "Discovery", href: "/discovery", description: "How Regulus finds opportunity." },
  { label: "Research", href: "/research", description: "Evidence, clearly classified." },
  { label: "Products", href: "/products", description: "What is shipping and what is next." },
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
      { label: "Solutions", href: "/solutions" },
      { label: "Discovery Engine", href: "/discovery" },
      { label: "Products", href: "/products" },
      { label: "Research", href: "/research" },
      { label: "Industries", href: "/industries" },
      { label: "Insights", href: "/insights" },
    ],
  },
  {
    title: "Principles",
    items: [
      { label: "Evidence over assumptions", href: "/philosophy#evidence" },
      { label: "Recovery over replacement", href: "/philosophy#recovery" },
      { label: "Intelligence through integration", href: "/philosophy#integration" },
    ],
  },
];
