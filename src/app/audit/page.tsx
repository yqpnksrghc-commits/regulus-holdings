import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/sections/ContactForm";
import { Reveal } from "@/components/motion/Reveal";

const path = "/audit";

export const metadata = buildMetadata({
  title: "Automation Opportunity Audit — CAD $500 | Regulus",
  path,
  description:
    "A CAD $500 prepaid bounded review of work taking too much time, being missed, or waiting too long, with a prioritized recommendation.",
});

export default function AuditPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify([
        serviceJsonLd({
          name: "Automation Opportunity Audit",
          description: "A CAD $500 prepaid bounded workflow review with a prioritized recommendation.",
          path,
          audience: "Small and medium-sized businesses",
          price: "500",
          priceCurrency: "CAD",
        }),
        breadcrumbJsonLd([{name:"Home",path:"/"},{name:"Automation Opportunity Audit",path}]),
      ])}} />
      <PageHero
        eyebrow="Regulus Business Systems"
        title="Automation Opportunity Audit"
        lead="A bounded CAD $500 review of the current workflow and likely automation opportunities, paid in advance. The audit produces a prioritized recommendation; implementation is separate and optional."
      />
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
              <p><strong className="text-ink">Audit:</strong> CAD $500, prepaid before the review begins.</p>
              <p className="mt-3"><strong className="text-ink">How payment works:</strong> no payment is taken on this
                website. A Regulus team member confirms the scope with you and sends a secure payment link. The audit is
                scheduled once payment is complete.</p>
              <p className="mt-3"><strong className="text-ink">Before you commit:</strong> an exploratory conversation
                costs nothing and carries no obligation. Ask for one if you would rather talk first.</p>
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-panel p-5 text-sm text-ink-soft">
              <p><strong className="text-ink">Implementation:</strong> optional and typically CAD $2,500–$5,000, separately scoped.</p>
              <p className="mt-3"><strong className="text-ink">Ongoing management:</strong> optional and typically CAD $750–$1,500 per month.</p>
              <p className="mt-3">Implementation is not included in the audit, and no revenue, conversion, or operational
                result is guaranteed.</p>
            </div>
          </Reveal>

          <Reveal delay={0.05} className="rounded-2xl border border-line bg-panel p-6 sm:p-8">
            <h2 className="text-h3">Request the audit</h2>
            <p className="mb-2 mt-2 text-sm text-dim">A short description is enough to begin.</p>
            <p className="mb-7 text-sm text-dim">
              Submitting this form does not charge you. A Regulus team member reviews your request, confirms scope, and
              sends a secure payment link for the CAD $500 audit.
            </p>
            <ContactForm audit />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
