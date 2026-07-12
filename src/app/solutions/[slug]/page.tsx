import { notFound } from "next/navigation";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { intelligenceDomains, getDomain, evidenceMeta } from "@/lib/platform";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { EvidenceBadge } from "@/components/ui/Badge";
import { Reveal } from "@/components/motion/Reveal";
import { Button, Arrow } from "@/components/ui/Button";
import { CTA } from "@/components/sections/CTA";

/** Statically generate every domain page at build time. */
export function generateStaticParams() {
  return intelligenceDomains.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const domain = getDomain(slug);
  if (!domain) return buildMetadata({ title: "Solution" });
  return buildMetadata({
    title: domain.name,
    path: `/solutions/${domain.slug}`,
    description: domain.summary,
  });
}

export default async function DomainPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const domain = getDomain(slug);
  if (!domain) notFound();

  const idx = intelligenceDomains.findIndex((d) => d.slug === slug);
  const next = intelligenceDomains[(idx + 1) % intelligenceDomains.length];

  return (
    <>
      <PageHero eyebrow="Intelligence Domain" title={domain.name} lead={domain.summary}>
        <div className="mt-2 flex items-center gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-line-2 bg-panel text-accent">
            <Icon name={domain.icon} size={24} />
          </span>
          <EvidenceBadge evidence={domain.evidence} />
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.2fr_2fr]">
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <h2 className="text-h3">The loss we address</h2>
              <p className="mt-3 text-ink-soft">{domain.loss}</p>
              <div className="mt-8 rounded-2xl border border-line bg-panel p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-dim">Evidence class</p>
                <p className="mt-2 text-sm text-ink">{evidenceMeta[domain.evidence].label}</p>
                <p className="mt-1 text-sm text-dim">{evidenceMeta[domain.evidence].blurb}</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="text-h3">How we recover value</h2>
            <ol className="mt-6 flex flex-col gap-4">
              {domain.approach.map((a, i) => (
                <li key={i} className="flex gap-4 rounded-xl border border-line bg-panel p-5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-sm font-semibold text-accent">
                    {i + 1}
                  </span>
                  <p className="text-ink-soft">{a}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button href="/contact" className="group">
                Discuss this domain <Arrow />
              </Button>
              <Link href="/solutions" className="text-sm font-medium text-ink-soft hover:text-ink">
                ← All solutions
              </Link>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section tone="bg-2">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-dim">Next domain</p>
            <p className="text-h3">{next.name}</p>
          </div>
          <Button href={`/solutions/${next.slug}`} variant="secondary" className="group">
            Continue <Arrow />
          </Button>
        </Reveal>
      </Section>
      <CTA />
    </>
  );
}
