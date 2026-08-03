"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { usePendingFile } from "@/components/providers/pending-file-provider";
import { Dropzone } from "@/components/tools/dropzone";

export function DashboardHero() {
  const { t } = useTranslation();
  const { setFile } = usePendingFile();
  const router = useRouter();

  const handleFilesAdded = (files: File[]) => {
    setFile(files[0]);
    toast.success(`"${files[0].name}" ready — choose your output format`);
    router.push("/convert");
  };

  return (
    <div className="relative overflow-hidden rounded-b-[2.5rem] lg:rounded-3xl lg:mx-6 lg:mt-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary" />
      <div className="absolute inset-0 bg-grid opacity-[0.12]" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-5 py-16 text-center sm:px-8 sm:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
            {t("dashboard.heroTitle")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">
            {t("dashboard.heroSubtitle")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-lg"
        >
          <Dropzone
            tone="hero"
            onFilesAdded={handleFilesAdded}
            title={t("dashboard.dropTitle")}
            subtitle={t("dashboard.dropSubtitle")}
            formats={`PDF, DOCX, XLSX, PPTX, JPG, PNG ${t("common.upTo100mb")}`}
          />
        </motion.div>
      </div>
    </div>
  );
}
