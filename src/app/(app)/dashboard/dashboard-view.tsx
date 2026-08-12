"use client";

import { useTranslation } from "react-i18next";

import { DashboardHero } from "@/components/dashboard/hero";
import { QuickActionsGrid } from "@/components/dashboard/quick-actions";
import { quickActions, popularToolIds, toolGroups } from "@/lib/mock-data";

export default function DashboardPage() {
  const { t } = useTranslation();

  const popularTools = popularToolIds
    .map((id) => quickActions.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => !!a);

  return (
    <div className="pb-16">
      <DashboardHero />

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-10 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{t("dashboard.popularTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("dashboard.popularSubtitle")}</p>
          </div>
          <QuickActionsGrid actions={popularTools} />
        </section>

        {toolGroups.map((group) => {
          const tools = group.toolIds
            .map((id) => quickActions.find((a) => a.id === id))
            .filter((a): a is NonNullable<typeof a> => !!a);

          return (
            <section key={group.id} className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">{t(group.titleKey)}</h2>
                <p className="text-sm text-muted-foreground">{t(group.subtitleKey)}</p>
              </div>
              <QuickActionsGrid actions={tools} />
            </section>
          );
        })}
      </div>
    </div>
  );
}
