import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { DemoReceptionist } from "@/components/receptionist/DemoReceptionist";
import { DEMO_INTEGRATIONS } from "@/lib/receptionist/demo/integrations";
import { DEMO_SERVICES, DEMO_TENANT } from "@/lib/receptionist/demo/tenant";

const path = "/ai-receptionist-demo";

// Demo surface — never indexed. It presents a fictional tenant and simulated data.
export const metadata = buildMetadata({
  title: "AI Receptionist — Live Sales Demo",
  path,
  description:
    "See the Regulus AI Receptionist handle a real consultation request for a fictional clinic — with the structured lead, qualification, and staff actions revealed live.",
  index: false,
});

const steps = [
  { n: "1", label: "The conversation", detail: "A visitor chats with the receptionist exactly as a real customer would." },
  { n: "2", label: "Structured capture", detail: "Contact and intent are extracted into a review-ready lead record." },
  { n: "3", label: "Qualification", detail: "The engine decides the outcome and the exact next action for staff." },
  { n: "4", label: "Safe by design", detail: "Consent, emergency routing, and a no-medical-advice boundary are built in." },
];

export default function AiReceptionistDemoPage() {
  return (
    <>
      <PageHero
        eyebrow="Live product demo"
        title="Watch the AI Receptionist qualify a lead in real time"
        lead={
          <>
            This is the same Regulus receptionist engine that runs in production, configured for a fictional clinic —{" "}
            <strong className="text-ink">{DEMO_TENANT.label}</strong>. Chat with it on the left; watch the structured lead,
            qualification, and staff actions appear on the right. Everything here is a simulation: nothing is stored, sent, or booked.
          </>
        }
      />

      <Section>
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-xl border border-line bg-panel p-4">
              <span aria-hidden className="text-sm font-semibold text-gold">{s.n}</span>
              <p className="mt-1 text-sm font-semibold text-ink">{s.label}</p>
              <p className="mt-1 text-xs text-dim">{s.detail}</p>
            </div>
          ))}
        </div>

        <DemoReceptionist />

        <p className="mt-6 text-center text-xs text-dim">
          {DEMO_TENANT.label} is fictional. This demo runs the production receptionist workflow in an isolated sandbox —
          it cannot create real leads, appointments, or notifications, and it does not collect health information or give medical advice.
        </p>
      </Section>

      {/* What the demo shows about the fictional clinic */}
      <Section tone="bg-2">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="text-h2">Configured for a clinic, in minutes</h2>
            <p className="mt-4 text-ink-soft">
              The receptionist speaks only from an approved knowledge source. For this demo it knows {DEMO_TENANT.name}’s
              services, hours, and consultation process — and nothing else. In a real deployment, the same engine is
              configured with your services and your boundaries.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-soft">
              {DEMO_SERVICES.map((s) => (
                <li key={s.slug} className="rounded-lg border border-line bg-panel px-4 py-3">
                  <span className="font-medium text-ink">{s.name}</span> — {s.description}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-h2">Available in a production deployment</h2>
            <p className="mt-4 text-ink-soft">Every action in this demo is simulated. Connected for real, the receptionist can:</p>
            <ul className="mt-6 space-y-3">
              {DEMO_INTEGRATIONS.map((it) => (
                <li key={it.name} className="flex gap-3 rounded-lg border border-line bg-panel px-4 py-3">
                  <span aria-hidden className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-[0.7rem] text-gold">◆</span>
                  <div>
                    <p className="text-sm font-medium text-ink">{it.name}</p>
                    <p className="text-xs text-dim">{it.capability}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* CTA to contact Regulus */}
      <Section>
        <div className="rounded-3xl border border-line bg-panel p-8 text-center sm:p-12">
          <h2 className="text-h2">Want this answering for your business?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-ink-soft">
            Regulus configures this receptionist around your services, your consent rules, and your human handoffs — then
            connects it to your calendar, CRM, and notifications. The first fit review is free.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/contact?intent=ai-receptionist" size="lg" data-analytics-event="demo_receptionist_cta">
              Talk to Regulus
            </Button>
            <Button href="/automation/ai-receptionist" variant="secondary" size="lg">
              How the receptionist works
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
