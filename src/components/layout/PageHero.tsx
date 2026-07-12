import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

/**
 * Standard hero for interior pages: eyebrow, large title, lead paragraph, on a
 * hairline-grid backdrop. Keeps every sub-page visually consistent with home.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden border-b border-line", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-lines opacity-50" />
      <div className="container-lab relative py-20 sm:py-28">
        <Reveal className="flex max-w-3xl flex-col gap-5">
          <span className="eyebrow">
            <span aria-hidden className="h-px w-6 bg-accent" />
            {eyebrow}
          </span>
          <h1 className="text-h1">{title}</h1>
          {lead && <p className="max-w-2xl text-lead text-ink-soft">{lead}</p>}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
