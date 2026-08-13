"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Layers, Scissors, RefreshCw, Minimize2, ScanText, Languages } from "lucide-react";

import { getSupabaseClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/layout/sidebar-content";

/** Same tool set the sidebar nav already lists — reused here just as small
 *  labeled pills, not a new taxonomy. */
const FEATURE_PILLS = [
  { label: "Merge", icon: Layers },
  { label: "Split", icon: Scissors },
  { label: "Convert", icon: RefreshCw },
  { label: "Compress", icon: Minimize2 },
  { label: "OCR", icon: ScanText },
  { label: "Translate", icon: Languages },
];

export default function LoginView() {
  const router = useRouter();
  const supabase = React.useMemo(() => getSupabaseClient(), []);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      setError("Sign-in isn't configured yet. Please try again later.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      // Never surface Supabase's raw error text (leaks technical detail
      // and, worse, can reveal whether an email is registered) — a single
      // generic message covers wrong password, unknown email, etc.
      setError("Invalid email or password.");
      return;
    }

    toast.success("Signed in");
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-svh w-full">
      {/* Branding panel — same gradient/texture/blur-blob recipe as ToolHero,
       *  just full-height instead of a rounded card. Hidden on small
       *  screens so mobile keeps today's simple centered-card experience. */}
      <div className="relative hidden w-1/2 shrink-0 overflow-hidden bg-gradient-to-br from-primary to-secondary lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div className="absolute inset-0 bg-grid opacity-[0.12]" />
        <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 size-64 rounded-full bg-black/10 blur-3xl" />

        <Link href="/dashboard" className="relative z-10 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <FileText className="size-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Doc<span className="text-white/70">y</span>
          </span>
        </Link>

        <div className="relative z-10 flex flex-col gap-6">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white xl:text-4xl">
              PDF tools, made simple.
            </h2>
            <p className="mt-3 max-w-sm text-sm text-white/80 xl:text-base">
              Convert, merge, and edit PDFs — free, fast, and private.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {FEATURE_PILLS.map(({ label, icon: Icon }) => (
              <Badge key={label} variant="outline" className="border-white/25 bg-white/10 text-white">
                <Icon className="size-3" /> {label}
              </Badge>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/60">No account needed to get started.</p>
      </div>

      {/* Login card */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-background px-4 py-12">
        <div className="lg:hidden">
          <Logo />
        </div>
        <Card className="w-full max-w-sm py-6">
          <CardHeader>
            <CardTitle>Log in</CardTitle>
            <CardDescription>Sign in to unlock unlimited use of every tool.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" variant="gradient" className="mt-2" disabled={loading}>
                {loading ? "Signing in…" : "Log in"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
