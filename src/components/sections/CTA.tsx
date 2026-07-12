import { Reveal } from "@/components/motion/Reveal";
import { Button, Arrow } from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-ink text-bg">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.15]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgb(var(--accent)) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgb(var(--emerald)) 0, transparent 40%)",
          }}
        />
      </div>
      <div className="container-lab relative py-24 sm:py-32">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-7 text-center">
          <p className="eyebrow text-bg/60">
            <span aria-hidden className="h-px w-6 bg-accent-soft" />
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
        </Reveal>
      </div>
    </section>
  );
}
