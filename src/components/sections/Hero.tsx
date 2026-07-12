"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button, Arrow } from "@/components/ui/Button";
import { NetworkBackground } from "@/components/visuals/NetworkBackground";

const line = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 * i },
  }),
};

export function Hero() {
  const reduce = useReducedMotion();
  const anim = (i: number) =>
    reduce ? {} : { variants: line, custom: i, initial: "hidden" as const, animate: "show" as const };

  return (
    <section className="relative overflow-hidden">
      {/* Background layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 grid-lines opacity-60" />
        <div className="absolute inset-0 opacity-[0.7]">
          <NetworkBackground className="h-full w-full" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
      </div>

      <div className="container-lab relative py-28 sm:py-36 lg:py-44">
        <div className="max-w-3xl">
          <motion.p {...anim(0)} className="eyebrow mb-6">
            <span aria-hidden className="h-px w-6 bg-accent" />
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
            Regulus develops intelligent systems that identify avoidable loss, recover value, and
            help organizations make better decisions.
          </motion.p>

          <motion.div {...anim(4)} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/solutions" size="lg" className="group">
              Explore Regulus <Arrow />
            </Button>
            <Button href="/contact" variant="secondary" size="lg">
              Contact us
            </Button>
          </motion.div>

          <motion.dl {...anim(5)} className="mt-16 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-8">
            {[
              { k: "10", v: "Intelligence domains" },
              { k: "5-step", v: "Recovery loop" },
              { k: "Evidence", v: "Over assumptions" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="text-2xl font-semibold text-ink">{s.k}</dt>
                <dd className="mt-1 text-sm text-dim">{s.v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  );
}
