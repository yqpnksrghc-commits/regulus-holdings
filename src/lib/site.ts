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
    "Regulus builds intelligent systems that identify avoidable loss, recover value, and help organizations make better decisions.",
  mission: "Identify avoidable loss, quantify it, and recover persistent value.",
  url: "https://regulusautomation.ca",
  locale: "en_CA",
  email: "contact@regulusautomation.ca",
  founded: 2024,
  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/regulus-automation" },
    { label: "X", href: "https://x.com/regulusauto" },
    { label: "GitHub", href: "https://github.com/regulus-automation" },
  ],
} as const;

export type NavItem = { label: string; href: string; description?: string };

/** Primary navigation — mirrored in the header and the footer sitemap. */
export const primaryNav: NavItem[] = [
  { label: "Solutions", href: "/solutions", description: "Ten domains of applied intelligence." },
  { label: "Discovery", href: "/discovery", description: "How Regulus finds opportunity." },
  { label: "Research", href: "/research", description: "Evidence, clearly classified." },
  { label: "Products", href: "/products", description: "What is shipping and what is next." },
  { label: "About", href: "/about", description: "Mission, doctrine, and long view." },
  { label: "Careers", href: "/careers", description: "Builders, scientists, teachers." },
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
