import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealStagger, RevealItem } from "@/components/motion/Reveal";
import { Badge } from "@/components/ui/Badge";
import { Arrow } from "@/components/ui/Button";
import { products } from "@/lib/content";

const statusTone = {
  Available: "emerald",
  "In Development": "accent",
  Research: "gold",
} as const;

export function ProductsTeaser() {
  return (
    <Section id="products">
      <SectionHeading
        eyebrow="Products"
        title="What we ship — and what we are building."
        lead="Every product carries an honest status. We never label a research direction as a shipping product."
      />
      <RevealStagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <RevealItem key={p.slug} className="h-full">
            <Link
              href={`/products#${p.slug}`}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-line bg-panel p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-h3">{p.name}</h3>
              </div>
              <Badge tone={statusTone[p.status]}>{p.status}</Badge>
              <p className="text-sm leading-relaxed text-ink-soft">{p.summary}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-accent">
                Details <Arrow />
              </span>
            </Link>
          </RevealItem>
        ))}
      </RevealStagger>
    </Section>
  );
}
