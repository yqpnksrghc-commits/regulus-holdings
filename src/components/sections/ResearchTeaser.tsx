import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Badge } from "@/components/ui/Badge";
import { Button, Arrow } from "@/components/ui/Button";

const classes = [
  { tone: "neutral", label: "Operational", body: "Demonstrated capability, running in production." },
  { tone: "emerald", label: "Established Science", body: "Grounded in the accepted scientific record." },
  { tone: "accent", label: "Regulus Research", body: "Active investigation; promising, not yet proven." },
  { tone: "gold", label: "Speculative", body: "A hypothesis or direction, labeled as such." },
] as const;

export function ResearchTeaser() {
  return (
    <Section id="research" tone="bg-2">
      <SectionHeading
        eyebrow="Research"
        title="Evidence first. Certainty is earned."
        lead="We separate what is known from what is assumed — always, and in the open. A claim you cannot check is a hypothesis, and we mark it as one."
      />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {classes.map((c, i) => (
          <Reveal key={c.label} delay={i * 0.06}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-panel p-6">
              <Badge tone={c.tone}>{c.label}</Badge>
              <p className="text-sm text-ink-soft">{c.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-8">
        <Button href="/research" variant="ghost" className="group">
          Read our research philosophy <Arrow />
        </Button>
      </Reveal>
    </Section>
  );
}
