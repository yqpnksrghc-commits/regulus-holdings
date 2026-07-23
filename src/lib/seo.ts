import type { Metadata } from "next";
import { site } from "./site";

export const deploymentIsIndexable = !(
  process.env.VERCEL_ENV === "preview" ||
  process.env.CONTEXT === "deploy-preview" ||
  process.env.CONTEXT === "branch-deploy"
);

/**
 * Build page-level metadata from a small set of inputs, inheriting sensible
 * Open Graph / Twitter defaults from the global site config.
 */
export function buildMetadata(input: {
  title: string;
  description?: string;
  path?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  index?: boolean;
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
      type: input.type ?? "website",
      siteName: site.name,
      title: fullTitle,
      description,
      url,
      locale: site.locale,
      images: [ogImage],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: ["/og.png"],
    },
    robots: { index: deploymentIsIndexable && (input.index ?? true), follow: deploymentIsIndexable && (input.index ?? true) },
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
    email: site.email,
    areaServed: [
      { "@type": "City", name: "Toronto" },
      { "@type": "AdministrativeArea", name: "Greater Toronto Area" },
      { "@type": "AdministrativeArea", name: "Ontario" },
    ],
    // Only advertise verified profiles; omit `sameAs` entirely when none exist.
    ...(site.social.length > 0 ? { sameAs: site.social.map((s) => s.href) } : {}),
  };
}

export function websiteJsonLd() {
  return { "@context":"https://schema.org","@type":"WebSite",name:site.name,url:site.url,
    description:site.description,inLanguage:"en-CA",publisher:{"@type":"Organization",name:site.name,url:site.url} };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return { "@context":"https://schema.org","@type":"BreadcrumbList",
    itemListElement:items.map((item,index)=>({"@type":"ListItem",position:index+1,name:item.name,item:`${site.url}${item.path}`})) };
}

export function serviceJsonLd(input:{name:string;description:string;path:string;audience?:string}) {
  return {"@context":"https://schema.org","@type":"Service",name:input.name,description:input.description,
    url:`${site.url}${input.path}`,provider:{"@type":"Organization",name:site.name,url:site.url},
    areaServed:["Toronto","Greater Toronto Area","Ontario"],serviceType:input.name,
    ...(input.audience?{audience:{"@type":"Audience",audienceType:input.audience}}:{})};
}

export function articleJsonLd(input:{headline:string;description:string;path:string;published:string;modified:string}) {
  return {"@context":"https://schema.org","@type":"Article",headline:input.headline,description:input.description,
    url:`${site.url}${input.path}`,datePublished:input.published,dateModified:input.modified,
    author:{"@type":"Organization",name:site.name,url:site.url},
    publisher:{"@type":"Organization",name:site.name,url:site.url},inLanguage:"en-CA"};
}
