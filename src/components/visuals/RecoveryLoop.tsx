"use client";

import { motion, useReducedMotion } from "framer-motion";
import { approachLoop } from "@/lib/content";

/**
 * The Approach as a continuous loop. Five stations on a ring; a bright arc
 * travels the ring to signal that the cycle never stops. Under reduced motion
 * the arc is a static highlight.
 */
export function RecoveryLoop() {
  const reduce = useReducedMotion();
  const size = 320;
  const c = size / 2;
  const r = 118;
  const n = approachLoop.length;

  const points = approachLoop.map((s, i) => {
    // Start at top (-90°) and go clockwise.
    const angle = (-90 + (360 / n) * i) * (Math.PI / 180);
    return { ...s, x: c + r * Math.cos(angle), y: c + r * Math.sin(angle) };
  });

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" role="img" aria-label="Continuous recovery loop: Observe, Measure, Understand, Recover, Improve.">
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgb(var(--line-2))" strokeWidth={1.5} />

        {!reduce && (
          <motion.circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="rgb(var(--accent))"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * r * 0.16} ${2 * Math.PI * r}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 14, ease: "linear", repeat: Infinity }}
            style={{ transformOrigin: `${c}px ${c}px` }}
          />
        )}

        {points.map((p, i) => (
          <g key={p.step}>
            <line x1={c} y1={c} x2={p.x} y2={p.y} stroke="rgb(var(--line))" strokeWidth={1} strokeDasharray="2 4" />
            <circle cx={p.x} cy={p.y} r={7} fill="rgb(var(--panel))" stroke="rgb(var(--accent))" strokeWidth={1.5} />
            <text
              x={p.x}
              y={p.y - 14}
              textAnchor="middle"
              className="fill-ink text-[11px] font-semibold"
              style={{ fontSize: 11 }}
            >
              {p.step}
            </text>
            <text x={p.x} y={p.y + 4} textAnchor="middle" className="fill-dim" style={{ fontSize: 9 }}>
              {i + 1}
            </text>
          </g>
        ))}

        {/* Center — the fixed point value returns to. */}
        <circle cx={c} cy={c} r={26} fill="rgb(var(--panel-2))" stroke="rgb(var(--line-2))" />
        <circle cx={c} cy={c} r={5} fill="rgb(var(--gold))" />
      </svg>
    </div>
  );
}
