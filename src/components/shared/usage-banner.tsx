"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { getUsageStatus } from "@/lib/api/usage";
import { FEATURE_LABELS, GUEST_FREE_USES, type FeatureKey } from "@/lib/features";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Guest-only usage indicator for one feature — renders nothing for signed-in
 * users (unlimited) and nothing until Supabase is actually configured, so it
 * has zero effect on the app until auth is wired up. Pass a changing
 * `refreshKey` (e.g. bumped after each attempt) to re-check the count
 * without a full page reload.
 */
export function UsageBanner({ feature, refreshKey }: { feature: FeatureKey; refreshKey?: number }) {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const [remaining, setRemaining] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!isConfigured || authLoading || user) return;

    let cancelled = false;
    getUsageStatus(feature)
      .then((status) => {
        if (!cancelled) setRemaining(status.remaining);
      })
      .catch(() => {
        // Usage status is a nice-to-have, not load-bearing — if it fails to
        // load, the tool itself still works and the backend still enforces
        // the real limit; the guest just won't see a remaining-uses hint.
      });

    return () => {
      cancelled = true;
    };
  }, [feature, refreshKey, isConfigured, authLoading, user]);

  if (!isConfigured || authLoading || user || remaining === null) return null;

  const label = FEATURE_LABELS[feature];

  if (remaining <= 0) {
    return (
      <Alert variant="warning">
        <Sparkles />
        <AlertTitle>Free limit reached</AlertTitle>
        <AlertDescription className="w-full">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              You&apos;ve used your {GUEST_FREE_USES} free uses for {label}. Sign in to continue with
              unlimited access.
            </span>
            <div className="flex shrink-0 gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" variant="gradient">
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <p className="text-xs text-muted-foreground">
      {remaining} free use{remaining === 1 ? "" : "s"} remaining ·{" "}
      <Link href="/login" className="font-medium text-primary hover:underline">
        Sign in
      </Link>{" "}
      for unlimited access.
    </p>
  );
}
