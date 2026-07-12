import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { corePrinciples, values } from "@/lib/content";
import { CTA } from "@/components/sections/CTA";

export const metadata = buildMetadata({
  title: "Philosophy",
  path: "/philosophy",
  description:
    "The doctrine behind Regulus: evidence classes, the recovery principle, stewardship, and long-term thinking.",
});

export default function PhilosophyPage() {
  return (
    <>
      <PageHero
        eyebrow="Philosophy"
        title="How we think, made explicit."
        lead="A company endures on its discipline, not its slogans. Here is ours, in the open."
      />

      <Section>
        <div className="mx-auto flex max-w-3xl flex-col gap-16">
          {corePrinciples.map((p) => (
            <Reveal key={p.anchor}>
              <article id={p.anchor} className="scroll-mt-24">
                <h2 className="text-h2">{p.title}</h2>
                <p className="mt-4 text-lead text-ink-soft">{p.body}</p>
              </article>
            </Reveal>
          ))}

          <Reveal>
            <article id="stewardship" className="scroll-mt-24 border-t border-line pt-16">
              <span className="eyebrow">Stewardship</span>
              <h2 className="mt-4 text-h2">We treat resources — and trust — as things to preserve.</h2>
              <p className="mt-4 text-lead text-ink-soft">
                Recovery and generosity are one policy. Value that is recovered and shared does not
                diminish; it compounds. We steward what we are given — capital, knowledge, attention,
                and the confidence of the people we work with — as if it must last decades. It must.
              </p>
            </article>
          </Reveal>

          <Reveal>
            <article id="long-term" className="scroll-mt-24 border-t border-line pt-16">
              <span className="eyebrow">Long-term thinking</span>
              <h2 className="mt-4 text-h2">We build for the decade, not the demo.</h2>
              <p className="mt-4 text-lead text-ink-soft">
                Short-term optimization is how value gets trapped in the first place. We make
                decisions we would be glad to defend in ten years, and we let evidence — not
                enthusiasm — set the pace.
              </p>
            </article>
          </Reveal>
        </div>
      </Section>

      <Section tone="bg-2">
        <SectionHeading eyebrow="Values" title="What we refuse to trade." />
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {values.map((v, i) => (
            <div key={v.name} className="bg-panel p-7">
              <span className="font-mono text-sm text-dim">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-1 text-lg font-semibold text-ink">{v.name}</h3>
              <p className="mt-2 text-sm text-ink-soft">{v.body}</p>
            </div>
          ))}
        </div>
      </Section>
      <CTA />
    </>
  );
}
