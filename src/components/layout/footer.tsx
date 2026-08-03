"use client";

import { useTranslation } from "react-i18next";

import { Logo } from "@/components/layout/sidebar-content";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <Logo />
        <p className="text-xs text-muted-foreground">{t("footer.tagline")}</p>
        <p className="text-xs text-muted-foreground">
          © {year} DocuFlow AI. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
