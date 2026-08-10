"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RefreshCw, ArrowRight } from "lucide-react";

import { ToolHero } from "@/components/tools/tool-hero";
import { Dropzone } from "@/components/tools/dropzone";
import { SelectedFileRow, inferFileType } from "@/components/tools/selected-file-row";
import { ResultCard } from "@/components/tools/result-card";
import { ToolFaq } from "@/components/tools/tool-faq";
import { RelatedTools } from "@/components/tools/related-tools";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileIcon } from "@/components/shared/file-icon";
import { UsageBanner } from "@/components/shared/usage-banner";
import { useSimulatedTask } from "@/hooks/use-simulated-task";
import { usePendingFile } from "@/components/providers/pending-file-provider";
import { checkInUsage } from "@/lib/api/usage";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type { FileType } from "@/lib/types";

const ALL_FORMATS: { id: FileType; label: string }[] = [
  { id: "pdf", label: "PDF" },
  { id: "docx", label: "Word" },
  { id: "xlsx", label: "Excel" },
  { id: "pptx", label: "PowerPoint" },
  { id: "jpg", label: "JPG" },
  { id: "png", label: "PNG" },
  { id: "txt", label: "Text" },
];

const faqs = [
  { q: "Is it safe to convert my files here?", a: "Yes — files are processed for your conversion only and are never shared. This demo runs entirely in your browser with mock processing." },
  { q: "What formats can I convert between?", a: "PDF, Word, Excel, PowerPoint, JPG, PNG, and plain text — pick any source file and choose your target format." },
  { q: "Do I need an account?", a: "No. Every tool works instantly with no sign-up required." },
  { q: "Is there a file size limit?", a: "Files up to 100MB are supported for conversion." },
];

function ConvertPageInner() {
  const { t } = useTranslation();
  const params = useSearchParams();
  const { consume } = usePendingFile();
  const [file, setFile] = React.useState<File | null>(null);
  React.useEffect(() => {
    const pending = consume();
    if (pending) setFile(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [target, setTarget] = React.useState<FileType>(
    (params.get("to") as FileType) || "pdf"
  );
  const { status, progress, start, reset } = useSimulatedTask(2400);
  const [usageRefreshKey, setUsageRefreshKey] = React.useState(0);
  const [checkingUsage, setCheckingUsage] = React.useState(false);

  const sourceType = file ? inferFileType(file.name) : null;

  const handleReset = () => {
    setFile(null);
    reset();
  };

  const handleStart = async () => {
    setCheckingUsage(true);
    try {
      await checkInUsage("convert");
      start();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setCheckingUsage(false);
      setUsageRefreshKey((k) => k + 1);
    }
  };

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
          {status === "done" && file ? (
            <ResultCard
              fileName={file.name.replace(/\.[^.]+$/, `.${target}`)}
              fileType={target}
              summary={`Converted from ${sourceType?.toUpperCase()} to ${target.toUpperCase()}`}
              onReset={handleReset}
            />
          ) : (
            <>
              <div>
                <p className="mb-3 text-sm font-medium text-foreground">1. Upload a file</p>
                {!file ? (
                  <Dropzone
                    multiple={false}
                    onFilesAdded={(files) => setFile(files[0])}
                    title="Drop a file to convert"
                    formats="PDF, DOCX, XLSX, PPTX, JPG, PNG up to 100MB"
                  />
                ) : (
                  <SelectedFileRow
                    name={file.name}
                    size={file.size}
                    onRemove={status === "processing" ? undefined : handleReset}
                  />
                )}
              </div>

              {file && (
                <div>
                  <p className="mb-3 text-sm font-medium text-foreground">2. Choose output format</p>
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                    {ALL_FORMATS.filter((f) => f.id !== sourceType).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setTarget(f.id)}
                        disabled={status === "processing"}
                        aria-pressed={target === f.id}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          target === f.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-foreground hover:bg-muted"
                        )}
                      >
                        <FileIcon type={f.id} className="size-8" />
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {file && status === "processing" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">Converting…</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {file && status !== "processing" && (
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleStart}
                  disabled={checkingUsage}
                  className="self-start"
                >
                  Convert to {target.toUpperCase()} <ArrowRight />
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
