import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealStagger, RevealItem } from "@/components/motion/Reveal";
import { lossVectors } from "@/lib/content";

export function Problem() {
  return (
    <Section id="problem" tone="bg-2">
      <SectionHeading
        eyebrow="The Problem"
        title="Organizations lose enormous value every day."
        lead="Loss rarely announces itself. It leaks quietly through seven channels — and most organizations never learn it happened."
      />
      <RevealStagger className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {lossVectors.map((v) => (
          <RevealItem key={v.label} className="group bg-panel p-6 transition-colors hover:bg-panel-2">
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-semibold text-ink">{v.label}</h3>
              <span aria-hidden className="text-dim transition-colors group-hover:text-accent">↘</span>
            </div>
            <p className="mt-2 text-sm text-dim">{v.note}</p>
          </RevealItem>
        ))}
        <RevealItem className="flex items-center bg-ink p-6 text-bg">
          <p className="text-sm font-medium">Most never know it happened. We make it visible.</p>
        </RevealItem>
      </RevealStagger>
      <Reveal className="mt-6">
        <p className="max-w-prose text-sm text-dim">
          Each channel is measurable. When you cannot see loss, you cannot recover it — so the first
          act of recovery is always measurement.
        </p>
      </Reveal>
    </Section>
  );
}
