# Regulus Automation Inc. — Design System

The system is small on purpose. A handful of tokens, one type scale, one motion
grammar. Restraint is the brand.

---

## 1. Color

Colors are defined once as CSS custom properties in `src/app/globals.css` (as
space-separated RGB channels) and exposed to Tailwind through the
`rgb(var(--token) / <alpha-value>)` bridge in `tailwind.config.ts`. This gives a
single source of truth and keeps opacity modifiers (`text-ink/70`) working.

### Palette

| Token          | Light      | Dark       | Role                                  |
| -------------- | ---------- | ---------- | ------------------------------------- |
| `bg`           | `#fbfaf7`  | `#0b0c0f`  | Page background (soft white / charcoal)|
| `bg-2`         | `#f3f1ea`  | `#101216`  | Alternating section background         |
| `panel`        | `#ffffff`  | `#14161b`  | Card / surface                         |
| `panel-2`      | `#f7f5ef`  | `#181b21`  | Hover / nested surface                 |
| `ink`          | `#15171b`  | `#eceef3`  | Primary text                           |
| `ink-soft`     | `#41454d`  | `#b6bbc6`  | Body text                              |
| `dim`          | `#6b7280`  | `#838996`  | Secondary text (steel gray)            |
| `line`/`line-2`| warm gray  | cool gray  | Hairlines / borders                    |
| `accent`       | `#2f56c8`  | `#7c9bff`  | Electric blue — primary accent         |
| `emerald`      | `#0f7a5b`  | `#34be94`  | Operational / success / recovery       |
| `gold`         | `#9a7424`  | `#d3a44e`  | Warm gold — **used sparingly** (the mark, fixed points) |

**Restraint rules**
- No neon. No full-bleed gradients. The only gradients are the text clip on the
  hero headline and the faint radial glow behind the final CTA.
- Gold appears only at focal points (the logo node, the recovery-loop center).
- Accent carries interaction; emerald carries "operational / recovered."

### Evidence tones

Evidence classes map to tones so honesty is legible at a glance:
`Operational → emerald`, `Regulus Research → accent`, `Speculative → gold`,
`Established Science → emerald`. See `EvidenceBadge` in `components/ui/Badge.tsx`.

---

## 2. Typography

System font stack (`--font-sans`) — instant paint, no layout shift, no network
request. Modern OS faces (SF, Segoe UI) render the intended register. A
self-hosted display face can be dropped in via `next/font/local` without other
changes (see CONTENT.md).

### Fluid scale (`tailwind.config.ts` → `fontSize`)

| Utility        | clamp(min, fluid, max)          | Use                     |
| -------------- | ------------------------------- | ----------------------- |
| `text-display` | `2.75 → 5rem`                   | Hero headline           |
| `text-h1`      | `2.25 → 3.5rem`                 | Page titles             |
| `text-h2`      | `1.75 → 2.5rem`                 | Section headings        |
| `text-h3`      | `1.25 → 1.6rem`                 | Card / sub headings     |
| `text-lead`    | `1.075 → 1.3rem`                | Lead paragraphs         |

Headings use tight tracking and `text-wrap: balance`; body uses
`text-wrap: pretty` and a `68ch` measure (`max-w-prose`).

---

## 3. Spacing & layout

- **Container:** `container-lab` = centered, `max-w-6xl`, responsive gutters.
- **Section rhythm:** `Section` component → `py-20 sm:py-28`, with a `tone`
  prop (`bg` / `bg-2` / `panel`) for clean alternation without heavy dividers.
- **Radius:** cards `rounded-2xl`, controls `rounded-xl`.
- **Shadow:** three tiers — `subtle`, `card`, `lift` (hover) — all low-opacity.
- **Hairline grid:** `grid-lines` utility, radially masked, for hero/backdrops.

---

## 4. Motion

One grammar, defined in `components/motion/Reveal.tsx`, all easing
`cubic-bezier(0.22, 1, 0.36, 1)`.

| Primitive        | Behavior                                             |
| ---------------- | ---------------------------------------------------- |
| `Reveal`         | Fade + rise on scroll into view, once.               |
| `RevealStagger` + `RevealItem` | Staggered children (0.07s) for card grids. |
| `ReadingProgress`| Spring-driven top progress bar.                      |
| `NetworkBackground` | Canvas node field; pauses off-screen; static frame under reduced motion. |
| `RecoveryLoop` / `DiscoveryGraph` | SVG diagrams with looping/path-draw animation. |

**Reduced motion is a first-class path**, not an afterthought: every animated
component checks `useReducedMotion()` (or the CSS `prefers-reduced-motion`
media query) and renders a static equivalent. `globals.css` also globally
collapses animation/transition durations under the media query.

---

## 5. Icon library

10 domain icons in `components/ui/Icon.tsx`, authored on a 24×24 grid, single
1.5px stroke, `currentColor` (inherits text color + theme). Keys:
`corporate · financial · knowledge · psychological · decision · automation ·
infrastructure · energy · material · discovery`. The Regulus mark
(`components/layout/Logo.tsx`) is a recovery ring with a single gold node.

---

## 6. Components

Primitives in `components/ui/`:

- **Button** — `primary` / `secondary` / `ghost`, `md` / `lg`; renders `<a>`
  (via `next/link`) when `href` is set, else `<button>`. `Arrow` companion.
- **Badge** / **EvidenceBadge** — tone-driven pills; evidence badge is the
  honesty primitive used site-wide.
- **Section** / **SectionHeading** — layout + heading rhythm.
- **DomainCard** — the interactive platform card (whole card is a link).
- **Icon** — the domain icon set.

Composed sections live in `components/sections/`, page chrome in
`components/layout/`.

---

## 7. Adding to the system

- **New color:** add the channel tri+ to `:root` and `.dark` in `globals.css`,
  then map it in `tailwind.config.ts`. Never hard-code hex in components.
- **New icon:** add a key to `IconKey` and a path to `Icon.tsx`.
- **New section:** compose `Section` + `SectionHeading` + `Reveal`; pull copy
  from `src/lib/content.ts`.
