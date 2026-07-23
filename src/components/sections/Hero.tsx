"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button, Arrow } from "@/components/ui/Button";
import { NetworkBackground } from "@/components/visuals/NetworkBackground";

const line = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.12 * i },
  }),
};

export function Hero() {
  const reduce = useReducedMotion();
  const anim = (i: number) =>
    reduce ? {} : { variants: line, custom: i, initial: "hidden" as const, animate: "show" as const };

  return (
    <section className="relative overflow-hidden">
      {/* Background layers — the night sky, warm light emerging. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 grid-lines opacity-40" />
        <div className="absolute inset-0 opacity-90">
          <NetworkBackground className="h-full w-full" />
        </div>
        {/* A quiet warm aura where the headline sits — knowledge emerging. */}
        <div className="absolute left-[-10%] top-[42%] h-[42rem] w-[42rem] -translate-y-1/2 rounded-full aura-gold" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
      </div>

      <div className="container-lab relative py-28 sm:py-36 lg:py-44">
        <div className="max-w-3xl">
          <motion.p {...anim(0)} className="eyebrow mb-6">
            <span aria-hidden className="tick" />
            Regulus Automation Inc.
          </motion.p>

          <h1 className="text-display font-semibold">
            <motion.span {...anim(1)} className="block">
              Recovering Value.
            </motion.span>
            <motion.span {...anim(2)} className="block text-gradient">
              Building Intelligence.
            </motion.span>
          </h1>

          <motion.p {...anim(3)} className="mt-7 max-w-2xl text-lead text-ink-soft">
            Regulus builds intelligent workflow and operational systems for organizations in
            Toronto and across Ontario. We identify avoidable loss, automate repetitive work,
            connect fragmented information, and help leaders recover measurable value.
          </motion.p>

          <motion.div {...anim(4)} className="mt-10">
            <Button href="/contact?intent=free-automation-audit" size="lg" className="group" data-analytics-event="hero_audit_cta">
              Request an Automation Opportunity Audit <Arrow />
            </Button>
          </motion.div>

          <motion.dl {...anim(5)} className="mt-16 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-8">
            {[
              { k: "Fast", v: "Lead acknowledgement" },
              { k: "Visible", v: "Follow-up ownership" },
              { k: "Measured", v: "Before claims" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="text-2xl font-semibold text-ink">{s.k}</dt>
                <dd className="mt-1 text-sm text-dim">{s.v}</dd>
              </div>
            ))}
          </motion.dl>

          <motion.p {...anim(6)} className="mt-8 flex items-center gap-2.5 font-serif text-sm italic text-dim">
            <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
            Regulus — the brightest star in Leo, the heart of the lion. We take the
            name as a standard: clean light, no distortion.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
