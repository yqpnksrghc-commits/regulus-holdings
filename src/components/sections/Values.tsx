import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealStagger, RevealItem } from "@/components/motion/Reveal";
import { values } from "@/lib/content";

export function Values() {
  return (
    <Section id="values">
      <SectionHeading
        eyebrow="Values"
        title="What we hold to, when it is hard."
        lead="Values are only real under pressure. These are the ones we refuse to trade."
      />
      <RevealStagger className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {values.map((v, i) => (
          <RevealItem key={v.name} className="bg-panel p-7">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-sm text-dim">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-lg font-semibold text-ink">{v.name}</h3>
            </div>
            <p className="mt-2 text-sm text-ink-soft">{v.body}</p>
          </RevealItem>
        ))}
      </RevealStagger>
    </Section>
  );
}
