"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Opportunity graph: heterogeneous sources (left) resolve through clustering
 * nodes into a single named opportunity (right). Edges draw in sequence to
 * suggest continuous search; a static graph is shown under reduced motion.
 */
const sources = [
  { x: 40, y: 40 },
  { x: 30, y: 110 },
  { x: 46, y: 180 },
  { x: 30, y: 250 },
  { x: 44, y: 320 },
];
const clusters = [
  { x: 200, y: 90 },
  { x: 190, y: 190 },
  { x: 205, y: 290 },
];
const hub = { x: 360, y: 190 };

function edge(a: { x: number; y: number }, b: { x: number; y: number }) {
  return `M${a.x},${a.y} C${(a.x + b.x) / 2},${a.y} ${(a.x + b.x) / 2},${b.y} ${b.x},${b.y}`;
}

export function DiscoveryGraph() {
  const reduce = useReducedMotion();
  const edges: [{ x: number; y: number }, { x: number; y: number }][] = [];
  sources.forEach((s) => clusters.forEach((c) => edges.push([s, c])));
  clusters.forEach((c) => edges.push([c, hub]));

  return (
    <svg viewBox="0 0 420 380" className="h-full w-full" role="img" aria-label="Discovery graph: many sources cluster into a single named opportunity.">
      {edges.map(([a, b], i) => (
        <motion.path
          key={i}
          d={edge(a, b)}
          fill="none"
          stroke="rgb(var(--accent))"
          strokeWidth={1}
          strokeOpacity={0.35}
          initial={reduce ? undefined : { pathLength: 0, opacity: 0 }}
          whileInView={reduce ? undefined : { pathLength: 1, opacity: 0.35 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: (i % 6) * 0.12, ease: "easeInOut" }}
        />
      ))}

      {sources.map((s, i) => (
        <motion.circle
          key={`s${i}`}
          cx={s.x}
          cy={s.y}
          r={4}
          fill="rgb(var(--dim))"
          animate={reduce ? undefined : { opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
      {clusters.map((cl, i) => (
        <circle key={`c${i}`} cx={cl.x} cy={cl.y} r={7} fill="rgb(var(--panel))" stroke="rgb(var(--accent))" strokeWidth={1.5} />
      ))}

      <motion.circle
        cx={hub.x}
        cy={hub.y}
        r={16}
        fill="rgb(var(--emerald))"
        fillOpacity={0.14}
        stroke="rgb(var(--emerald))"
        strokeWidth={1.5}
        animate={reduce ? undefined : { r: [15, 18, 15] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx={hub.x} cy={hub.y} r={5} fill="rgb(var(--emerald))" />
      <text x={hub.x} y={hub.y + 34} textAnchor="middle" className="fill-dim" style={{ fontSize: 10 }}>
        Named opportunity
      </text>
      <text x={40} y={360} textAnchor="middle" className="fill-dim" style={{ fontSize: 10 }}>
        Sources
      </text>
    </svg>
  );
}
