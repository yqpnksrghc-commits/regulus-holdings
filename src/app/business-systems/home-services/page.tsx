import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealItem, RevealStagger } from "@/components/motion/Reveal";
import { Button, Arrow } from "@/components/ui/Button";

const path = "/business-systems/home-services";

export const metadata = buildMetadata({
  title: "Home-Service Automation and Workflow Recovery | Regulus",
  path,
  description: "Lead capture and workflow recovery for water-treatment, HVAC, plumbing, roofing, and similar home-service businesses.",
});

const problems = [
  ["Inquiries arrive everywhere", "Calls, forms, email, and social messages need one visible path to a next action."],
  ["Field work interrupts response", "Calls missed while technicians are working and after-hours inquiries should not disappear."],
  ["Quotes wait too long", "Estimates and open opportunities need clear ownership and timely follow-up."],
  ["Coordination consumes the owner", "Scheduling, dispatch, reminders, reviews, and routine updates can keep owners tied to their phones."],
] as const;

const visibility = ["Leads awaiting response", "Jobs scheduled next", "Quotes needing follow-up", "Invoices overdue", "Work blocked or waiting", "Items requiring owner attention"] as const;

export default function HomeServicesPage() {
  return (
    <div data-analytics-event="home_services_page_visit">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify([
        serviceJsonLd({name:"Home-service automation and workflow recovery",description:"Lead capture and workflow recovery for owner-operated and field-service businesses.",path,audience:"Water-treatment, HVAC, plumbing, roofing, and similar home-service businesses"}),
        breadcrumbJsonLd([{name:"Home",path:"/"},{name:"Business Systems",path:"/business-systems"},{name:"Home Services",path}]),
      ])}} />
      <PageHero eyebrow="Regulus Business Systems · Home Services" title="Recover time and missed opportunities without losing control." lead="Practical lead capture and workflow recovery for water-treatment companies, HVAC contractors, plumbing businesses, roofing companies, and similar owner-operated field-service businesses.">
        <Button href="/free-audit" size="lg" className="group" data-analytics-event="free_audit_cta">Start the free audit <Arrow /></Button>
      </PageHero>
      <Section>
        <SectionHeading eyebrow="The operating reality" title="Important work should not wait for the owner to find it." />
        <RevealStagger className="mt-12 grid gap-5 sm:grid-cols-2">
          {problems.map(([title, body]) => <RevealItem key={title} className="rounded-2xl border border-line bg-panel p-6"><h3 className="text-xl font-semibold text-ink">{title}</h3><p className="mt-3 text-ink-soft">{body}</p></RevealItem>)}
        </RevealStagger>
      </Section>
      <Section tone="bg-2">
        <div className="grid gap-12 lg:grid-cols-2">
          <SectionHeading eyebrow="Lead Capture" title="Every inquiry receives a clear next action." lead="A scoped system can acknowledge inquiries, capture useful details, route the opportunity, and make follow-up visible—without pretending technology replaces judgment." />
          <SectionHeading eyebrow="Workflow Recovery" title="Reduce the time spent chasing routine work." lead="Quoting, scheduling, dispatch, customer reminders, review requests, forms, documents, and internal notifications are mapped before the right improvements are selected." />
        </div>
      </Section>
      <Section>
        <SectionHeading eyebrow="Owner Intelligence" title="See what needs attention in one practical view." lead="The goal is operational clarity: less searching across systems and a more reliable view of what is waiting." />
        <RevealStagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibility.map((item) => <RevealItem key={item} className="rounded-xl border border-line bg-panel p-5 text-sm font-medium text-ink">{item}</RevealItem>)}</RevealStagger>
      </Section>
      <Section tone="panel">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <SectionHeading eyebrow="Start with evidence" title="Free Time & Workflow Recovery Audit — CAD $0" lead="A bounded review identifies work taking too much time, being missed, or waiting too long; fragmented inquiry channels; follow-up gaps; and practical automation opportunities. You receive a prioritized recommendation. Implementation is not included." />
          <div className="lg:justify-self-end"><Button href="/free-audit" size="lg" className="group" data-analytics-event="free_audit_cta">Request the free audit <Arrow /></Button></div>
        </div>
      </Section>
    </div>
  );
}
