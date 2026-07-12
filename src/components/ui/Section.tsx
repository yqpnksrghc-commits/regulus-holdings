import { cn } from "@/lib/utils";

/**
 * Vertical rhythm wrapper for page sections. `tone` selects a background so
 * alternating sections separate cleanly without heavy borders.
 */
export function Section({
  children,
  id,
  tone = "bg",
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  id?: string;
  tone?: "bg" | "panel" | "bg-2";
  className?: string;
  containerClassName?: string;
}) {
  const toneClass = tone === "panel" ? "bg-panel" : tone === "bg-2" ? "bg-bg-2/50" : "bg-bg";
  return (
    <section id={id} className={cn("scroll-mt-20 py-20 sm:py-28", toneClass, className)}>
      <div className={cn("container-lab", containerClassName)}>{children}</div>
    </section>
  );
}
