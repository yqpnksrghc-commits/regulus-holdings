import type { Metadata } from "next";
import { site } from "./site";

/**
 * Build page-level metadata from a small set of inputs, inheriting sensible
 * Open Graph / Twitter defaults from the global site config.
 */
export function buildMetadata(input: {
  title: string;
  description?: string;
  path?: string;
}): Metadata {
  const description = input.description ?? site.description;
  const url = input.path ? `${site.url}${input.path}` : site.url;
  // `title` stays bare so the root layout's template appends the suffix once.
  // Open Graph / Twitter need the fully-composed title (no template applies).
  const fullTitle = input.title === site.name ? site.name : `${input.title} — ${site.name}`;

  const ogImage = { url: "/og.png", width: 1200, height: 630, alt: `${site.name} — ${site.tagline}` };
  return {
    title: input.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: fullTitle,
      description,
      url,
      locale: site.locale,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/og.png"],
    },
  };
}

/** JSON-LD organization schema for the home page. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    legalName: site.name,
    alternateName: site.shortName,
    url: site.url,
    slogan: site.tagline,
    description: site.description,
    foundingDate: String(site.founded),
    email: site.email,
    // Only advertise verified profiles; omit `sameAs` entirely when none exist.
    ...(site.social.length > 0 ? { sameAs: site.social.map((s) => s.href) } : {}),
  };
}
