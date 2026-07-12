import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { corePrinciples } from "@/lib/content";
import { Button, Arrow } from "@/components/ui/Button";
import { CTA } from "@/components/sections/CTA";

export const metadata = buildMetadata({
  title: "About",
  path: "/about",
  description: "Mission, doctrine, history, and the long-term vision behind Regulus Automation Inc.",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="A company built to last generations."
        lead={site.mission}
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading eyebrow="Mission" title="Recover what is trapped." align="left" />
          <Reveal className="max-w-prose space-y-5 text-ink-soft">
            <p>
              Regulus exists to identify avoidable loss, quantify it, and recover persistent value.
              Most value is not missing — it is trapped: in idle capital, in disconnected knowledge,
              in energy and materials discarded before their worth is spent.
            </p>
            <p>
              We build intelligent systems that make that loss visible, then recover it. Not through
              replacement and disruption, but through measurement, integration, and disciplined
              recovery. The result compounds: every cycle leaves the organization more capable than
              the last.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section tone="bg-2">
        <SectionHeading eyebrow="Doctrine" title="Three principles, held without exception." />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {corePrinciples.map((p, i) => (
            <Reveal key={p.anchor} delay={i * 0.08}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-panel p-7">
                <span className="font-mono text-sm text-accent">0{i + 1}</span>
                <h3 className="text-h3">{p.title}</h3>
                <p className="text-sm text-ink-soft">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="History" title="Where we started." />
            <Reveal className="mt-6 max-w-prose space-y-4 text-ink-soft">
              <p>
                Regulus began with a simple observation: organizations pay, every day, for value
                they already own but cannot see. The tools to measure it existed; the discipline to
                integrate them did not.
              </p>
              <p>
                We set out to build that discipline as a system — one that observes honestly,
                measures rigorously, and recovers what the evidence supports. Named for Regulus, the
                heart of the lion: clean power, no distortion.
              </p>
            </Reveal>
          </div>
          <div>
            <SectionHeading eyebrow="Long-term vision" title="Where we are going." />
            <Reveal className="mt-6 max-w-prose space-y-4 text-ink-soft">
              <p>
                We measure success in decades. The goal is a company whose systems recover more value
                than they consume — for the organizations we serve and for the world they operate in.
              </p>
              <p>
                Intelligence through integration, applied patiently, compounds. We intend to still be
                compounding it fifty years from now.
              </p>
              <Button href="/philosophy" variant="secondary" className="group mt-2">
                Read our philosophy <Arrow />
              </Button>
            </Reveal>
          </div>
        </div>
      </Section>
      <CTA />
    </>
  );
}
