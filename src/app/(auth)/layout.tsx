/**
 * Deliberately minimal — no sidebar/topbar chrome. Just the background
 * token, so it reads as part of the app rather than a separate design.
 * Each page under this route group (login, signup) owns its own full-page
 * structure and branding placement rather than inheriting a fixed one here
 * — login uses a two-column layout, signup keeps the original centered card.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-background">{children}</div>;
}
