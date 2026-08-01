"use client";

import * as React from "react";
import { FileMinus, ArrowRight } from "lucide-react";

import { ToolHero } from "@/components/tools/tool-hero";
import { ToolErrorState } from "@/components/tools/tool-error-state";
import { Dropzone } from "@/components/tools/dropzone";
import { SelectedFileRow } from "@/components/tools/selected-file-row";
import { ResultCard } from "@/components/tools/result-card";
import { PageThumbGrid } from "@/components/tools/page-thumb-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSimulatedTask } from "@/hooks/use-simulated-task";

const TOTAL_PAGES = 14;

export default function DeletePagesPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const { status, progress, start, retry, reset } = useSimulatedTask(1800, { failureRate: 0.15 });

  const remaining = TOTAL_PAGES - selected.size;

  const handleReset = () => {
    setFile(null);
    setSelected(new Set());
    reset();
  };

  const toggle = (page: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

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
          {status === "error" ? (
            <ToolErrorState
              description="We couldn't remove these pages. Please try again."
              onRetry={retry}
            />
          ) : status === "done" && file ? (
            <ResultCard
              fileName={file.name}
              fileType="pdf"
              summary={`${selected.size} page${selected.size === 1 ? "" : "s"} removed · ${remaining} pages remain`}
              onReset={handleReset}
            />
          ) : !file ? (
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">1. Upload a PDF</p>
              <Dropzone
                multiple={false}
                accept=".pdf"
                onFilesAdded={(files) => setFile(files[0])}
                title="Drop a PDF to remove pages from"
                formats="PDF files only"
              />
            </div>
          ) : (
            <>
              <SelectedFileRow
                name={file.name}
                size={file.size}
                onRemove={status === "processing" ? undefined : handleReset}
              />

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    2. Select pages to delete ({selected.size} selected)
                  </p>
                  <span className="text-xs text-muted-foreground">{remaining} pages will remain</span>
                </div>
                <PageThumbGrid
                  totalPages={TOTAL_PAGES}
                  selected={selected}
                  onToggle={toggle}
                  tone="destructive"
                  disabled={status === "processing"}
                />
              </div>

              {status === "processing" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">Removing pages…</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {status !== "processing" && (
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={start}
                  disabled={selected.size === 0 || remaining === 0}
                  className="self-start"
                >
                  Delete {selected.size || ""} pages <ArrowRight />
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
