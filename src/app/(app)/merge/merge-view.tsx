"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { Layers, ArrowRight } from "lucide-react";
import { Reorder } from "framer-motion";

import { ToolHero } from "@/components/tools/tool-hero";
import { ToolErrorState } from "@/components/tools/tool-error-state";
import { Dropzone } from "@/components/tools/dropzone";
import { SelectedFileRow } from "@/components/tools/selected-file-row";
import { ResultCard } from "@/components/tools/result-card";
import { ToolFaq } from "@/components/tools/tool-faq";
import { RelatedTools } from "@/components/tools/related-tools";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UsageBanner } from "@/components/shared/usage-banner";
import { usePendingFile } from "@/components/providers/pending-file-provider";
import { uploadFile } from "@/lib/api/upload";
import { mergePdfs } from "@/lib/api/merge";
import { getApiErrorMessage } from "@/lib/api/errors";
import { buildDownloadUrl } from "@/lib/api-client";
import type { ProcessedFileResponse } from "@/lib/api/types";

interface MergeFile {
  id: string;
  file: File;
  /** Set once this file has finished uploading and the backend has assigned it an id. */
  uploadedId?: string;
  /** 0-100 while uploading. */
  progress: number;
}

type MergeStatus = "idle" | "uploading" | "merging" | "done" | "error";

const faqs = [
  { q: "How many PDFs can I merge at once?", a: "Up to 20 files per merge, in any order you choose." },
  { q: "Can I reorder the files before merging?", a: "Yes — drag and drop each file into the order you want the final PDF to follow." },
  { q: "Do I need an account?", a: "No. Merging works instantly with no sign-up required." },
];

let mergeFileCounter = 0;
function nextClientId() {
  mergeFileCounter += 1;
  return `merge-file-${mergeFileCounter}`;
}

export default function MergePage() {
  const { t } = useTranslation();
  const { consume } = usePendingFile();

  const [files, setFiles] = React.useState<MergeFile[]>([]);
  React.useEffect(() => {
    const pending = consume();
    if (pending) setFiles([{ id: nextClientId(), file: pending, progress: 0 }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [status, setStatus] = React.useState<MergeStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ProcessedFileResponse | null>(null);
  const [usageRefreshKey, setUsageRefreshKey] = React.useState(0);

  const isBusy = status === "uploading" || status === "merging";

  const handleFilesAdded = (added: File[]) => {
    setFiles((prev) => [...prev, ...added.map((file) => ({ id: nextClientId(), file, progress: 0 }))]);
  };

  const handleReset = () => {
    setFiles([]);
    setStatus("idle");
    setErrorMessage(null);
    setResult(null);
  };

  const updateProgress = (id: string, progress: number) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, progress } : f)));
  };

  const handleMerge = async () => {
    setStatus("uploading");
    setErrorMessage(null);

    try {
      // Files already uploaded from a previous failed attempt are reused
      // rather than re-uploaded, so retrying after a merge-step failure
      // doesn't redo work that already succeeded.
      const uploaded = await Promise.all(
        files.map(async (mergeFile) => {
          if (mergeFile.uploadedId) return mergeFile;
          const response = await uploadFile(mergeFile.file, (percent) =>
            updateProgress(mergeFile.id, percent)
          );
          return { ...mergeFile, uploadedId: response.id, progress: 100 };
        })
      );
      setFiles(uploaded);

      setStatus("merging");
      const fileIds = uploaded.map((f) => f.uploadedId!);
      const merged = await mergePdfs(fileIds);

      setResult(merged);
      setStatus("done");
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
      setStatus("error");
    } finally {
      setUsageRefreshKey((k) => k + 1);
    }
  };

  const overallProgress =
    status === "merging"
      ? 95
      : Math.round(files.reduce((sum, f) => sum + f.progress, 0) / Math.max(files.length, 1));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={Layers}
        title={t("tools.merge.title")}
        description={t("tools.merge.description")}
        gradientFrom="#7C5CFF"
        gradientTo="#B45CFF"
      />

      <UsageBanner feature="merge" refreshKey={usageRefreshKey} />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {status === "error" ? (
            <ToolErrorState description={errorMessage ?? undefined} onRetry={handleMerge} />
          ) : status === "done" && result ? (
            <ResultCard
              fileName={result.outputName}
              fileType="pdf"
              summary={`${files.length} files combined into one PDF`}
              downloadUrl={buildDownloadUrl(result.downloadUrl)}
              onReset={handleReset}
            />
          ) : (
            <>
              <div>
                <p className="mb-3 text-sm font-medium text-foreground">1. Add PDFs to merge</p>
                <Dropzone
                  onFilesAdded={handleFilesAdded}
                  accept=".pdf"
                  title="Drop PDFs here"
                  formats="PDF files only, up to 20 files"
                />
              </div>

              {files.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      2. Drag to reorder ({files.length} file{files.length > 1 ? "s" : ""})
                    </p>
                  </div>
                  <Reorder.Group
                    axis="y"
                    values={files}
                    onReorder={setFiles}
                    className="flex flex-col gap-2.5"
                  >
                    {files.map((f, i) => (
                      <Reorder.Item key={f.id} value={f} dragListener={!isBusy}>
                        <SelectedFileRow
                          name={f.file.name}
                          size={f.file.size}
                          index={i}
                          draggable={!isBusy}
                          progress={status === "uploading" ? f.progress : undefined}
                          onRemove={
                            isBusy
                              ? undefined
                              : () => setFiles((prev) => prev.filter((x) => x.id !== f.id))
                          }
                        />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>
              )}

              {isBusy && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      {status === "uploading" ? "Uploading…" : "Merging on the server…"}
                    </span>
                    <span className="text-muted-foreground">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} />
                </div>
              )}

              {files.length >= 2 && !isBusy && (
                <Button variant="gradient" size="lg" onClick={handleMerge} className="self-start">
                  Merge {files.length} files <ArrowRight />
                </Button>
              )}
              {files.length === 1 && (
                <p className="text-sm text-muted-foreground">Add at least one more file to merge.</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ToolFaq items={faqs} />
      <RelatedTools currentId="merge" />
    </div>
  );
}
