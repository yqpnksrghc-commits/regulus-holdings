import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { DiscoveryGraph } from "@/components/visuals/DiscoveryGraph";
import { Button, Arrow } from "@/components/ui/Button";

const searches = [
  "new technologies",
  "business opportunities",
  "recoverable waste",
  "automation opportunities",
  "new markets",
  "high-leverage ideas",
];

export function DiscoveryTeaser() {
  return (
    <Section id="discovery">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal className="rounded-3xl border border-line bg-panel/60 p-6 shadow-card sm:p-10">
          <DiscoveryGraph />
        </Reveal>
        <div>
          <SectionHeading
            eyebrow="Discovery Engine"
            title="A system that never stops looking."
            lead="Regulus continuously searches across heterogeneous sources, clustering weak signals into named, testable opportunities."
          />
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3">
            {searches.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-ink-soft">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald" />
                {s}
              </li>
            ))}
          </ul>
          <Button href="/discovery" variant="secondary" className="group mt-9">
            How discovery works <Arrow />
          </Button>
        </div>
      </div>
    </Section>
  );
}
