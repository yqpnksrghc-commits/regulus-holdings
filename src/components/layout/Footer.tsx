import Link from "next/link";
import { site, footerNav } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  const year = 2026; // Build-time constant; update in CI or via env for accuracy.
  return (
    <footer className="border-t border-line bg-bg-2/50">
      <div className="container-lab py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm text-dim">{site.tagline}</p>
            <p className="max-w-sm text-sm text-ink-soft">{site.mission}</p>
            <a
              href={`mailto:${site.email}`}
              className="link-underline text-sm font-medium text-ink"
            >
              {site.email}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerNav.map((group) => (
              <nav key={group.title} aria-label={group.title} className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-dim">{group.title}</h3>
                <ul className="flex flex-col gap-2.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="text-sm text-ink-soft transition-colors hover:text-ink">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-dim">
            © {year} {site.name} Recovering value; building intelligence.
          </p>
          {site.social.length > 0 && (
            <ul className="flex items-center gap-5">
              {site.social.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-ink-soft transition-colors hover:text-ink"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
