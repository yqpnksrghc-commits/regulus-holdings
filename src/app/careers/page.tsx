import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealStagger, RevealItem } from "@/components/motion/Reveal";
import { Button, Arrow } from "@/components/ui/Button";

export const metadata = buildMetadata({
  title: "Careers",
  path: "/careers",
  description:
    "Regulus is built by builders, scientists, engineers, designers, and teachers who value evidence and the long view.",
});

const people = [
  { role: "Builders", body: "People who ship, measure, and improve — and who finish what they start." },
  { role: "Scientists", body: "People who separate what is known from what is assumed, on instinct." },
  { role: "Engineers", body: "People who make systems that endure, not demos that impress." },
  { role: "Designers", body: "People who earn trust through clarity and restraint." },
  { role: "Teachers", body: "People who compound knowledge by making others more capable." },
];

const culture = [
  "Evidence over hierarchy — the strongest argument wins.",
  "Recovery over replacement — improve what exists before rebuilding.",
  "Long-term thinking — we optimize for the decade.",
  "Stewardship — we treat trust and resources as things to preserve.",
];

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build something worth keeping."
        lead="We are a small group of builders, scientists, engineers, designers, and teachers. We hire for judgment, discipline, and the long view."
      />

      <Section>
        <SectionHeading eyebrow="Who we are" title="The people who thrive here." />
        <RevealStagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <RevealItem key={p.role} className="h-full">
              <div className="flex h-full flex-col gap-2 rounded-2xl border border-line bg-panel p-7">
                <h3 className="text-h3">{p.role}</h3>
                <p className="text-sm text-ink-soft">{p.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>

      <Section tone="bg-2">
        <div className="grid gap-10 lg:grid-cols-2">
          <SectionHeading eyebrow="Culture" title="How we work together." />
          <Reveal className="flex flex-col gap-4">
            {culture.map((c) => (
              <div key={c} className="flex items-start gap-3 rounded-xl border border-line bg-panel p-4">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald" />
                <p className="text-sm text-ink-soft">{c}</p>
              </div>
            ))}
          </Reveal>
        </div>
        <Reveal className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-line bg-panel p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-h3">No open roles listed — yet.</h3>
            <p className="mt-1 text-sm text-ink-soft">
              If you recognize yourself above, introduce yourself. We keep in touch with exceptional people.
            </p>
          </div>
          <Button href="/contact" className="group shrink-0">
            Introduce yourself <Arrow />
          </Button>
        </Reveal>
      </Section>
    </>
  );
}
