import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { intelligenceDomains } from "@/lib/platform";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/solutions", "/discovery", "/research", "/products", "/about", "/philosophy", "/careers", "/contact", "/privacy", "/terms"];
  const staticPages = routes.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
  const domainPages = intelligenceDomains.map((d) => ({
    url: `${site.url}/solutions/${d.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...staticPages, ...domainPages];
}
