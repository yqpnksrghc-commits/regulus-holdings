import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata = buildMetadata({
  title: "Terms",
  path: "/terms",
  description: `The terms governing use of the ${site.name} website.`,
});

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Use"
        lead={`The terms governing use of the ${site.name} website.`}
      />
      <Section>
        <div className="mx-auto max-w-prose">
          <div className="mb-10 flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-ink-soft">
            <span className="mt-0.5 rounded-full border border-gold/50 px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-gold">
              Draft
            </span>
            <p>
              <strong className="text-ink">These Terms of Use are a working draft pending legal review.</strong>{" "}
              They are not yet legally approved and may change.
            </p>
          </div>

          <div className="flex flex-col gap-8 text-ink-soft">
            <section>
              <h2 className="text-h3 text-ink">Acceptance</h2>
              <p className="mt-2">
                By using this website you agree to these terms. The site is provided by {site.name}{" "}
                (&ldquo;Regulus&rdquo;).
              </p>
            </section>
            <section>
              <h2 className="text-h3 text-ink">Use of the site</h2>
              <p className="mt-2">
                You may view and use this website for lawful, informational purposes. You agree not
                to misuse the site, interfere with its operation, or attempt to access it other than
                through the interfaces we provide.
              </p>
            </section>
            <section>
              <h2 className="text-h3 text-ink">Intellectual property</h2>
              <p className="mt-2">
                The content, design, and marks on this site are the property of {site.name} unless
                otherwise noted, and may not be copied or reused without permission.
              </p>
            </section>
            <section>
              <h2 className="text-h3 text-ink">No warranty; nature of claims</h2>
              <p className="mt-2">
                Content is provided &ldquo;as is,&rdquo; for information only, and is not a
                commitment or professional advice. Capabilities described on this site are labeled by
                evidence class; research and speculative directions are development areas, not
                guarantees of any outcome.
              </p>
            </section>
            <section>
              <h2 className="text-h3 text-ink">Contact</h2>
              <p className="mt-2">
                Questions about these terms:{" "}
                <a href={`mailto:${site.email}`} className="link-underline text-ink">
                  {site.email}
                </a>
                .
              </p>
            </section>
            <p className="text-sm text-dim">Last updated: 2026. © {site.name}</p>
          </div>
        </div>
      </Section>
    </>
  );
}
