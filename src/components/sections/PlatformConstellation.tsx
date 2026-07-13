"use client";

import { useState } from "react";
import { intelligenceDomains, relatedSlugs } from "@/lib/platform";
import { DomainCard, type CardState } from "@/components/ui/DomainCard";
import { RevealStagger, RevealItem } from "@/components/motion/Reveal";

/**
 * The platform as a constellation. Hovering or focusing one domain illuminates
 * the domains it connects to and quietly dims the rest — connection revealing
 * itself. Pointer and keyboard both drive it; touch simply shows the calm
 * resting state. Illumination is opacity/border only, so it stays gentle under
 * reduced motion.
 */
export function PlatformConstellation() {
  const [active, setActive] = useState<string | null>(null);
  const related = active ? relatedSlugs(active) : null;

  const stateFor = (slug: string): CardState => {
    if (!active) return "idle";
    if (slug === active) return "active";
    if (related?.has(slug)) return "related";
    return "dim";
  };

  return (
    <RevealStagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {intelligenceDomains.map((d) => (
        <RevealItem key={d.slug} className="h-full">
          <DomainCard
            domain={d}
            state={stateFor(d.slug)}
            onActivate={setActive}
            onDeactivate={() => setActive(null)}
          />
        </RevealItem>
      ))}
    </RevealStagger>
  );
}
