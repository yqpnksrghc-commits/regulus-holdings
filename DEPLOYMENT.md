# Deployment

The site is a standard Next.js 15 App Router application. Every route is
statically generated, so it deploys to any Node host or static-capable platform.

---

## Recommended: Vercel

Zero-config for Next.js.

1. Push the repo to GitHub (see structure below).
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Framework preset auto-detects **Next.js**. No build settings to change:
   - Build command: `next build`
   - Output: handled by the adapter
4. Set the production domain `regulusautomation.ca` in **Settings →
   Domains** and point DNS as instructed (records below).
5. Every push to `main` deploys production; every PR gets a preview URL.

`site.url` in `src/lib/site.ts` is already set to `https://regulusautomation.ca`,
so canonical URLs, sitemap, and Open Graph tags are correct once deployed.

---

## DNS for `regulusautomation.ca`

Configure these at the domain's DNS provider **after** Vercel shows the exact
target values in **Settings → Domains** (Vercel confirms the canonical values;
those below are the standard Vercel set). Do **not** change DNS until the deploy
is authorized.

| Type    | Host / Name           | Value                     | Purpose                          |
| ------- | --------------------- | ------------------------- | -------------------------------- |
| `A`     | `@` (apex)            | `76.76.21.21`             | Apex → Vercel (Vercel confirms)  |
| `CNAME` | `www`                 | `cname.vercel-dns.com`    | `www` → Vercel                   |
| `TXT`   | `@`                   | `_vercel` challenge value | Domain-ownership verification    |

Notes:
- Prefer an `ALIAS`/`ANAME` at the apex if the registrar supports it; otherwise
  use the `A` record Vercel provides.
- Redirect one of apex/`www` to the other in Vercel so the site has a single
  canonical origin (recommended canonical: `https://regulusautomation.ca`).
- Email/MX records are **separate** — adding web DNS does not affect an existing
  mailbox. The `contact@regulusautomation.ca` inbox must exist independently.

---

## Alternative hosts

| Host                | Notes                                                        |
| ------------------- | ----------------------------------------------------------- |
| **Netlify**         | Use the official Next.js runtime; connect repo, deploy.     |
| **Cloudflare Pages**| Next-on-Pages adapter.                                       |
| **Node / Docker**   | `npm run build && npm run start` (serves on `$PORT`, def. 3000). |
| **Any static CDN**  | Add `output: "export"` to `next.config.mjs` for a fully static `out/` — note this disables the mailto-only contact route's future server option. |

### Docker (self-host)

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## Environment

No secrets are required to build or run the current site. When wiring the
contact form to a backend (see CONTENT.md), add:

```
# .env.local
NEXT_PUBLIC_SITE_URL=https://regulusautomation.ca
CONTACT_ENDPOINT=...            # optional: POST target for /api/contact
```

`.env*` is gitignored.

---

## GitHub repository structure

```
regulus-automation/             # repo root == this project
├─ .github/workflows/ci.yml     # CI: lint · typecheck · build on push + PR
├─ src/                         # application source
├─ public/                      # static assets (favicons, og image)
├─ *.md                         # README + design/deploy/a11y/content docs
├─ package.json · tsconfig.json · tailwind.config.ts · next.config.mjs
└─ .gitignore
```

Branching: trunk-based. `main` is always deployable; feature branches open PRs;
CI must be green to merge; merge to `main` triggers production deploy.

---

## CI/CD

`.github/workflows/ci.yml` runs on every push to `main` and every PR:

1. **Lint** — `next lint` (core-web-vitals + typescript rules)
2. **Typecheck** — `tsc --noEmit`
3. **Build** — `next build` (fails the job on any type or build error)

Deployment is handled by the host's Git integration (Vercel/Netlify), so CI
gates quality and the platform gates delivery. To deploy from CI instead, add a
job that runs the host's CLI (`vercel deploy --prod`) with a project token in
repository secrets.

---

## Local development

Run the site locally for testing and development:

### Development server (with hot reload)
```bash
npm run dev
```
Runs on `http://localhost:3000` (Next.js default port).

To use a custom port:
```bash
PORT=8780 npm run dev
```

### Production build + server
```bash
npm run build
npm run start
```
Runs on `http://localhost:3000` (same port as dev by default).

To use a custom port:
```bash
PORT=8780 npm run start
```

**Note:** The `.claude/launch.json` config at the parent LAB level specifies
port 8780 for the `regulus-automation` entry, but the `--port` argument in that
config is not a valid Next.js dev flag. To use port 8780 locally, set `PORT`
environment variable as shown above, or edit `.claude/launch.json` to use
`PORT=8780 npm run dev` instead. The production server defaults to port 3000
and respects the `PORT` environment variable.

---

## Pre-flight checklist

- [ ] `site.url` set to the production origin.
- [ ] Favicons + `opengraph-image` added to `public/` (or `app/`).
- [ ] `npm run build` green locally.
- [ ] Lighthouse pass (Performance / Accessibility / Best Practices / SEO).
- [ ] Contact destination verified (`site.email`).
