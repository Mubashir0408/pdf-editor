import type { NextConfig } from "next";

const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/\/$/, "");
/** Empty (and therefore a no-op below) until NEXT_PUBLIC_SUPABASE_URL is
 *  actually configured — same fail-open pattern as the rest of the auth
 *  integration. */
const SUPABASE_ORIGIN = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");

/**
 * This app has no inline event-handler attributes and no external script
 * sources, but Next.js's own hydration bootstrap is an inline `<script>` —
 * without a nonce-based setup (a bigger change than this pass warrants),
 * `'unsafe-inline'` on script-src is required for the app to boot at all.
 * Everything else is locked to `'self'` plus the real external dependencies
 * this frontend talks to: the backend API origin, and (once configured)
 * Supabase's REST/auth API for login/signup.
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
  `connect-src 'self' ${BACKEND_ORIGIN}${SUPABASE_ORIGIN ? ` ${SUPABASE_ORIGIN}` : ""}${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
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

export default nextConfig;
