import { notFound } from "next/navigation";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo";
import { commercialServices } from "@/lib/commercial-services";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export function generateStaticParams() {
  return commercialServices.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = commercialServices.find((item) => item.slug === slug);
  return service
    ? buildMetadata({ title: service.name, path: `/automation/${slug}`, description: service.description })
    : {};
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = commercialServices.find((item) => item.slug === slug);
  if (!service) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify([
        serviceJsonLd({name:service.name,description:service.description,path:`/automation/${slug}`}),
        breadcrumbJsonLd([{name:"Home",path:"/"},{name:"Automation services",path:"/automation"},{name:service.name,path:`/automation/${slug}`}]),
      ])}} />
      <PageHero eyebrow="Automation service" title={service.name} lead={service.description} />
      {slug==="automation-opportunity-audit" && <Section tone="bg-2"><div className="grid gap-8 lg:grid-cols-2">
        <div><h2 className="text-h2">Who the audit is for</h2><p className="mt-4 text-ink-soft">Organizations experiencing repeated administrative work, delayed responses, missed follow-up, fragmented information, or limited visibility into where work waits.</p>
        <h2 className="mt-9 text-h2">What is needed to begin</h2><p className="mt-4 text-ink-soft">A responsible contact, a bounded workflow, permission to observe agreed business processes, and available non-sensitive records that can support the assessment. Unknowns remain explicit.</p></div>
        <div><h2 className="text-h2">Observe → measure → understand → recover → improve</h2><ol className="mt-5 space-y-3 text-ink-soft"><li><strong>Observe:</strong> document the workflow and its sources.</li><li><strong>Measure:</strong> establish available baselines and evidence gaps.</li><li><strong>Understand:</strong> separate friction, assumptions, and constraints.</li><li><strong>Recover:</strong> recommend the smallest useful intervention.</li><li><strong>Improve:</strong> define how a later implementation would be evaluated.</li></ol>
        <p className="mt-6 text-sm text-dim">The audit delivers an evidence map, observed friction, explicit unknowns, prioritized opportunities, and a review-ready brief. Implementation is separately scoped and is not implied by the diagnosis.</p></div>
      </div></Section>}
      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-3xl border border-line bg-panel p-8">
            <h2 className="text-h2">The visible friction</h2>
            <p className="mt-4 text-ink-soft">{service.problem}</p>
            <h2 className="mt-9 text-h2">The first useful outcome</h2>
            <p className="mt-4 text-ink-soft">{service.outcome}</p>
          </article>
          <article className="rounded-3xl border border-line bg-panel p-8">
            <h2 className="text-h2">What we measure</h2>
            <ul className="mt-5 space-y-3 text-ink-soft">
              {service.measures.map((measure) => <li key={measure}>• {measure}</li>)}
            </ul>
            <p className="mt-8 border-t border-line pt-6 text-sm text-dim">
              No result or ROI is promised before baseline evidence and scope are established.
              Simulated demonstrations are clearly identified as simulations.
            </p>
            <div className="mt-7 flex flex-wrap gap-4 text-sm">
              <a className="link-underline" href="/industries/medical-dental-clinics">Automation for clinics</a>
              <a className="link-underline" href="/industries/professional-services">Automation for professional services</a>
            </div>
            <Button href="/contact?intent=free-automation-audit" size="lg" className="mt-7" data-analytics-event="service_audit_cta">
              Request a Free Automation Audit
            </Button>
          </article>
        </div>
      </Section>
    </>
  );
}
