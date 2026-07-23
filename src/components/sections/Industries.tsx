import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealStagger, RevealItem } from "@/components/motion/Reveal";
import { industries } from "@/lib/content";
import Link from "next/link";

export function Industries() {
  return (
    <Section id="industries" tone="bg-2">
      <SectionHeading
        eyebrow="Industries"
        title="Wherever value is trapped, it can be recovered."
        lead="The discipline is universal; the units differ. These are the sectors where recovery pays first."
      />
      <RevealStagger className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {industries.map((ind) => (
          <RevealItem key={ind.name}>
            {"href" in ind && ind.href ? <Link href={ind.href} className="group flex h-full flex-col gap-1 rounded-xl border border-line bg-panel p-5 transition-colors hover:border-accent/40">
              <h3 className="text-sm font-semibold text-ink">{ind.name}</h3>
              <p className="text-xs text-dim">{ind.note}</p>
            </Link> : <div className="group flex h-full flex-col gap-1 rounded-xl border border-line bg-panel p-5 transition-colors hover:border-accent/40"><h3 className="text-sm font-semibold text-ink">{ind.name}</h3><p className="text-xs text-dim">{ind.note}</p></div>}
          </RevealItem>
        ))}
      </RevealStagger>
    </Section>
  );
}
