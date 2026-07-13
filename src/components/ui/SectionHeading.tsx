import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Consistent section header: small eyebrow, large title, optional lead.
 * Centered or left-aligned. Wrapped in Reveal for a uniform entrance.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className="eyebrow">
          <span aria-hidden className="tick" />
          {eyebrow}
        </span>
      )}
      <h2 className="text-h2 max-w-2xl">{title}</h2>
      {lead && (
        <p className={cn("text-lead text-ink-soft", align === "center" ? "max-w-2xl" : "max-w-prose")}>
          {lead}
        </p>
      )}
    </Reveal>
  );
}
