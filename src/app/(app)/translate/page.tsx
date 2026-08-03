"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Languages, ArrowRight, Copy, Download, FileText, FileType2, RotateCcw } from "lucide-react";

import { ToolHero } from "@/components/tools/tool-hero";
import { ToolErrorState } from "@/components/tools/tool-error-state";
import { Dropzone } from "@/components/tools/dropzone";
import { SelectedFileRow } from "@/components/tools/selected-file-row";
import { ToolFaq } from "@/components/tools/tool-faq";
import { RelatedTools } from "@/components/tools/related-tools";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePendingFile } from "@/components/providers/pending-file-provider";
import { useSingleFileUpload } from "@/hooks/use-single-file-upload";
import { useTranslateJob } from "@/hooks/use-translate-job";
import { locales } from "@/lib/i18n/locales";
import { buildDownloadUrl } from "@/lib/api-client";

const faqs = [
  { q: "Will the layout match the original PDF?", a: "The text is extracted, translated, and reflowed into a new document — exact source layout, tables, and images are not reproduced." },
  { q: "What if my PDF is a scanned document?", a: "Pages with no selectable text are automatically read with OCR before translating, so scanned documents work too." },
  { q: "Do I need an account?", a: "No. Translating works instantly with no sign-up required." },
];

export default function TranslatePage() {
  const { t } = useTranslation();
  const { consume } = usePendingFile();

  const { file, uploadedId, status: uploadStatus, error: uploadError, upload, reset: resetUpload } =
    useSingleFileUpload();
  const { status: jobStatus, job, errorMessage: jobError, start, reset: resetJob } = useTranslateJob();

  const [sourceLang, setSourceLang] = React.useState("auto");
  const [targetLang, setTargetLang] = React.useState("es");

  React.useEffect(() => {
    const pending = consume();
    if (pending) void upload(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    resetUpload();
    resetJob();
  };

  const handleTranslate = async () => {
    if (!uploadedId) return;
    await start(uploadedId, sourceLang, targetLang);
  };

  const handleCopy = async () => {
    if (!job?.result) return;
    try {
      await navigator.clipboard.writeText(job.result.translatedText);
      toast.success(t("common.copied"));
    } catch {
      // clipboard permissions unavailable — silently no-op, the text is still visible to select/copy manually
    }
  };

  const isBusy = jobStatus === "starting" || jobStatus === "processing";
  const showError = uploadStatus === "error" || jobStatus === "error";
  const errorMessage = jobError ?? uploadError ?? undefined;
  const retry = uploadStatus === "error" && file ? () => upload(file) : handleTranslate;

  const stageLabel = (() => {
    if (!job) return "";
    if (job.stage === "extracting" || job.stage === "ocr") return t("translateTool.stageExtracting");
    if (job.stage === "translating") {
      return t("translateTool.stageTranslating", { current: job.current ?? 0, total: job.total ?? 0 });
    }
    if (job.stage === "rendering") return t("translateTool.stageRendering");
    return t("translateTool.stageDone");
  })();

  const sourceLangName =
    sourceLang === "auto"
      ? t("translateTool.autoDetect")
      : (locales.find((l) => l.code === sourceLang)?.nativeName ?? sourceLang);
  const targetLangName = locales.find((l) => l.code === targetLang)?.nativeName ?? targetLang;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={Languages}
        title={t("tools.translate.title")}
        description={t("tools.translate.description")}
        gradientFrom="#5B7FFF"
        gradientTo="#36CFC9"
      />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {showError ? (
            <ToolErrorState description={errorMessage} onRetry={retry} />
          ) : jobStatus === "done" && job?.result ? (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-base font-semibold text-foreground">{t("common.allDone")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("translateTool.resultSummary", { source: sourceLangName, target: targetLangName })}
                  {job.result.ocrPageCount > 0 ? ` · OCR × ${job.result.ocrPageCount}` : ""}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{t("common.preview")}</p>
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy /> {t("common.copy")}
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={job.result.translatedText}
                  rows={10}
                  className="resize-none font-mono text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button variant="gradient" asChild>
                  <a href={buildDownloadUrl(job.result.files.pdf.downloadUrl)} download>
                    <Download /> PDF
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={buildDownloadUrl(job.result.files.docx.downloadUrl)} download>
                    <FileType2 /> DOCX
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={buildDownloadUrl(job.result.files.txt.downloadUrl)} download>
                    <FileText /> TXT
                  </a>
                </Button>
                <Button variant="ghost" onClick={handleReset}>
                  <RotateCcw /> {t("common.startOver")}
                </Button>
              </div>
            </div>
          ) : !file ? (
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">{t("translateTool.uploadTitle")}</p>
              <Dropzone
                multiple={false}
                accept=".pdf"
                onFilesAdded={(files) => void upload(files[0])}
                title={t("translateTool.dropTitle")}
                formats={t("translateTool.dropFormats")}
              />
            </div>
          ) : (
            <>
              <SelectedFileRow
                name={file.name}
                size={file.size}
                onRemove={uploadStatus === "uploading" || isBusy ? undefined : handleReset}
              />

              {uploadStatus === "ready" && (
                <div>
                  <p className="mb-3 text-sm font-medium text-foreground">{t("translateTool.chooseLanguages")}</p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Select value={sourceLang} onValueChange={setSourceLang} disabled={isBusy}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("translateTool.sourceLanguage")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">{t("translateTool.autoDetect")}</SelectItem>
                        {locales.map((l) => (
                          <SelectItem key={l.code} value={l.code}>
                            {l.nativeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={targetLang} onValueChange={setTargetLang} disabled={isBusy}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("translateTool.targetLanguage")} />
                      </SelectTrigger>
                      <SelectContent>
                        {locales.map((l) => (
                          <SelectItem key={l.code} value={l.code}>
                            {l.nativeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {isBusy && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{stageLabel}</span>
                    <span className="text-muted-foreground">{job?.progress ?? 0}%</span>
                  </div>
                  <Progress value={job?.progress ?? 0} />
                </div>
              )}

              {uploadStatus === "ready" && !isBusy && (
                <Button variant="gradient" size="lg" onClick={handleTranslate} className="self-start">
                  {t("translateTool.startButton")} <ArrowRight />
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ToolFaq items={faqs} />
      <RelatedTools currentId="translate" />
    </div>
  );
}
