"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { MonitorPlay, ArrowRight } from "lucide-react";

import { ToolHero } from "@/components/tools/tool-hero";
import { ToolErrorState } from "@/components/tools/tool-error-state";
import { Dropzone } from "@/components/tools/dropzone";
import { SelectedFileRow } from "@/components/tools/selected-file-row";
import { ResultCard } from "@/components/tools/result-card";
import { ToolFaq } from "@/components/tools/tool-faq";
import { RelatedTools } from "@/components/tools/related-tools";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsageBanner } from "@/components/shared/usage-banner";
import { usePendingFile } from "@/components/providers/pending-file-provider";
import { useSingleFileUpload } from "@/hooks/use-single-file-upload";
import { convertPowerpointToPdf } from "@/lib/api/powerpointToPdf";
import { buildDownloadUrl } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { ProcessedFileResponse } from "@/lib/api/types";

const faqs = [
  { q: "Does each slide become a PDF page?", a: "Yes — every slide converts to one page, in its original order and aspect ratio." },
  { q: "Are images and text positioned correctly?", a: "Text boxes and pictures keep their original position and size. Charts, tables, and animations are not reproduced." },
  { q: "Do I need an account?", a: "No. Converting works instantly with no sign-up required." },
];

export default function PowerpointToPdfPage() {
  const { t } = useTranslation();
  const { consume } = usePendingFile();

  const { file, uploadedId, status: uploadStatus, error: uploadError, upload, reset: resetUpload } =
    useSingleFileUpload();

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
      const processed = await convertPowerpointToPdf(uploadedId);
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
        icon={MonitorPlay}
        title={t("tools.pptToPdf.title")}
        description={t("tools.pptToPdf.description")}
        gradientFrom="#F59E0B"
        gradientTo="#EF4444"
      />

      <UsageBanner feature="powerpoint-to-pdf" refreshKey={usageRefreshKey} />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {showError ? (
            <ToolErrorState description={errorMessage} onRetry={retry} />
          ) : result ? (
            <ResultCard
              fileName={result.outputName}
              fileType="pdf"
              summary="Converted to PDF"
              downloadUrl={buildDownloadUrl(result.downloadUrl)}
              onReset={handleReset}
            />
          ) : !file ? (
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">1. Upload a presentation</p>
              <Dropzone
                multiple={false}
                accept=".pptx"
                onFilesAdded={(files) => void upload(files[0])}
                title="Drop a .pptx file here"
                formats="PowerPoint (.pptx) files only"
              />
            </div>
          ) : (
            <>
              <SelectedFileRow
                name={file.name}
                size={file.size}
                onRemove={uploadStatus === "uploading" || processing ? undefined : handleReset}
              />

              {uploadStatus === "ready" && !processing && (
                <Button variant="gradient" size="lg" onClick={handleConvert} className="self-start">
                  Convert to PDF <ArrowRight />
                </Button>
              )}
              {processing && (
                <p className="text-sm text-muted-foreground">Converting your presentation…</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ToolFaq items={faqs} />
      <RelatedTools currentId="ppt-to-pdf" />
    </div>
  );
}
