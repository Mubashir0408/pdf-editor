"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { RotateCw, RotateCcw, ArrowRight } from "lucide-react";

import { ToolHero } from "@/components/tools/tool-hero";
import { ToolErrorState } from "@/components/tools/tool-error-state";
import { Dropzone } from "@/components/tools/dropzone";
import { SelectedFileRow } from "@/components/tools/selected-file-row";
import { ResultCard } from "@/components/tools/result-card";
import { PageThumbGrid } from "@/components/tools/page-thumb-grid";
import { ToolFaq } from "@/components/tools/tool-faq";
import { RelatedTools } from "@/components/tools/related-tools";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { usePendingFile } from "@/components/providers/pending-file-provider";
import { useSingleFileUpload } from "@/hooks/use-single-file-upload";
import { rotatePdf } from "@/lib/api/rotate";
import { buildDownloadUrl } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { ProcessedFileResponse } from "@/lib/api/types";

const faqs = [
  { q: "Can I rotate just one page?", a: "Yes — rotate individual pages, or use \"Rotate all\" to turn the whole document at once." },
  { q: "What angles are supported?", a: "Rotate in 90° increments, left or right, as many times as needed." },
  { q: "Do I need an account?", a: "No. Rotating works instantly with no sign-up required." },
];

export default function RotatePage() {
  const { t } = useTranslation();
  const { consume } = usePendingFile();

  const { file, uploadedId, pageCount, status: uploadStatus, error: uploadError, upload, reset: resetUpload } =
    useSingleFileUpload({ fetchPageCount: true });

  const [rotations, setRotations] = React.useState<Record<number, number>>({});
  const [processing, setProcessing] = React.useState(false);
  const [processError, setProcessError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ProcessedFileResponse | null>(null);

  React.useEffect(() => {
    const pending = consume();
    if (pending) void upload(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rotatedCount = Object.values(rotations).filter((r) => ((r % 360) + 360) % 360 !== 0).length;

  const handleReset = () => {
    resetUpload();
    setRotations({});
    setProcessing(false);
    setProcessError(null);
    setResult(null);
  };

  const rotatePage = (page: number, direction: "left" | "right") => {
    setRotations((prev) => ({
      ...prev,
      [page]: (prev[page] ?? 0) + (direction === "right" ? 90 : -90),
    }));
  };

  const rotateAll = (direction: "left" | "right") => {
    if (!pageCount) return;
    setRotations((prev) => {
      const next: Record<number, number> = { ...prev };
      for (let p = 1; p <= pageCount; p++) {
        next[p] = (prev[p] ?? 0) + (direction === "right" ? 90 : -90);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!uploadedId) return;
    setProcessing(true);
    setProcessError(null);
    try {
      const normalized: Record<string, number> = {};
      for (const [page, degreesValue] of Object.entries(rotations)) {
        const value = ((degreesValue % 360) + 360) % 360;
        if (value !== 0) normalized[page] = value;
      }
      const processed = await rotatePdf(uploadedId, normalized);
      setResult(processed);
    } catch (err) {
      setProcessError(getApiErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  const showError = uploadStatus === "error" || !!processError;
  const errorMessage = processError ?? uploadError ?? undefined;
  const retry = uploadStatus === "error" && file ? () => upload(file) : handleSave;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={RotateCw}
        title={t("tools.rotate.title")}
        description={t("tools.rotate.description")}
        gradientFrom="#36CFC9"
        gradientTo="#5B7FFF"
      />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {showError ? (
            <ToolErrorState description={errorMessage} onRetry={retry} />
          ) : result ? (
            <ResultCard
              fileName={result.outputName}
              fileType="pdf"
              summary={`${rotatedCount} page${rotatedCount === 1 ? "" : "s"} rotated`}
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
                title="Drop a PDF to rotate"
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

              {uploadStatus === "uploading" || !pageCount ? (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      2. Rotate individual pages or all at once
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rotateAll("left")}
                        disabled={processing}
                      >
                        <RotateCcw /> Rotate all
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rotateAll("right")}
                        disabled={processing}
                      >
                        <RotateCw /> Rotate all
                      </Button>
                    </div>
                  </div>

                  <PageThumbGrid
                    totalPages={pageCount}
                    selected={
                      new Set(
                        Object.keys(rotations)
                          .map(Number)
                          .filter((p) => ((rotations[p]! % 360) + 360) % 360 !== 0)
                      )
                    }
                    onToggle={() => {}}
                    rotations={rotations}
                    onRotate={rotatePage}
                    disabled={processing}
                  />

                  {processing && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">Rotating pages…</span>
                      </div>
                      <Progress value={70} />
                    </div>
                  )}

                  {!processing && (
                    <Button
                      variant="gradient"
                      size="lg"
                      onClick={handleSave}
                      disabled={rotatedCount === 0}
                      className="self-start"
                    >
                      Save rotation <ArrowRight />
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ToolFaq items={faqs} />
      <RelatedTools currentId="rotate" />
    </div>
  );
}
