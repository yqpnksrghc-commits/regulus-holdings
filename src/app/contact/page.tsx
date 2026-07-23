import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { ContactForm } from "@/components/sections/ContactForm";

export const metadata = buildMetadata({
  title: "Contact",
  path: "/contact",
  description: "Tell us where value is leaking. We help you see it, quantify it, and recover it.",
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Start with where value is leaking."
        lead="A short note is enough. Tell us what you are seeing, and we will help you measure it."
      />
      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <Reveal className="rounded-3xl border border-line bg-panel p-8 shadow-card sm:p-10">
            <ContactForm />
          </Reveal>
          <Reveal delay={0.05} className="flex flex-col gap-8">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-dim">Direct</h2>
              <a
                href={`mailto:${site.email}`}
                className="link-underline mt-2 block text-lg font-medium text-ink"
                data-analytics-event="email_contact_activation"
              >
                {site.email}
              </a>
            </div>
            {site.social.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-dim">Elsewhere</h2>
                <ul className="mt-2 flex flex-col gap-2">
                  {site.social.map((s) => (
                    <li key={s.href}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-underline text-ink">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-2xl border border-line bg-bg-2/60 p-5">
              <p className="text-sm text-ink-soft">
                We read every message and reply to the ones where we can genuinely help. Evidence
                first — even in a first conversation.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
