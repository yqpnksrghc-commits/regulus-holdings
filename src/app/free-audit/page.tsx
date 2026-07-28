import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/sections/ContactForm";
import { Reveal } from "@/components/motion/Reveal";

const path = "/free-audit";

export const metadata = buildMetadata({
  title: "Free Time & Workflow Recovery Audit | Regulus",
  path,
  description: "Request a free bounded review of work taking too much time, being missed, or waiting too long, with a prioritized recommendation.",
});

export default function FreeAuditPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify([
        serviceJsonLd({name:"Free Time & Workflow Recovery Audit",description:"A CAD $0 bounded workflow review with a prioritized recommendation.",path,audience:"Small and medium-sized businesses"}),
        breadcrumbJsonLd([{name:"Home",path:"/"},{name:"Free Time & Workflow Recovery Audit",path}]),
      ])}} />
      <PageHero eyebrow="Regulus Business Systems" title="Free Time & Workflow Recovery Audit" lead="A bounded CAD $0 review of the current workflow and likely automation opportunities. The audit produces a prioritized recommendation; implementation is separate and optional." />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <h2 className="text-h3">What the audit examines</h2>
            <ul className="mt-5 space-y-3 text-ink-soft">
              <li>— Work taking too much time</li>
              <li>— Work being missed or waiting too long</li>
              <li>— Fragmented inquiry channels</li>
              <li>— Follow-up gaps</li>
              <li>— Practical automation opportunities</li>
              <li>— A prioritized recommendation</li>
            </ul>
            <div className="mt-8 rounded-2xl border border-line bg-panel p-5 text-sm text-ink-soft">
              <p><strong className="text-ink">Implementation:</strong> optional and typically CAD $2,500–$5,000, separately scoped.</p>
              <p className="mt-3"><strong className="text-ink">Ongoing management:</strong> optional and typically CAD $750–$1,500 per month.</p>
              <p className="mt-3">No implementation is included in the free audit, and no revenue, conversion, or operational result is guaranteed.</p>
            </div>
          </Reveal>
          <Reveal delay={0.05} className="rounded-2xl border border-line bg-panel p-6 sm:p-8">
            <h2 className="text-h3">Request the audit</h2>
            <p className="mb-7 mt-2 text-sm text-dim">A short description is enough to begin.</p>
            <ContactForm audit />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
