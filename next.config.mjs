/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";
    // Next.js injects a small inline bootstrap script and inline styles; Framer
    // Motion sets inline styles. Hence 'unsafe-inline' for script/style. Dev
    // mode (React Refresh) additionally needs 'unsafe-eval'; production does not.
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "img-src 'self' data:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "connect-src 'self'" + (isDev ? " ws:" : ""),
      "form-action 'self' mailto:",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "manifest-src 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
