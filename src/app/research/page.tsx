import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Badge } from "@/components/ui/Badge";
import { CTA } from "@/components/sections/CTA";

export const metadata = buildMetadata({
  title: "Research",
  path: "/research",
  description:
    "Evidence first. We separate operational capability, established science, active research, and speculation — and never blur them.",
});

const evidenceClasses = [
  {
    tone: "neutral",
    label: "Operational",
    body: "Capability we have demonstrated and run in production contexts. When we say a product is operational, we can show it working.",
  },
  {
    tone: "emerald",
    label: "Established Science",
    body: "Claims grounded in the accepted scientific record, with sources. We build on these; we do not re-litigate them.",
  },
  {
    tone: "accent",
    label: "Regulus Research",
    body: "Our own active investigations. Promising evidence, honest uncertainty, and a clear path to either operational status or retirement.",
  },
  {
    tone: "gold",
    label: "Speculative",
    body: "Hypotheses and long-horizon directions. Interesting, unproven, and labeled as such — never presented as a shipping capability.",
  },
] as const;

export default function ResearchPage() {
  return (
    <>
      <PageHero
        eyebrow="Research"
        title="Evidence first. Research before certainty."
        lead="Confidence is a claim about evidence. So we make the evidence class explicit on everything we publish — and we never let repetition promote a hypothesis to a fact."
      />

      <Section>
        <SectionHeading eyebrow="Evidence classes" title="Four classes. Never blurred." />
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {evidenceClasses.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.06}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-panel p-7">
                <Badge tone={c.tone}>{c.label}</Badge>
                <p className="text-ink-soft">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="bg-2">
        <div className="grid gap-10 lg:grid-cols-2">
          <SectionHeading
            eyebrow="The discipline"
            title="A claim you cannot check is a hypothesis."
            lead="We hold ourselves to a simple rule: nothing advances to established fact without a reproducible basis. Caveats repair scope; they do not upgrade a verb."
          />
          <Reveal className="flex flex-col gap-4">
            {[
              "We state the evidence class before the conclusion.",
              "We separate what is measured from what is inferred.",
              "We publish what failed, not only what worked.",
              "We time claims to evidence, never to enthusiasm.",
            ].map((line) => (
              <div key={line} className="flex items-start gap-3 rounded-xl border border-line bg-panel p-4">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <p className="text-sm text-ink-soft">{line}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </Section>
      <CTA />
    </>
  );
}
