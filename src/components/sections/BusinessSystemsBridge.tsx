import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Button, Arrow } from "@/components/ui/Button";

export function BusinessSystemsBridge() {
  return (
    <Section tone="panel">
      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <SectionHeading
          eyebrow="A department of Regulus Automation"
          title="Regulus Business Systems"
          lead="Practical automation and operational systems for growing businesses."
        />
        <Reveal delay={0.05} className="flex flex-col gap-6">
          <p className="text-ink-soft">
            Regulus Business Systems helps small and medium-sized businesses recover time,
            opportunity, and operational capacity. Its implementations generate evidence and
            reusable capabilities that strengthen the wider Regulus intelligence platform.
          </p>
          <Button href="/business-systems" className="group self-start" data-analytics-event="business_systems_cta">
            Explore Business Systems <Arrow />
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}
