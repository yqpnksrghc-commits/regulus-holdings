import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/lib/site";
import { organizationJsonLd } from "@/lib/seo";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ReadingProgress } from "@/components/layout/ReadingProgress";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: site.url },
  keywords: [
    "Regulus",
    "value recovery",
    "corporate intelligence",
    "decision intelligence",
    "discovery engine",
    "avoidable loss",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    locale: site.locale,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name} — ${site.tagline}` }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Without JS, Framer Motion's SSR'd `opacity:0` would hide content.
            Force everything visible and static so the site is fully readable. */}
        <noscript>
          <style>{`*{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh">
        {/* next-themes reads/writes the `class` on <html> before paint. */}
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
          >
            Skip to content
          </a>
          <Header />
          <ReadingProgress />
          <main id="main" className="pt-16">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
      </body>
    </html>
  );
}
