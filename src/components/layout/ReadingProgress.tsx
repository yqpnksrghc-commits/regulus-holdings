"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

/**
 * Slim scroll-progress indicator fixed under the header. Purely decorative,
 * so it is hidden from assistive tech and disabled under reduced motion.
 */
export function ReadingProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-16 z-40 h-0.5 origin-left bg-gradient-to-r from-accent to-emerald"
    />
  );
}
