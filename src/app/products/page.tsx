import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Badge, EvidenceBadge } from "@/components/ui/Badge";
import { products, roadmap } from "@/lib/content";
import { CTA } from "@/components/sections/CTA";

export const metadata = buildMetadata({
  title: "Products",
  path: "/products",
  description: "What Regulus ships today, what is in development, and the long-term research roadmap.",
});

const statusTone = { Available: "emerald", "In Development": "accent", Research: "gold" } as const;

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Built to endure. Labeled to be trusted."
        lead="Every product carries an honest status and evidence class. A research direction is never dressed up as a shipping product."
      />

      <Section>
        <div className="flex flex-col gap-5">
          {products.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.04}>
              <article
                id={p.slug}
                className="grid scroll-mt-24 gap-4 rounded-2xl border border-line bg-panel p-7 sm:grid-cols-[2fr_3fr] sm:items-center"
              >
                <div className="flex flex-col gap-3">
                  <h2 className="text-h3">{p.name}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={statusTone[p.status]}>{p.status}</Badge>
                    <EvidenceBadge evidence={p.evidence} />
                  </div>
                </div>
                <p className="text-ink-soft">{p.summary}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="bg-2">
        <SectionHeading
          eyebrow="Roadmap"
          title="Now, next, and the long research horizon."
          lead="We are explicit about the horizon. Long-term research areas are development directions, not shipping products."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {roadmap.map((col, i) => (
            <Reveal key={col.horizon} delay={i * 0.08}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-panel p-7">
                <div className="flex items-center gap-2">
                  <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-dim">{col.horizon}</h3>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {col.items.map((item) => (
                    <li key={item} className="text-ink-soft">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
      <CTA />
    </>
  );
}
