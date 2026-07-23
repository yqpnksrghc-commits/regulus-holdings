import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { intelligenceDomains } from "@/lib/platform";
import { commercialServices } from "@/lib/commercial-services";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/automation", "/industries", "/industries/medical-dental-clinics",
    "/industries/professional-services", "/insights", "/insights/how-to-identify-workflows-worth-automating",
    "/insights/where-clinics-lose-administrative-time", "/solutions", "/discovery", "/research",
    "/products", "/about", "/philosophy", "/careers", "/contact", "/privacy", "/terms"];
  const staticPages = routes.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : path.startsWith("/automation") || path.startsWith("/industries") ? 0.8 : 0.7,
    lastModified: new Date("2026-07-23"),
  }));
  const domainPages = intelligenceDomains.map((d) => ({
    url: `${site.url}/solutions/${d.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const servicePages = commercialServices.map((service) => ({
    url: `${site.url}/automation/${service.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  return [...staticPages, ...servicePages, ...domainPages];
}
