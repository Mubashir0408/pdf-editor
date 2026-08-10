"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { FileOutput, ArrowRight } from "lucide-react";

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
import { UsageBanner } from "@/components/shared/usage-banner";
import { usePendingFile } from "@/components/providers/pending-file-provider";
import { useSingleFileUpload } from "@/hooks/use-single-file-upload";
import { extractPages as extractPagesRequest } from "@/lib/api/extractPages";
import { buildDownloadUrl } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { ProcessedFileResponse } from "@/lib/api/types";

const faqs = [
  { q: "How do I select which pages to extract?", a: "Click any page thumbnail to select it — selected pages are highlighted and combined into a new PDF." },
  { q: "Can I extract non-consecutive pages?", a: "Yes, select any combination of pages in any order." },
  { q: "Do I need an account?", a: "No. Extracting pages works instantly with no sign-up required." },
];

export default function ExtractPagesPage() {
  const { t } = useTranslation();
  const { consume } = usePendingFile();

  const { file, uploadedId, pageCount, status: uploadStatus, error: uploadError, upload, reset: resetUpload } =
    useSingleFileUpload({ fetchPageCount: true });

  const [selected, setSelected] = React.useState<Set<number>>(new Set());
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
    setSelected(new Set());
    setProcessing(false);
    setProcessError(null);
    setResult(null);
  };

  const toggle = (page: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const handleExtract = async () => {
    if (!uploadedId) return;
    setProcessing(true);
    setProcessError(null);
    try {
      const processed = await extractPagesRequest(uploadedId, Array.from(selected).sort((a, b) => a - b));
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
  const retry = uploadStatus === "error" && file ? () => upload(file) : handleExtract;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={FileOutput}
        title={t("tools.extractPages.title")}
        description={t("tools.extractPages.description")}
        gradientFrom="#5B7FFF"
        gradientTo="#22C55E"
      />

      <UsageBanner feature="extract-pages" refreshKey={usageRefreshKey} />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {showError ? (
            <ToolErrorState description={errorMessage} onRetry={retry} />
          ) : result ? (
            <ResultCard
              fileName={result.outputName}
              fileType="pdf"
              summary={`${selected.size} page${selected.size === 1 ? "" : "s"} extracted into a new PDF`}
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
                title="Drop a PDF to extract pages from"
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
                  <div>
                    <p className="mb-3 text-sm font-medium text-foreground">
                      2. Select pages to extract ({selected.size} of {pageCount} selected)
                    </p>
                    <PageThumbGrid
                      totalPages={pageCount}
                      selected={selected}
                      onToggle={toggle}
                      tone="primary"
                      disabled={processing}
                    />
                  </div>

                  {processing && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">Extracting pages…</span>
                      </div>
                      <Progress value={70} />
                    </div>
                  )}

                  {!processing && (
                    <Button
                      variant="gradient"
                      size="lg"
                      onClick={handleExtract}
                      disabled={selected.size === 0}
                      className="self-start"
                    >
                      Extract {selected.size || ""} pages <ArrowRight />
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ToolFaq items={faqs} />
      <RelatedTools currentId="extract" />
    </div>
  );
}
