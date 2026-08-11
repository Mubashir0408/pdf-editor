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
 *  labeled pills, not a new taxonomy. Mirrors login-view.tsx exactly. */
const FEATURE_PILLS = [
  { label: "Merge", icon: Layers },
  { label: "Split", icon: Scissors },
  { label: "Convert", icon: RefreshCw },
  { label: "Compress", icon: Minimize2 },
  { label: "OCR", icon: ScanText },
  { label: "Translate", icon: Languages },
];

/** Mirrors login-view.tsx's branding panel exactly (duplicated rather than
 *  extracted into a shared component, since the login page must stay
 *  untouched — this keeps that file's markup fully self-contained). */
function BrandingPanel() {
  return (
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
  );
}

export default function SignupView() {
  const router = useRouter();
  const supabase = React.useMemo(() => getSupabaseClient(), []);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = React.useState(false);

  const showMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      setError("Sign-up isn't configured yet. Please try again later.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      toast.success("Account created");
      router.push("/dashboard");
      return;
    }

    // Email confirmation is required before a session exists — this project
    // is on Supabase's default auth settings, not a custom flow.
    setConfirmationSent(true);
  };

  if (confirmationSent) {
    return (
      <div className="flex min-h-svh w-full">
        <BrandingPanel />
        <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-background px-4 py-12">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Card className="w-full max-w-sm py-6">
            <CardHeader>
              <CardTitle>Check your email</CardTitle>
              <CardDescription>
                We sent a confirmation link to {email}. Confirm your address, then log in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Back to log in</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full">
      <BrandingPanel />
      <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-background px-4 py-12">
        <div className="lg:hidden">
          <Logo />
        </div>
        <Card className="w-full max-w-sm py-6">
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>Create an account for unlimited access to every tool.</CardDescription>
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
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-invalid={showMismatch}
                />
                {showMismatch && <p className="text-xs text-destructive">Passwords do not match</p>}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                variant="gradient"
                className="mt-2"
                disabled={loading || password.length < 6 || password !== confirmPassword}
              >
                {loading ? "Creating account…" : "Sign up"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
