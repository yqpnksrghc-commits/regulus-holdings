import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealStagger, RevealItem } from "@/components/motion/Reveal";
import { DomainCard } from "@/components/ui/DomainCard";
import { intelligenceDomains } from "@/lib/platform";
import { Button, Arrow } from "@/components/ui/Button";

export function PlatformGrid() {
  return (
    <Section id="platform" tone="bg-2">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Our Intelligence Platform"
          title="Ten domains. One mission."
          lead="Each domain is a lens on the same discipline — find avoidable loss, quantify it, recover persistent value."
        />
        <Button href="/solutions" variant="ghost" className="group shrink-0">
          All solutions <Arrow />
        </Button>
      </div>
      <RevealStagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {intelligenceDomains.map((d) => (
          <RevealItem key={d.slug} className="h-full">
            <DomainCard domain={d} />
          </RevealItem>
        ))}
      </RevealStagger>
    </Section>
  );
}
