import { buildMetadata } from "@/lib/seo";
import { commercialServices } from "@/lib/commercial-services";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { Button, Arrow } from "@/components/ui/Button";

export const metadata = buildMetadata({
  title: "Business Systems Automation Services",
  path: "/automation",
  description: "Practical lead-response and follow-up automation for Ontario service businesses.",
});

export default function AutomationPage() {
  return (
    <>
      <PageHero
        eyebrow="Regulus Business Systems"
        title="Turn more inquiries into accountable next actions."
        lead="Regulus helps growing businesses improve lead capture, recover delayed workflows, and build clearer operational control—starting with a free, evidence-first audit."
      />
      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          {commercialServices.map((service) => (
            <article key={service.slug} className="rounded-3xl border border-line bg-panel p-7 shadow-card">
              <h2 className="text-h3">{service.name}</h2>
              <p className="mt-3 text-ink-soft">{service.description}</p>
              <Button href={`/automation/${service.slug}`} variant="ghost" className="mt-5 group">
                View service <Arrow />
              </Button>
            </article>
          ))}
        </div>
        <div className="mt-12 rounded-3xl border border-gold/30 bg-panel p-8 text-center">
          <h2 className="text-h2">Start with the Free Time &amp; Workflow Recovery Audit.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink-soft">
            Tell us what is taking too much time, being missed, or waiting too long. The CAD $0 audit
            provides a prioritized recommendation; implementation and ongoing management remain optional.
          </p>
          <Button href="/free-audit" size="lg" className="mt-6" data-analytics-event="free_audit_cta">
            Request the Free Audit
          </Button>
        </div>
      </Section>
    </>
  );
}
