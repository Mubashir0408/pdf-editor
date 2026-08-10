"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { ImageDown, ArrowRight } from "lucide-react";

import { ToolHero } from "@/components/tools/tool-hero";
import { ToolErrorState } from "@/components/tools/tool-error-state";
import { Dropzone } from "@/components/tools/dropzone";
import { SelectedFileRow, inferFileType } from "@/components/tools/selected-file-row";
import { ResultCard } from "@/components/tools/result-card";
import { ToolFaq } from "@/components/tools/tool-faq";
import { RelatedTools } from "@/components/tools/related-tools";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsageBanner } from "@/components/shared/usage-banner";
import { usePendingFile } from "@/components/providers/pending-file-provider";
import { useSingleFileUpload } from "@/hooks/use-single-file-upload";
import { convertPdfToImage } from "@/lib/api/pdfToImage";
import { buildDownloadUrl } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type { ProcessedFileResponse } from "@/lib/api/types";

const faqs = [
  { q: "What do I get if my PDF has multiple pages?", a: "Each page becomes its own image; a multi-page PDF downloads as a zip with one image per page." },
  { q: "PNG or JPG — which should I pick?", a: "PNG gives sharper text and graphics; JPG produces smaller files. Either works well for most documents." },
  { q: "Do I need an account?", a: "No. Converting works instantly with no sign-up required." },
];

export default function PdfToImagePage() {
  const { t } = useTranslation();
  const { consume } = usePendingFile();

  const { file, uploadedId, status: uploadStatus, error: uploadError, upload, reset: resetUpload } =
    useSingleFileUpload();

  const [format, setFormat] = React.useState<"png" | "jpg">("png");
  const [processing, setProcessing] = React.useState(false);
  const [processError, setProcessError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ProcessedFileResponse | null>(null);
  const [usageRefreshKey, setUsageRefreshKey] = React.useState(0);

  React.useEffect(() => {
    const pending = consume();
    if (pending) void upload(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    resetUpload();
    setProcessing(false);
    setProcessError(null);
    setResult(null);
  };

  const handleConvert = async () => {
    if (!uploadedId) return;
    setProcessing(true);
    setProcessError(null);
    try {
      const processed = await convertPdfToImage(uploadedId, format);
      setResult(processed);
    } catch (err) {
      setProcessError(getApiErrorMessage(err));
    } finally {
      setProcessing(false);
      setUsageRefreshKey((k) => k + 1);
    }
  };

  const showError = uploadStatus === "error" || !!processError;
  const errorMessage = processError ?? uploadError ?? undefined;
  const retry = uploadStatus === "error" && file ? () => upload(file) : handleConvert;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={ImageDown}
        title={t("tools.pdfToImage.title")}
        description={t("tools.pdfToImage.description")}
        gradientFrom="#F59E0B"
        gradientTo="#7C5CFF"
      />

      <UsageBanner feature="pdf-to-image" refreshKey={usageRefreshKey} />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {showError ? (
            <ToolErrorState description={errorMessage} onRetry={retry} />
          ) : result ? (
            <ResultCard
              fileName={result.outputName}
              fileType={inferFileType(result.outputName)}
              summary="Converted to image"
              downloadUrl={buildDownloadUrl(result.downloadUrl)}
              onReset={handleReset}
            />
          ) : !file ? (
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">1. Upload a PDF</p>
              <Dropzone
                multiple={false}
                accept=".pdf"
                onFilesAdded={(files) => void upload(files[0])}
                title="Drop a PDF here"
                formats="PDF files only"
              />
            </div>
          ) : (
            <>
              <SelectedFileRow
                name={file.name}
                size={file.size}
                onRemove={uploadStatus === "uploading" || processing ? undefined : handleReset}
              />

              {uploadStatus === "ready" && (
                <div>
                  <p className="mb-3 text-sm font-medium text-foreground">2. Choose image format</p>
                  <div className="flex gap-2.5">
                    {(["png", "jpg"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        disabled={processing}
                        aria-pressed={format === f}
                        className={cn(
                          "rounded-xl border px-4 py-2 text-sm font-medium uppercase outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          format === f
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-foreground hover:bg-muted"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {uploadStatus === "ready" && !processing && (
                <Button variant="gradient" size="lg" onClick={handleConvert} className="self-start">
                  Convert to {format.toUpperCase()} <ArrowRight />
                </Button>
              )}
              {processing && (
                <p className="text-sm text-muted-foreground">Converting your PDF…</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ToolFaq items={faqs} />
      <RelatedTools currentId="pdf-to-image" />
    </div>
  );
}
