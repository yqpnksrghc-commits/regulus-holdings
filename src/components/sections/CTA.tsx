import { Reveal } from "@/components/motion/Reveal";
import { Button, Arrow } from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-ink text-bg">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.18]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, rgb(var(--gold)) 0, transparent 42%), radial-gradient(circle at 82% 80%, rgb(var(--amber)) 0, transparent 45%)",
          }}
        />
      </div>
      <div className="container-lab relative py-24 sm:py-32">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-7 text-center">
          <p className="eyebrow justify-center text-bg/60">
            <span aria-hidden className="h-px w-6 bg-gold" />
            Let&apos;s begin
          </p>
          <h2 className="text-h1 text-bg">Let&apos;s build something worth keeping.</h2>
          <p className="max-w-xl text-lead text-bg/70">
            Tell us where value is leaking. We&apos;ll help you see it, quantify it, and recover it.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="/contact" size="lg" variant="secondary" className="group border-transparent bg-bg text-ink hover:bg-bg/90">
              Contact us <Arrow />
            </Button>
            <Button href="/solutions" size="lg" variant="ghost" className="text-bg hover:bg-bg/10">
              Explore solutions
            </Button>
          </div>
          <p className="mt-6 max-w-xl border-t border-bg/15 pt-8 font-serif text-base italic leading-relaxed text-bg/70">
            Wonder invites us in. Evidence guides us forward. Stewardship gives our
            work lasting purpose.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
