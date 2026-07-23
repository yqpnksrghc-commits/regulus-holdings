import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { deploymentIsIndexable } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: deploymentIsIndexable ? {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/ahura/", "/ahura-select-alpha/invitations"],
    } : { userAgent:"*", disallow:"/" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
