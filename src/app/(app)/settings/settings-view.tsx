"use client";

import { useTranslation } from "react-i18next";
import { Settings as SettingsIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader icon={SettingsIcon} title={t("settings.title")} description={t("settings.description")} />

      <Card className="py-6">
        <CardHeader>
          <CardTitle>{t("settings.language")}</CardTitle>
          <CardDescription>{t("settings.languageDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label>{t("settings.displayLanguage")}</Label>
            <LanguageSwitcher className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
