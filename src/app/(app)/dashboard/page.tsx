import type { Metadata } from "next";

import { DashboardHero } from "@/components/dashboard/hero";
import { StatsRow } from "@/components/dashboard/stats-row";
import { QuickActionsGrid } from "@/components/dashboard/quick-actions";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { PinnedDocuments } from "@/components/dashboard/pinned-documents";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="pb-10">
      <DashboardHero />

      <div className="relative z-10 mx-4 -mt-8 flex flex-col gap-8 sm:mx-6 lg:mx-6 lg:mt-[-2.5rem]">
        <StatsRow />

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Quick actions</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/convert">View all tools</Link>
            </Button>
          </div>
          <QuickActionsGrid />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="flex flex-col gap-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Recent documents
              </h2>
            </div>
            <RecentDocuments />
          </section>

          <aside className="flex flex-col gap-6">
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Pinned</h2>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/files/favorites">See all</Link>
                </Button>
              </div>
              <PinnedDocuments />
            </section>

            <Card className="py-5">
              <CardHeader>
                <CardTitle className="text-base">Recent activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityFeed limit={5} />
                <Button asChild variant="ghost" size="sm" className="mt-1 w-full">
                  <Link href="/history">View full history</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
