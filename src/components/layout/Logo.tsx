import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The Regulus mark: a recovery loop with a single bright node — "the heart of
 * the lion." Recovery (the ring) plus the fixed point value returns to.
 */
export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-accent", className)}
      aria-label="Regulus Automation Inc. — home"
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden className="shrink-0">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.6" className="text-ink" opacity="0.9" />
        <path
          d="M16 4a12 12 0 0 1 8.5 20.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="text-accent"
        />
        <circle cx="16" cy="16" r="3.4" fill="currentColor" className="text-gold" />
      </svg>
      {showWordmark && (
        <span className="text-[0.95rem] font-semibold tracking-tight text-ink">
          Regulus<span className="text-dim font-normal"> Automation</span>
        </span>
      )}
    </Link>
  );
}
