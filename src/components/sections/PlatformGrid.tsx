import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlatformConstellation } from "./PlatformConstellation";
import { Button, Arrow } from "@/components/ui/Button";

export function PlatformGrid() {
  return (
    <Section id="platform" tone="bg-2">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Our Intelligence Platform"
          title="Ten domains. One constellation."
          lead="Each domain is a lens on the same discipline — find avoidable loss, quantify it, recover persistent value. Trace one to see what it connects to."
        />
        <Button href="/solutions" variant="ghost" className="group shrink-0">
          All solutions <Arrow />
        </Button>
      </div>
      <PlatformConstellation />
    </Section>
  );
}
