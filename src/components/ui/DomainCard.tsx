import Link from "next/link";
import type { IntelligenceDomain } from "@/lib/platform";
import { Icon } from "./Icon";
import { EvidenceBadge } from "./Badge";
import { Arrow } from "./Button";

/**
 * Interactive card for one intelligence domain. Whole card is a link; the
 * hover state lifts and reveals the accent. Keyboard focus is handled by the
 * anchor, so it is reachable and operable without a mouse.
 */
export function DomainCard({ domain }: { domain: IntelligenceDomain }) {
  return (
    <Link
      href={`/solutions/${domain.slug}`}
      className="group relative flex h-full flex-col gap-4 rounded-2xl border border-line bg-panel p-6 shadow-subtle transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line-2 bg-bg-2/60 text-accent transition-colors group-hover:border-accent/40">
          <Icon name={domain.icon} size={22} />
        </span>
        <EvidenceBadge evidence={domain.evidence} />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-h3">{domain.name}</h3>
        <p className="text-sm leading-relaxed text-ink-soft">{domain.short}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-accent">
        Explore domain <Arrow />
      </span>
    </Link>
  );
}
