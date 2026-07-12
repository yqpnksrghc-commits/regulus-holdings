import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata = buildMetadata({
  title: "Privacy",
  path: "/privacy",
  description: `How ${site.name} handles personal information on this website.`,
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy"
        lead={`How ${site.name} handles information on this website.`}
      />
      <Section>
        <div className="mx-auto max-w-prose">
          <div className="mb-10 rounded-xl border border-line bg-bg-2/60 p-4 text-sm text-dim">
            This policy is a working draft pending review by counsel. It reflects the current,
            deliberately minimal data practices of this website.
          </div>

          <div className="prose-legal flex flex-col gap-8 text-ink-soft">
            <section>
              <h2 className="text-h3 text-ink">Who we are</h2>
              <p className="mt-2">
                This website is operated by {site.name} (&ldquo;Regulus&rdquo;, &ldquo;we&rdquo;).
                Questions about privacy can be sent to{" "}
                <a href={`mailto:${site.email}`} className="link-underline text-ink">
                  {site.email}
                </a>
                .
              </p>
            </section>
            <section>
              <h2 className="text-h3 text-ink">What we collect</h2>
              <p className="mt-2">
                This site sets no advertising or tracking cookies and does not run third-party
                analytics. If you contact us — through the contact form or by email — we receive the
                information you choose to send (such as your name, email address, organization, and
                message) solely to respond to you.
              </p>
            </section>
            <section>
              <h2 className="text-h3 text-ink">How we use it</h2>
              <p className="mt-2">
                We use information you send only to reply and to maintain our correspondence with
                you. We do not sell personal information, and we do not share it except as needed to
                operate the website (for example, our hosting provider) or as required by law.
              </p>
            </section>
            <section>
              <h2 className="text-h3 text-ink">Your choices</h2>
              <p className="mt-2">
                You may ask us to access, correct, or delete the personal information you have sent
                us by writing to{" "}
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
