import { buildMetadata } from "@/lib/seo";
import { intelligenceDomains } from "@/lib/platform";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { DomainCard } from "@/components/ui/DomainCard";
import { RevealStagger, RevealItem } from "@/components/motion/Reveal";
import { CTA } from "@/components/sections/CTA";

export const metadata = buildMetadata({
  title: "Solutions",
  path: "/solutions",
  description:
    "Ten domains of applied intelligence — each a lens on the same discipline: find avoidable loss, quantify it, recover persistent value.",
});

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Ten domains of applied intelligence."
        lead="One discipline, expressed ten ways. Each domain finds avoidable loss in its field, quantifies it, and recovers persistent value. Status is always shown honestly."
      />
      <Section>
        <RevealStagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {intelligenceDomains.map((d) => (
            <RevealItem key={d.slug} className="h-full">
              <DomainCard domain={d} />
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>
      <CTA />
    </>
  );
}
