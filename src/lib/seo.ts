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
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
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
    sameAs: site.social.map((s) => s.href),
  };
}
