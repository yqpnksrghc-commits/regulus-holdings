import { cn } from "@/lib/utils";
import { evidenceMeta, type EvidenceClass } from "@/lib/platform";

const toneClasses: Record<string, string> = {
  emerald: "text-emerald border-emerald/30 bg-emerald/10",
  accent: "text-accent border-accent/30 bg-accent/10",
  gold: "text-gold border-gold/40 bg-gold/10",
  neutral: "text-dim border-line-2 bg-panel-2",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneClasses;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Evidence-class badge — the honesty primitive used across the site. */
export function EvidenceBadge({ evidence, className }: { evidence: EvidenceClass; className?: string }) {
  const meta = evidenceMeta[evidence];
  return (
    <Badge tone={meta.tone as keyof typeof toneClasses} className={className}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </Badge>
  );
}
