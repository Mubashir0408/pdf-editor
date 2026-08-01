"use client";

import * as React from "react";
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
import { useSimulatedTask } from "@/hooks/use-simulated-task";
import { useRecordToolUsage } from "@/hooks/use-recent-tools";
import { usePendingFile } from "@/components/providers/pending-file-provider";

const TOTAL_PAGES = 12;

const faqs = [
  { q: "Can I rotate just one page?", a: "Yes — rotate individual pages, or use \"Rotate all\" to turn the whole document at once." },
  { q: "What angles are supported?", a: "Rotate in 90° increments, left or right, as many times as needed." },
  { q: "Do I need an account?", a: "No. Rotating works instantly with no sign-up required." },
];

export default function RotatePage() {
  const { consume } = usePendingFile();
  useRecordToolUsage("rotate");
  const [file, setFile] = React.useState<File | null>(() => consume());
  const [rotations, setRotations] = React.useState<Record<number, number>>({});
  const { status, progress, start, retry, reset } = useSimulatedTask(1800, { failureRate: 0.15 });

  const rotatedCount = Object.values(rotations).filter((r) => r % 360 !== 0).length;

  const handleReset = () => {
    setFile(null);
    setRotations({});
    reset();
  };

  const rotatePage = (page: number, direction: "left" | "right") => {
    setRotations((prev) => ({
      ...prev,
      [page]: (prev[page] ?? 0) + (direction === "right" ? 90 : -90),
    }));
  };

  const rotateAll = (direction: "left" | "right") => {
    setRotations((prev) => {
      const next: Record<number, number> = { ...prev };
      for (let p = 1; p <= TOTAL_PAGES; p++) {
        next[p] = (prev[p] ?? 0) + (direction === "right" ? 90 : -90);
      }
      return next;
    });
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={RotateCw}
        title="Rotate PDF"
        description="Fix sideways or upside-down pages in seconds."
        gradientFrom="#36CFC9"
        gradientTo="#5B7FFF"
      />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {status === "error" ? (
            <ToolErrorState
              description="We couldn't rotate this file. Please try again."
              onRetry={retry}
            />
          ) : status === "done" && file ? (
            <ResultCard
              fileName={file.name}
              fileType="pdf"
              summary={`${rotatedCount} page${rotatedCount === 1 ? "" : "s"} rotated`}
              onReset={handleReset}
            />
          ) : !file ? (
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">1. Upload a PDF</p>
              <Dropzone
                multiple={false}
                accept=".pdf"
                onFilesAdded={(files) => setFile(files[0])}
                title="Drop a PDF to rotate"
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

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  2. Rotate individual pages or all at once
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rotateAll("left")}
                    disabled={status === "processing"}
                  >
                    <RotateCcw /> Rotate all
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rotateAll("right")}
                    disabled={status === "processing"}
                  >
                    <RotateCw /> Rotate all
                  </Button>
                </div>
              </div>

              <PageThumbGrid
                totalPages={TOTAL_PAGES}
                selected={new Set(Object.keys(rotations).map(Number).filter((p) => rotations[p] % 360 !== 0))}
                onToggle={() => {}}
                rotations={rotations}
                onRotate={rotatePage}
                disabled={status === "processing"}
              />

              {status === "processing" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">Rotating pages…</span>
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
                  disabled={rotatedCount === 0}
                  className="self-start"
                >
                  Save rotation <ArrowRight />
                </Button>
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
