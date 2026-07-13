import { Section } from "@/components/ui/Section";
import { Reveal, RevealStagger, RevealItem } from "@/components/motion/Reveal";

const principles = [
  {
    title: "Curiosity begins exploration.",
    body: "We are drawn to what we don't yet understand. That pull is where every worthwhile investigation starts.",
  },
  {
    title: "Evidence earns belief.",
    body: "Wonder opens the question; only evidence closes it. We hold our conclusions to what can be shown.",
  },
  {
    title: "Stewardship creates lasting value.",
    body: "What we recover, we preserve. Work done with care compounds — for the people we serve and those who follow.",
  },
];

export function Ethos() {
  return (
    <Section id="ethos">
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full aura-gold opacity-70" />
        <Reveal className="relative mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">
            <span aria-hidden className="tick" />
            Why we build
          </span>
          <p className="mt-6 font-serif text-h3 font-normal italic text-ink">
            The feeling of standing beneath a clear night sky. Of following a proof
            to the line where it becomes obvious. Of understanding something hard
            for the first time.
          </p>
          <p className="mt-6 text-lead text-ink-soft">
            We are not selling mystery. We are acknowledging humanity&apos;s
            attraction to it — and showing that disciplined curiosity is how we
            explore it.
          </p>
        </Reveal>
      </div>

      <RevealStagger className="relative mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
        {principles.map((p) => (
          <RevealItem key={p.title} className="bg-panel p-7">
            <span aria-hidden className="tick mb-4 block" />
            <h3 className="text-lg font-semibold text-ink">{p.title}</h3>
            <p className="mt-2 text-sm text-ink-soft">{p.body}</p>
          </RevealItem>
        ))}
      </RevealStagger>
    </Section>
  );
}
