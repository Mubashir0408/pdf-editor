"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon, ArrowRight } from "lucide-react";
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
import { usePendingFile } from "@/components/providers/pending-file-provider";
import { uploadFile } from "@/lib/api/upload";
import { convertImageToPdf } from "@/lib/api/imageToPdf";
import { getApiErrorMessage } from "@/lib/api/errors";
import { buildDownloadUrl } from "@/lib/api-client";
import type { ProcessedFileResponse } from "@/lib/api/types";

interface ImageFile {
  id: string;
  file: File;
  uploadedId?: string;
  progress: number;
}

type Status = "idle" | "uploading" | "converting" | "done" | "error";

const faqs = [
  { q: "Can I combine multiple images into one PDF?", a: "Yes — add as many JPG or PNG images as you like; each becomes its own page, in the order you arrange them." },
  { q: "What image formats are supported?", a: "JPG and PNG, up to 30 images per conversion." },
  { q: "Do I need an account?", a: "No. Converting works instantly with no sign-up required." },
];

let imageFileCounter = 0;
function nextClientId() {
  imageFileCounter += 1;
  return `image-file-${imageFileCounter}`;
}

export default function ImageToPdfPage() {
  const { t } = useTranslation();
  const { consume } = usePendingFile();

  const [files, setFiles] = React.useState<ImageFile[]>([]);
  React.useEffect(() => {
    const pending = consume();
    if (pending) setFiles([{ id: nextClientId(), file: pending, progress: 0 }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ProcessedFileResponse | null>(null);

  const isBusy = status === "uploading" || status === "converting";

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

  const handleConvert = async () => {
    setStatus("uploading");
    setErrorMessage(null);

    try {
      const uploaded = await Promise.all(
        files.map(async (imageFile) => {
          if (imageFile.uploadedId) return imageFile;
          const response = await uploadFile(imageFile.file, (percent) =>
            updateProgress(imageFile.id, percent)
          );
          return { ...imageFile, uploadedId: response.id, progress: 100 };
        })
      );
      setFiles(uploaded);

      setStatus("converting");
      const fileIds = uploaded.map((f) => f.uploadedId!);
      const converted = await convertImageToPdf(fileIds);

      setResult(converted);
      setStatus("done");
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
      setStatus("error");
    }
  };

  const overallProgress =
    status === "converting"
      ? 95
      : Math.round(files.reduce((sum, f) => sum + f.progress, 0) / Math.max(files.length, 1));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={ImageIcon}
        title={t("tools.imageToPdf.title")}
        description={t("tools.imageToPdf.description")}
        gradientFrom="#7C5CFF"
        gradientTo="#36CFC9"
      />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {status === "error" ? (
            <ToolErrorState description={errorMessage ?? undefined} onRetry={handleConvert} />
          ) : status === "done" && result ? (
            <ResultCard
              fileName={result.outputName}
              fileType="pdf"
              summary={`${files.length} image${files.length > 1 ? "s" : ""} combined into one PDF`}
              downloadUrl={buildDownloadUrl(result.downloadUrl)}
              onReset={handleReset}
            />
          ) : (
            <>
              <div>
                <p className="mb-3 text-sm font-medium text-foreground">1. Add images</p>
                <Dropzone
                  onFilesAdded={handleFilesAdded}
                  accept=".jpg,.jpeg,.png"
                  title="Drop images here"
                  formats="JPG or PNG, up to 30 images"
                />
              </div>

              {files.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      2. Drag to reorder ({files.length} image{files.length > 1 ? "s" : ""})
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
                      {status === "uploading" ? "Uploading…" : "Converting on the server…"}
                    </span>
                    <span className="text-muted-foreground">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} />
                </div>
              )}

              {files.length >= 1 && !isBusy && (
                <Button variant="gradient" size="lg" onClick={handleConvert} className="self-start">
                  Convert {files.length} image{files.length > 1 ? "s" : ""} to PDF <ArrowRight />
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ToolFaq items={faqs} />
      <RelatedTools currentId="image-to-pdf" />
    </div>
  );
}
