# Accessibility Audit

Target: **WCAG 2.1 Level AA** minimum. Accessibility is treated as a design
constraint, not a retrofit.

---

## How each area is addressed

### Perceivable

- **Color contrast** — Ink on background exceeds 4.5:1 in both themes; `dim`
  (steel gray) is reserved for large or secondary text. Accent/emerald/gold are
  used for non-text emphasis or paired with sufficient-contrast text, never as
  the sole carrier of meaning.
- **Non-color signals** — Evidence classes carry a text label *and* a tone, so
  status is never color-only. Loss/recovery cues include text.
- **Theming** — Light, dark, and system themes; `color-scheme` set so native
  controls and scrollbars match. `theme-color` metadata for both schemes.
- **Decorative graphics** — Canvas/SVG backdrops are `aria-hidden`; meaningful
  diagrams (`RecoveryLoop`, `DiscoveryGraph`) have `role="img"` + `aria-label`.

### Operable

- **Keyboard** — All interactive elements are native `<a>` / `<button>` and are
  reachable and operable by keyboard. The mobile menu closes on `Escape`.
  DomainCards are single anchors, so they receive one clean tab stop.
- **Visible focus** — Global `:focus-visible` ring (2px accent + offset) on every
  focusable element; never removed without replacement.
- **Skip link** — "Skip to content" is the first focusable element, jumping to
  `#main`.
- **Reduced motion** — `prefers-reduced-motion` is honored globally (CSS) and
  per-component (`useReducedMotion`): reveals render statically, the network
  field draws one frame, loops stop, the progress bar is removed.
- **Targets** — Controls meet comfortable hit-area sizing (≥40px height on
  primary actions).

### Understandable

- **Language** — `<html lang="en">`.
- **Labels** — Every form field has an associated `<label>`; the contact form
  uses `aria-invalid` + `aria-describedby` to bind error text, moves focus to
  the first invalid field, and announces success via `role="status"`.
- **Navigation** — Consistent header/footer; `aria-current="page"` on the active
  nav item; landmark regions (`header`, `main`, `footer`, labeled `nav`s).
- **Headings** — One `<h1>` per page; logical heading order downward.

### Robust

- **Semantics** — Landmarks, lists, `<article>`, `<ol>`/`<dl>` used where they
  fit the content. No ARIA where native semantics suffice.
- **Hydration** — Theme toggle renders a stable placeholder until mounted to
  avoid a mismatch; `suppressHydrationWarning` only on `<html>` for the theme
  class.

---

## Manual test checklist

- [ ] Tab through every page start-to-finish; focus is always visible and logical.
- [ ] Operate the mobile menu, theme toggle, and contact form by keyboard only.
- [ ] Enable OS "reduce motion"; confirm no animation plays.
- [ ] Zoom to 200%; no loss of content or horizontal scroll on body.
- [ ] Screen-reader pass (NVDA / VoiceOver) of home + one solution page.
- [ ] Automated: run axe DevTools / Lighthouse a11y (target 100).

---

## Known follow-ups

- Add real favicon set and an `opengraph-image` for richer link previews.
- If a custom display font is added, verify contrast and re-check CLS.
- Wire an automated axe-core check into CI (Playwright) as the site grows.
