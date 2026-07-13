"use client";

import Link from "next/link";
import type { IntelligenceDomain } from "@/lib/platform";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { EvidenceBadge } from "./Badge";
import { Arrow } from "./Button";

export type CardState = "idle" | "active" | "related" | "dim";

/**
 * Interactive card for one intelligence domain. Whole card is a link and is
 * fully keyboard-operable. When placed inside the constellation, an optional
 * `state` lets a hovered/focused domain gently illuminate its related domains
 * (`active` / `related`) and quiet the rest (`dim`). Motion is slow and gentle.
 */
export function DomainCard({
  domain,
  state = "idle",
  onActivate,
  onDeactivate,
}: {
  domain: IntelligenceDomain;
  state?: CardState;
  onActivate?: (slug: string) => void;
  onDeactivate?: () => void;
}) {
  return (
    <Link
      href={`/solutions/${domain.slug}`}
      onMouseEnter={() => onActivate?.(domain.slug)}
      onMouseLeave={() => onDeactivate?.()}
      onFocus={() => onActivate?.(domain.slug)}
      onBlur={() => onDeactivate?.()}
      className={cn(
        "group relative flex h-full flex-col gap-4 rounded-2xl border bg-panel p-6 shadow-subtle transition-all duration-500 ease-smooth hover:-translate-y-1 hover:border-gold/50 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        state === "idle" && "border-line",
        state === "active" && "-translate-y-1 border-gold/70 shadow-lift ring-1 ring-gold/40",
        state === "related" && "border-gold/40 ring-1 ring-gold/20",
        state === "dim" && "border-line opacity-50",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line-2 bg-bg-2/60 text-gold transition-colors group-hover:border-gold/40",
            (state === "active" || state === "related") && "border-gold/40",
          )}
        >
          <Icon name={domain.icon} size={22} />
        </span>
        <EvidenceBadge evidence={domain.evidence} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-h3">{domain.name}</h3>
        <p className="text-sm leading-relaxed text-ink-soft">{domain.short}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-gold">
        Explore domain <Arrow />
      </span>
    </Link>
  );
}
