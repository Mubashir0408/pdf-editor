"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RefreshCw, ArrowRight } from "lucide-react";

import { ToolHero } from "@/components/tools/tool-hero";
import { ToolErrorState } from "@/components/tools/tool-error-state";
import { Dropzone } from "@/components/tools/dropzone";
import { SelectedFileRow, inferFileType } from "@/components/tools/selected-file-row";
import { ResultCard } from "@/components/tools/result-card";
import { ToolFaq } from "@/components/tools/tool-faq";
import { RelatedTools } from "@/components/tools/related-tools";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon } from "@/components/shared/file-icon";
import { UsageBanner } from "@/components/shared/usage-banner";
import { usePendingFile } from "@/components/providers/pending-file-provider";
import { useSingleFileUpload } from "@/hooks/use-single-file-upload";
import { convertWordToPdf } from "@/lib/api/wordToPdf";
import { convertExcelToPdf } from "@/lib/api/excelToPdf";
import { convertPowerpointToPdf } from "@/lib/api/powerpointToPdf";
import { convertImageToPdf } from "@/lib/api/imageToPdf";
import { convertPdfToImage } from "@/lib/api/pdfToImage";
import { convertPdfToWord } from "@/lib/api/pdfToWord";
import { checkInUsage } from "@/lib/api/usage";
import { buildDownloadUrl } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type { FileType } from "@/lib/types";
import type { ProcessedFileResponse } from "@/lib/api/types";

/**
 * Only the source→target pairs an existing backend endpoint actually
 * supports — each one dispatches to the exact same endpoint its dedicated
 * single-purpose tool page uses (Word to PDF, PDF to Image, ...). "txt" was
 * removed: no backend route accepts or produces it, so it was never a real
 * option despite appearing in the picker.
 */
const REAL_TARGETS: Partial<Record<FileType, FileType[]>> = {
  pdf: ["docx", "jpg", "png"],
  docx: ["pdf"],
  xlsx: ["pdf"],
  pptx: ["pdf"],
  jpg: ["pdf"],
  png: ["pdf"],
};

const FORMAT_LABELS: Partial<Record<FileType, string>> = {
  pdf: "PDF",
  docx: "Word",
  xlsx: "Excel",
  pptx: "PowerPoint",
  jpg: "JPG",
  png: "PNG",
};

async function dispatchConversion(
  source: FileType,
  target: FileType,
  fileId: string
): Promise<ProcessedFileResponse> {
  if (source === "docx" && target === "pdf") return convertWordToPdf(fileId);
  if (source === "xlsx" && target === "pdf") return convertExcelToPdf(fileId);
  if (source === "pptx" && target === "pdf") return convertPowerpointToPdf(fileId);
  if ((source === "jpg" || source === "png") && target === "pdf") return convertImageToPdf([fileId]);
  if (source === "pdf" && target === "docx") return convertPdfToWord(fileId);
  if (source === "pdf" && (target === "jpg" || target === "png")) return convertPdfToImage(fileId, target);
  throw new Error(`Converting ${source.toUpperCase()} to ${target.toUpperCase()} isn't supported yet.`);
}

const faqs = [
  { q: "Is it safe to convert my files here?", a: "Yes — files are processed only for your conversion and deleted shortly after." },
  { q: "What formats can I convert between?", a: "PDF ↔ Word, PDF ↔ Image (JPG/PNG), and Excel/PowerPoint → PDF." },
  { q: "Do I need an account?", a: "No. Every tool works instantly with no sign-up required." },
  { q: "Is there a file size limit?", a: "Files up to 100MB are supported for conversion." },
];

