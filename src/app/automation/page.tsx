import { buildMetadata } from "@/lib/seo";
import { commercialServices } from "@/lib/commercial-services";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { Button, Arrow } from "@/components/ui/Button";

export const metadata = buildMetadata({
  title: "Automation Services",
  path: "/automation",
  description: "Practical lead-response and follow-up automation for Ontario service businesses.",
});

export default function AutomationPage() {
  return (
    <>
      <PageHero
        eyebrow="Ontario automation services"
        title="Turn more inquiries into accountable next actions."
        lead="Regulus helps service businesses measure and improve lead response, qualification, appointment requests, and follow-up—starting with a paid, evidence-first audit."
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
          <h2 className="text-h2">Start with a Free Automation Audit request.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink-soft">
            Tell us where an inquiry can stall. We will review the fit and, if useful, propose a
            scoped CAD $500 paid audit before any implementation.
          </p>
          <Button href="/contact?intent=free-automation-audit" size="lg" className="mt-6" data-analytics-event="audit_cta">
            Request a Free Automation Audit
          </Button>
        </div>
      </Section>
    </>
  );
}
