import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealStagger, RevealItem } from "@/components/motion/Reveal";
import { DiscoveryGraph } from "@/components/visuals/DiscoveryGraph";
import { discoveryModes } from "@/lib/content";
import { CTA } from "@/components/sections/CTA";

export const metadata = buildMetadata({
  title: "Discovery Engine",
  path: "/discovery",
  description:
    "A system that never stops looking — continuously searching for recoverable waste, new capability, and high-leverage opportunity.",
});

export default function DiscoveryPage() {
  return (
    <>
      <PageHero
        eyebrow="Discovery Engine"
        title="Opportunity expires unseen. So we never stop looking."
        lead="The Discovery Engine continuously scans heterogeneous sources, clusters weak signals into named opportunities, and routes the strongest to a pilot before anything scales."
      />

      <Section>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="rounded-3xl border border-line bg-panel/60 p-6 shadow-card sm:p-10">
            <DiscoveryGraph />
          </Reveal>
          <div>
            <SectionHeading
              eyebrow="Opportunity Graph"
              title="From scattered signal to a single named opportunity."
              lead="No single search angle finds everything. We run many in parallel — by need, by technology, by capability — then converge."
            />
          </div>
        </div>
      </Section>

      <Section tone="bg-2">
        <SectionHeading eyebrow="How discovery works" title="Six modes of search, running continuously." />
        <RevealStagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {discoveryModes.map((m, i) => (
            <RevealItem key={m.title} className="h-full">
              <div className="flex h-full flex-col gap-2 rounded-2xl border border-line bg-panel p-6">
                <span className="font-mono text-xs text-dim">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-h3">{m.title}</h3>
                <p className="text-sm text-ink-soft">{m.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
        <Reveal className="mt-10 max-w-prose text-sm text-dim">
          Compound opportunity detection is the quiet advantage: individually small openings often
          combine into a large one. A system that holds them all at once can see the sum.
        </Reveal>
      </Section>
      <CTA />
    </>
  );
}