function ConvertPageInner() {
  const { t } = useTranslation();
  const params = useSearchParams();
  const { consume } = usePendingFile();

  const { file, uploadedId, status: uploadStatus, error: uploadError, upload, reset: resetUpload } =
    useSingleFileUpload();

  const [target, setTarget] = React.useState<FileType | null>((params.get("to") as FileType) || null);
  const [processing, setProcessing] = React.useState(false);
  const [processError, setProcessError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ProcessedFileResponse | null>(null);
  const [usageRefreshKey, setUsageRefreshKey] = React.useState(0);
  const [checkingUsage, setCheckingUsage] = React.useState(false);

  React.useEffect(() => {
    const pending = consume();
    if (pending) void upload(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sourceType = file ? inferFileType(file.name) : null;
  const availableTargets = sourceType ? (REAL_TARGETS[sourceType] ?? []) : [];

  React.useEffect(() => {
    if (sourceType && (!target || !availableTargets.includes(target))) {
      setTarget(availableTargets[0] ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceType]);

  const handleReset = () => {
    resetUpload();
    setProcessing(false);
    setProcessError(null);
    setResult(null);
    setTarget(null);
  };

  const handleConvert = async () => {
    if (!uploadedId || !sourceType || !target) return;

    setCheckingUsage(true);
    try {
      await checkInUsage("convert");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setCheckingUsage(false);
      setUsageRefreshKey((k) => k + 1);
      return;
    }
    setCheckingUsage(false);
    setUsageRefreshKey((k) => k + 1);

    setProcessing(true);
    setProcessError(null);
    try {
      const processed = await dispatchConversion(sourceType, target, uploadedId);
      setResult(processed);
    } catch (err) {
      setProcessError(getApiErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  const showError = uploadStatus === "error" || !!processError;
  const errorMessage = processError ?? uploadError ?? undefined;
  const retry = uploadStatus === "error" && file ? () => upload(file) : handleConvert;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={RefreshCw}
        title={t("tools.convert.title")}
        description={t("tools.convert.description")}
        gradientFrom="#5B7FFF"
        gradientTo="#7C5CFF"
      />

      <UsageBanner feature="convert" refreshKey={usageRefreshKey} />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {showError ? (
            <ToolErrorState description={errorMessage} onRetry={retry} />
          ) : result && target ? (
            <ResultCard
              fileName={result.outputName}
              fileType={target}
              summary={`Converted from ${sourceType?.toUpperCase()} to ${target.toUpperCase()}`}
              downloadUrl={buildDownloadUrl(result.downloadUrl)}
              onReset={handleReset}
            />
          ) : (
            <>
              <div>
                <p className="mb-3 text-sm font-medium text-foreground">1. Upload a file</p>
                {!file ? (
                  <Dropzone
                    multiple={false}
                    onFilesAdded={(files) => void upload(files[0])}
                    title="Drop a file to convert"
                    formats="PDF, DOCX, XLSX, PPTX, JPG, PNG up to 100MB"
                  />
                ) : (
                  <SelectedFileRow
                    name={file.name}
                    size={file.size}
                    onRemove={uploadStatus === "uploading" || processing ? undefined : handleReset}
                  />
                )}
              </div>

              {file && uploadStatus === "ready" && availableTargets.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-medium text-foreground">2. Choose output format</p>
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                    {availableTargets.map((f) => (
                      <button
                        key={f}
                        onClick={() => setTarget(f)}
                        disabled={processing}
                        aria-pressed={target === f}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          target === f
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-foreground hover:bg-muted"
                        )}
                      >
                        <FileIcon type={f} className="size-8" />
                        {FORMAT_LABELS[f]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {file && uploadStatus === "ready" && processing && (
                <p className="text-sm text-muted-foreground">Converting your file…</p>
              )}

              {file && uploadStatus === "ready" && !processing && target && (
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleConvert}
                  disabled={checkingUsage}
                  className="self-start"
                >
                  Convert to {FORMAT_LABELS[target]} <ArrowRight />
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ToolFaq items={faqs} />
      <RelatedTools currentId="convert" />
    </div>
  );
}

export default function ConvertPage() {
  return (
    <Suspense>
      <ConvertPageInner />
    </Suspense>
  );
}
