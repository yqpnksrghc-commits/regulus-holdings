# Content Model & Future Expansion

Content is **data, not markup**. All copy and structure live in `src/lib/`, so
editing the site does not mean editing components. This is the content-management
strategy and the seam for future growth.

---

## Where content lives

| File                 | Owns                                                        |
| -------------------- | ----------------------------------------------------------- |
| `src/lib/site.ts`    | Company metadata, navigation, footer, contact, socials.     |
| `src/lib/platform.ts`| The 10 intelligence domains + evidence classes.             |
| `src/lib/content.ts` | Narrative blocks: problem, approach, discovery, research, products, roadmap, industries, values. |
| `src/lib/seo.ts`     | Per-page metadata builder + org JSON-LD.                    |

Everything is typed. Adding or reordering an item is a one-line data edit and
the UI updates everywhere it appears (nav, footer, grids, sitemap).

---

## Common edits

**Change copy** — edit the relevant string in `content.ts` / `site.ts`.

**Add an intelligence domain** — append an object to `intelligenceDomains` in
`platform.ts` (give it a `slug`, `icon` key, and `evidence` class). It
automatically appears in the platform grid, the Solutions index, gets a
statically-generated detail page, and is added to the sitemap.

**Add a domain icon** — add the key to `IconKey` and a path in
`components/ui/Icon.tsx`.

**Change a product's status** — edit its `status` / `evidence` in `content.ts`.
The badge and roadmap update automatically. *Never* set `status: "Available"`
for something not operational — the evidence discipline is the brand.

**Add a nav item** — add to `primaryNav` (and `footerNav` if desired) in
`site.ts`.

---

## The evidence discipline (non-negotiable)

Every capability claim carries an evidence class: **Operational**, **Established
Science**, **Regulus Research**, or **Speculative**. These are never blurred in
copy or UI. A claim that cannot be demonstrated is labeled research or
speculative — repetition and confidence do not promote it. This mirrors the
company's internal standard and is the single most important content rule.

---

## Future expansion architecture

The current site is intentionally content-driven so it can grow without a
re-architecture:

1. **Headless CMS (when editing cadence demands it).** Replace the `src/lib/*`
   data modules with a fetch layer (Sanity, Contentful, or a git-backed CMS like
   Keystatic/TinaCMS). Component contracts stay identical — swap the data source,
   keep the types. Server Components fetch at build time to preserve SSG.

2. **MDX for long-form.** For a Research/Insights blog, add
   `@next/mdx` and an `app/insights/[slug]` route reading MDX files. The
   evidence-badge component is already reusable inside prose.

3. **Contact backend.** Add `app/api/contact/route.ts` (a Route Handler) that
   validates and forwards to email/CRM, then point `ContactForm.onSubmit` at it
   instead of the mailto fallback. The form already validates client-side and is
   structured for a clean POST.

4. **Internationalization.** Add `next-intl` and a `[locale]` segment; copy is
   already centralized, so translation means adding locale dictionaries, not
   touching components.

5. **Search.** A static index can be generated at build time from the same data
   modules (client-side fuzzy search) or wired to a hosted index as content
   grows.

6. **Analytics / consent.** Add a privacy-first analytics snippet behind a
   consent gate; the site sets no cookies today.

---

## Editing workflow

1. Branch from `main`.
2. Edit data in `src/lib/` (or components for structural change).
3. `npm run dev` to preview; `npm run build` to verify.
4. Open a PR — CI runs lint · typecheck · build.
5. Merge to `main` → production deploy.

Keep changes small and content-first. The system rewards restraint.
