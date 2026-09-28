/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Root the project explicitly: the repo lives inside the user's home
    // directory, which has its own package-lock.json (and confuses Turbopack's
    // automatic root detection).
    root: __dirname,
  },
  async headers() {
    // Hardening headers for every route. The CSP is applied only in
    // production: dev mode relies on eval/websockets for HMR, which a strict
    // policy would break. The site is fully self-hosted (next/font, no CDNs,
    // no third-party scripts), so the policy below is safe to enforce.
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      { key: "X-DNS-Prefetch-Control", value: "off" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    ];

    const csp = [
      "default-src 'self'",
      // 'unsafe-inline' is required by Next.js's inline bootstrap scripts and
      // the theme script in app/layout.tsx. External script injection is still
      // blocked, which is the main vector for a static site.
      "script-src 'self' 'unsafe-inline'",
      // next/font injects an inline <style> with @font-face rules.
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers:
          process.env.NODE_ENV === "production"
            ? [...securityHeaders, { key: "Content-Security-Policy", value: csp }]
            : securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
