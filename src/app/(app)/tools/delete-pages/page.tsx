"use client";

import * as React from "react";
import { FileMinus, ArrowRight } from "lucide-react";

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
import { useRecordToolUsage } from "@/hooks/use-recent-tools";
import { usePendingFile } from "@/components/providers/pending-file-provider";
import { useSingleFileUpload } from "@/hooks/use-single-file-upload";
import { deletePages as deletePagesRequest } from "@/lib/api/deletePages";
import { buildDownloadUrl } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { ProcessedFileResponse } from "@/lib/api/types";

const faqs = [
  { q: "Can I preview before deleting?", a: "Yes — selected pages are clearly marked before you confirm the deletion." },
  { q: "Is the removal permanent?", a: "The download reflects the change; your original file is untouched unless you overwrite it yourself." },
  { q: "Do I need an account?", a: "No. Deleting pages works instantly with no sign-up required." },
];

export default function DeletePagesPage() {
  const { consume } = usePendingFile();
  useRecordToolUsage("delete-pages");

  const { file, uploadedId, pageCount, status: uploadStatus, error: uploadError, upload, reset: resetUpload } =
    useSingleFileUpload({ fetchPageCount: true });

  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [processing, setProcessing] = React.useState(false);
  const [processError, setProcessError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ProcessedFileResponse | null>(null);

  const pendingFile = React.useRef(consume());
  React.useEffect(() => {
    if (pendingFile.current) void upload(pendingFile.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remaining = (pageCount ?? 0) - selected.size;

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

  const handleDelete = async () => {
    if (!uploadedId) return;
    setProcessing(true);
    setProcessError(null);
    try {
      const processed = await deletePagesRequest(uploadedId, Array.from(selected).sort((a, b) => a - b));
      setResult(processed);
    } catch (err) {
      setProcessError(getApiErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  const showError = uploadStatus === "error" || !!processError;
  const errorMessage = processError ?? uploadError ?? undefined;
  const retry = uploadStatus === "error" && file ? () => upload(file) : handleDelete;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={FileMinus}
        title="Delete Pages"
        description="Remove unwanted pages from a document permanently."
        gradientFrom="#EF4444"
        gradientTo="#7C5CFF"
      />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {showError ? (
            <ToolErrorState description={errorMessage} onRetry={retry} />
          ) : result ? (
            <ResultCard
              fileName={result.outputName}
              fileType="pdf"
              summary={`${selected.size} page${selected.size === 1 ? "" : "s"} removed · ${remaining} pages remain`}
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
                title="Drop a PDF to remove pages from"
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
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        2. Select pages to delete ({selected.size} selected)
                      </p>
                      <span className="text-xs text-muted-foreground">{remaining} pages will remain</span>
                    </div>
                    <PageThumbGrid
                      totalPages={pageCount}
                      selected={selected}
                      onToggle={toggle}
                      tone="destructive"
                      disabled={processing}
                    />
                  </div>

                  {processing && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">Removing pages…</span>
                      </div>
                      <Progress value={70} />
                    </div>
                  )}

                  {!processing && (
                    <Button
                      variant="gradient"
                      size="lg"
                      onClick={handleDelete}
                      disabled={selected.size === 0 || remaining === 0}
                      className="self-start"
                    >
                      Delete {selected.size || ""} pages <ArrowRight />
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ToolFaq items={faqs} />
      <RelatedTools currentId="delete-pages" />
    </div>
  );
}
