"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw, ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Dropzone } from "@/components/tools/dropzone";
import { SelectedFileRow, inferFileType } from "@/components/tools/selected-file-row";
import { ResultCard } from "@/components/tools/result-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileIcon } from "@/components/shared/file-icon";
import { useSimulatedTask } from "@/hooks/use-simulated-task";
import { useRecentFiles } from "@/hooks/use-queries";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
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

function ConvertPageInner() {
  const params = useSearchParams();
  const [file, setFile] = React.useState<File | null>(null);
  const [target, setTarget] = React.useState<FileType>(
    (params.get("to") as FileType) || "pdf"
  );
  const { status, progress, start, reset } = useSimulatedTask(2400);
  const { data: recentFiles, isLoading } = useRecentFiles();

  const sourceType = file ? inferFileType(file.name) : null;

  const handleReset = () => {
    setFile(null);
    reset();
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        icon={RefreshCw}
        title="Convert files"
        description="Transform documents between PDF, Word, Excel, PowerPoint, and image formats."
      />

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
                        className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition-colors ${
                          target === f.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-foreground hover:bg-muted"
                        }`}
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
                <Button variant="gradient" size="lg" onClick={start} className="self-start">
                  Convert to {target.toUpperCase()} <ArrowRight />
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="py-5">
        <CardHeader>
          <CardTitle className="text-base">Recent conversions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border p-0">
          {isLoading || !recentFiles
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <Skeleton className="size-9 rounded-xl" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))
            : recentFiles.slice(0, 4).map((f) => (
                <div key={f.id} className="flex items-center gap-3 px-5 py-3">
                  <FileIcon type={f.type} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(f.size)} · {formatRelativeTime(f.updatedAt)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              ))}
        </CardContent>
      </Card>
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
