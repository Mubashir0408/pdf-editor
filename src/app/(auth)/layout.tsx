import { Logo } from "@/components/layout/sidebar-content";

/**
 * Deliberately minimal — no sidebar/topbar chrome — but built from the same
 * background token and the same `Logo` used everywhere else, so it reads as
 * part of the app rather than a separate design.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background px-4 py-12">
      <Logo />
      {children}
    </div>
  );
}
