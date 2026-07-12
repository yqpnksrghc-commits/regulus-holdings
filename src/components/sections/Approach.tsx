import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { RecoveryLoop } from "@/components/visuals/RecoveryLoop";
import { approachLoop } from "@/lib/content";

export function Approach() {
  return (
    <Section id="approach">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Our Approach"
            title="A continuous loop, not a one-time audit."
            lead="Recovery is a discipline you run, not a project you finish. Each cycle starts ahead of the last."
          />
          <ol className="mt-10 flex flex-col gap-1">
            {approachLoop.map((s, i) => (
              <Reveal as="li" key={s.step} delay={i * 0.05}>
                <div className="flex gap-4 rounded-xl p-3 transition-colors hover:bg-panel-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-sm font-semibold text-accent">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-ink">{s.step}</h3>
                    <p className="text-sm text-ink-soft">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
        <Reveal delay={0.1} className="order-first lg:order-last">
          <div className="rounded-3xl border border-line bg-panel/60 p-8 shadow-card">
            <RecoveryLoop />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
