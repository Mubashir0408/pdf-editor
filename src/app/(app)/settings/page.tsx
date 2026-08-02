"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  Palette,
  Languages,
  Bell,
  Keyboard,
  ShieldCheck,
  Accessibility,
  Info,
  Sun,
  Moon,
  Monitor,
  Check,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { languages } from "@/lib/mock-data";
import { wallpaperMeta } from "@/components/dashboard/wallpapers";
import { useWallpaper } from "@/hooks/use-wallpaper";

const sections = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "language", label: "Language", icon: Languages },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "shortcuts", label: "Keyboard shortcuts", icon: Keyboard },
  { id: "privacy", label: "Privacy", icon: ShieldCheck },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "about", label: "About", icon: Info },
] as const;

type SectionId = (typeof sections)[number]["id"];

const shortcuts = [
  { keys: ["⌘", "K"], desc: "Open global search" },
  { keys: ["⌘", "B"], desc: "Toggle sidebar" },
  { keys: ["⌘", "⇧", "C"], desc: "Open AI chat" },
  { keys: ["⌘", "N"], desc: "Start a new chat" },
  { keys: ["Esc"], desc: "Close dialog or panel" },
  { keys: ["⏎"], desc: "Send message" },
  { keys: ["⇧", "⏎"], desc: "New line in chat" },
];

function SettingsPageInner() {
  const params = useSearchParams();
  const initialTab = (params.get("tab") as SectionId) || "appearance";
  const [active, setActive] = React.useState<SectionId>(initialTab);
  const { theme, setTheme } = useTheme();
  const { wallpaper, setWallpaper, mounted } = useWallpaper();

  const [notifPrefs, setNotifPrefs] = React.useState({
    email: true,
    push: true,
    weeklySummary: true,
    productUpdates: false,
  });
  const [privacyPrefs, setPrivacyPrefs] = React.useState({
    analytics: true,
    aiSuggestions: true,
    shareUsage: false,
  });
  const [a11yPrefs, setA11yPrefs] = React.useState({
    reduceMotion: false,
    highContrast: false,
    largerText: false,
  });
  const [language, setLanguage] = React.useState("English");

  const save = (message: string) => toast.success(message);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Configure your appearance, language, and preferences."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[14rem_1fr]">
        <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0 scrollbar-thin">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              aria-current={active === s.id ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:shrink",
                active === s.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <s.icon className="size-4" />
              <span className="whitespace-nowrap">{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {active === "appearance" && (
            <Card className="py-6">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Choose how DocuFlow AI looks on this device.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div>
                  <Label className="mb-3 block">Theme</Label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      { id: "light", label: "Light", icon: Sun },
                      { id: "dark", label: "Dark", icon: Moon },
                      { id: "system", label: "System", icon: Monitor },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        aria-pressed={theme === t.id}
                        className={cn(
                          "relative flex flex-col items-center gap-2 rounded-xl border px-4 py-4 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          theme === t.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        {theme === t.id && (
                          <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-primary text-white">
                            <Check className="size-2.5" />
                          </span>
                        )}
                        <t.icon className="size-5 text-foreground" />
                        <span className="text-sm font-medium text-foreground">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="mb-3 block">Dashboard scenery</Label>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                    {wallpaperMeta.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => mounted && setWallpaper(w.id)}
                        aria-pressed={mounted && wallpaper === w.id}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          mounted && wallpaper === w.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Controls the hero background on your Dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {active === "language" && (
            <Card className="py-6">
              <CardHeader>
                <CardTitle>Language</CardTitle>
                <CardDescription>Set the language used across the interface.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 sm:max-w-xs">
                  <Label>Display language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="gradient" className="self-start" onClick={() => save("Language updated")}>
                  Save changes
                </Button>
              </CardContent>
            </Card>
          )}

          {active === "notifications" && (
            <Card className="py-6">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose what you want to be notified about.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col divide-y divide-border p-0">
                {[
                  { key: "email" as const, label: "Email notifications", desc: "Updates about conversions and shares" },
                  { key: "push" as const, label: "Push notifications", desc: "Real-time alerts in your browser" },
                  { key: "weeklySummary" as const, label: "Weekly summary", desc: "A digest of your activity every Monday" },
                  { key: "productUpdates" as const, label: "Product updates", desc: "New features and announcements" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifPrefs[item.key]}
                      onCheckedChange={(v) =>
                        setNotifPrefs((prev) => ({ ...prev, [item.key]: v }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {active === "shortcuts" && (
            <Card className="py-6">
              <CardHeader>
                <CardTitle>Keyboard shortcuts</CardTitle>
                <CardDescription>Move faster with these shortcuts.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col divide-y divide-border p-0">
                {shortcuts.map((s) => (
                  <div key={s.desc} className="flex items-center justify-between px-5 py-3">
                    <p className="text-sm text-foreground">{s.desc}</p>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k) => (
                        <kbd
                          key={k}
                          className="flex min-w-6 items-center justify-center rounded-md border border-border bg-muted px-1.5 py-1 text-xs font-medium text-foreground"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {active === "privacy" && (
            <Card className="py-6">
              <CardHeader>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>Control how your data is used.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col divide-y divide-border p-0">
                {[
                  { key: "analytics" as const, label: "Usage analytics", desc: "Help us improve by sharing anonymous usage data" },
                  { key: "aiSuggestions" as const, label: "Personalized AI suggestions", desc: "Use your document history to improve suggestions" },
                  { key: "shareUsage" as const, label: "Share data with partners", desc: "Allow anonymized data sharing for research" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={privacyPrefs[item.key]}
                      onCheckedChange={(v) =>
                        setPrivacyPrefs((prev) => ({ ...prev, [item.key]: v }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {active === "accessibility" && (
            <Card className="py-6">
              <CardHeader>
                <CardTitle>Accessibility</CardTitle>
                <CardDescription>Adjust the interface to your needs.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col divide-y divide-border p-0">
                {[
                  { key: "reduceMotion" as const, label: "Reduce motion", desc: "Minimize animations and transitions" },
                  { key: "highContrast" as const, label: "High contrast", desc: "Increase contrast for better readability" },
                  { key: "largerText" as const, label: "Larger text", desc: "Increase the base font size" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={a11yPrefs[item.key]}
                      onCheckedChange={(v) =>
                        setA11yPrefs((prev) => ({ ...prev, [item.key]: v }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {active === "about" && (
            <Card className="py-6">
              <CardHeader>
                <CardTitle>About DocuFlow AI</CardTitle>
                <CardDescription>Version and workspace information.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                    <Sparkles className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">DocuFlow AI</p>
                    <p className="text-xs text-muted-foreground">Version 1.0.0</p>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <p>Your AI-powered document workspace — convert, edit, organize, and chat with your files.</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    <span className="cursor-pointer hover:text-foreground">Terms of Service</span>
                    <span className="cursor-pointer hover:text-foreground">Privacy Policy</span>
                    <span className="cursor-pointer hover:text-foreground">Release notes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsPageInner />
    </Suspense>
  );
}
