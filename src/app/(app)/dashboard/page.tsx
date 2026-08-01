import type { Metadata } from "next";

import { DashboardHero } from "@/components/dashboard/hero";
import { QuickActionsGrid } from "@/components/dashboard/quick-actions";
import { RecentToolsRow } from "@/components/dashboard/recent-tools-row";
import { quickActions, popularToolIds } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  const popularTools = popularToolIds
    .map((id) => quickActions.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => !!a);

  return (
    <div className="pb-16">
      <DashboardHero />

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-10 sm:px-6 lg:px-8">
        <RecentToolsRow />

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Popular tools</h2>
            <p className="text-sm text-muted-foreground">The tools people reach for most.</p>
          </div>
          <QuickActionsGrid actions={popularTools} />
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Every tool</h2>
            <p className="text-sm text-muted-foreground">Everything you need to work with PDFs.</p>
          </div>
          <QuickActionsGrid actions={quickActions} />
        </section>
      </div>
    </div>
  );
}
