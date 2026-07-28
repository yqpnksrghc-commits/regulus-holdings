import Link from "next/link";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo";
import { businessSystemsOffers, engagementModel } from "@/lib/commercial-services";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/Reveal";
import { Button, Arrow } from "@/components/ui/Button";

const path = "/business-systems";

export const metadata = buildMetadata({
  title: "Regulus Business Systems | Practical Operational Systems",
  path,
  description: "Practical automation and operational systems that help growing businesses recover time, improve response, and maintain clearer operational control.",
});

export default function BusinessSystemsPage() {
  return (
    <div data-analytics-event="business_systems_page_visit">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify([
        serviceJsonLd({name:"Regulus Business Systems",description:"Practical automation and operational systems for growing businesses.",path,audience:"Small and medium-sized businesses"}),
        breadcrumbJsonLd([{name:"Home",path:"/"},{name:"Business Systems",path}]),
      ])}} />
      <PageHero
        eyebrow="A department of Regulus Automation"
        title="Regulus Business Systems"
        lead="Practical automation and operational systems for small and medium-sized businesses—built around recovered time, faster response, fewer missed opportunities, and clearer control."
      >
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <Button href="/free-audit" size="lg" className="group" data-analytics-event="free_audit_cta">Start the free audit <Arrow /></Button>
          <Button href="/business-systems/home-services" size="lg" variant="secondary" data-analytics-event="home_services_cta">For home-service businesses</Button>
        </div>
      </PageHero>
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <SectionHeading eyebrow="The relationship" title="Practical systems today. Broader intelligence tomorrow." />
          <Reveal className="space-y-5 text-ink-soft">
            <p>Regulus Business Systems is the current commercial implementation and revenue engine within Regulus Automation. It deploys practical systems for growing businesses while the larger institution develops operational intelligence, products, discovery, and research.</p>
            <p>Each scoped implementation can produce revenue, evidence, reusable modules, and operating knowledge. Those validated capabilities strengthen the wider Regulus intelligence platform; the department is a deployment layer, not the limit of Regulus&apos;s ambition.</p>
            <p className="font-medium text-ink">Regulus builds practical operational systems today while developing the broader intelligence infrastructure that organizations will depend on tomorrow.</p>
          </Reveal>
        </div>
      </Section>
      <Section tone="bg-2">
        <SectionHeading eyebrow="Problems we solve now" title="Organized by the work that needs to improve." lead="We lead with the operating outcome. Automation and AI are implementation mechanisms selected only when they fit the workflow." />
        <RevealStagger className="mt-12 grid gap-5 lg:grid-cols-3">
          {businessSystemsOffers.map((offer) => (
            <RevealItem key={offer.name} className="rounded-2xl border border-line bg-panel p-6">
              <h3 className="text-h3">{offer.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{offer.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-dim">{offer.items.map((item) => <li key={item}>— {item}</li>)}</ul>
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>
      <Section>
        <SectionHeading eyebrow="Current markets" title="Focused acquisition, room to expand." lead="The initial focus is home-service businesses: water treatment, HVAC, plumbing, roofing, and similar field-service operators. Professional services, clinics, and aesthetic businesses are expansion markets." />
        <Reveal className="mt-8"><Button href="/business-systems/home-services" variant="secondary" className="group" data-analytics-event="home_services_cta">Explore home services <Arrow /></Button></Reveal>
      </Section>
      <Section tone="panel">
        <SectionHeading eyebrow="Engagement" title="A clear, optional sequence." />
        <RevealStagger className="mt-10 grid gap-5 lg:grid-cols-3">
          {engagementModel.map((step, index) => (
            <RevealItem key={step.name} className="rounded-2xl border border-line bg-bg p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">Step {index + 1}</p>
              <h3 className="mt-3 text-xl font-semibold text-ink">{step.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.description}</p>
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading eyebrow="Working principles" title="Evidence first. Human control preserved." />
          <Reveal className="space-y-4 text-ink-soft">
            <p>We review the current workflow before recommending change, recover value from existing systems where practical, and keep accountable people in control of consequential decisions.</p>
            <p>Recommendations and pricing are scoped to the evidence available. We do not guarantee revenue, conversion, or operational results, and the free audit does not include implementation.</p>
            <div className="flex flex-wrap gap-4 pt-3">
              <Button href="/free-audit" className="group" data-analytics-event="free_audit_cta">Free Time &amp; Workflow Recovery Audit <Arrow /></Button>
              <Link href="/research" className="self-center text-sm font-medium text-ink-soft hover:text-ink">Explore the broader research vision →</Link>
            </div>
          </Reveal>
        </div>
      </Section>
    </div>
  );
}
