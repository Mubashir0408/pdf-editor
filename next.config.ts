import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/$/, "");
/** Empty (and therefore a no-op below) until NEXT_PUBLIC_SUPABASE_URL is
 *  actually configured — same fail-open pattern as the rest of the auth
 *  integration. */
const SUPABASE_ORIGIN = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
/** Derived from the DSN itself (its host is the ingest endpoint the
 *  Sentry SDK posts events to) rather than hardcoded, so it can't drift
 *  from whatever project NEXT_PUBLIC_SENTRY_DSN actually points at. Empty
 *  — and therefore a no-op below — until that env var is set. */
const SENTRY_ORIGIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SENTRY_DSN ?? "").origin;
  } catch {
    return "";
  }
})();

/**
 * This app has no inline event-handler attributes and no external script
 * sources, but Next.js's own hydration bootstrap is an inline `<script>` —
 * without a nonce-based setup (a bigger change than this pass warrants),
 * `'unsafe-inline'` on script-src is required for the app to boot at all.
 * Everything else is locked to `'self'` plus the real external dependencies
 * this frontend talks to: the backend API origin, and (once configured)
 * Supabase's REST/auth API for login/signup and Sentry's ingest endpoint
 * for error monitoring.
 *
 * Dev mode additionally needs `'unsafe-eval'` — Next's Fast Refresh/HMR
 * client evaluates code via `eval()`, which a stricter CSP blocks outright
 * (verified: it throws and Fast Refresh dies). Production never needs or
 * gets it — this only relaxes the policy for `next dev`, not `next build`.
 */
const isDev = process.env.NODE_ENV !== "production";
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${BACKEND_ORIGIN}${SUPABASE_ORIGIN ? ` ${SUPABASE_ORIGIN}` : ""}${SENTRY_ORIGIN ? ` ${SENTRY_ORIGIN}` : ""}${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  compiler: {
    // Keep error/warn in production for real diagnostics; strip the rest
    // (debug/info-level console noise) from the shipped bundle.
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
 // For all available options, see:
 // https://www.npmjs.com/package/@sentry/webpack-plugin#options

 org: "mubashir-h1",

 project: "javascript-nextjs",

 // Only print logs for uploading source maps in CI
 silent: !process.env.CI,

 // For all available options, see:
 // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

 // Upload a larger set of source maps for prettier stack traces (increases build time)
 widenClientFileUpload: true,

 // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
 // This can increase your server load as well as your hosting bill.
 // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
 // side errors will fail.
 // tunnelRoute: "/monitoring",

 webpack: {
   // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
   // See the following for more information:
   // https://docs.sentry.io/product/crons/
   // https://vercel.com/docs/cron-jobs
   automaticVercelMonitors: true,

   // Tree-shaking options for reducing bundle size
   treeshake: {
     // Automatically tree-shake Sentry logger statements to reduce bundle size
     removeDebugLogging: true,
   },
 },
});
