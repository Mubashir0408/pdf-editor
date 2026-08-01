"use client";

import * as React from "react";
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
import { useSimulatedTask } from "@/hooks/use-simulated-task";
import { useRecordToolUsage } from "@/hooks/use-recent-tools";
import { usePendingFile } from "@/components/providers/pending-file-provider";

const TOTAL_PAGES = 14;

const faqs = [
  { q: "How do I select which pages to extract?", a: "Click any page thumbnail to select it — selected pages are highlighted and combined into a new PDF." },
  { q: "Can I extract non-consecutive pages?", a: "Yes, select any combination of pages in any order." },
  { q: "Do I need an account?", a: "No. Extracting pages works instantly with no sign-up required." },
];

export default function ExtractPagesPage() {
  const { consume } = usePendingFile();
  useRecordToolUsage("extract");
  const [file, setFile] = React.useState<File | null>(() => consume());
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const { status, progress, start, retry, reset } = useSimulatedTask(1800, { failureRate: 0.15 });

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
        icon={FileOutput}
        title="Extract Pages"
        description="Pull specific pages out of a document into a new file."
        gradientFrom="#5B7FFF"
        gradientTo="#22C55E"
      />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {status === "error" ? (
            <ToolErrorState
              description="We couldn't extract these pages. Please try again."
              onRetry={retry}
            />
          ) : status === "done" && file ? (
            <ResultCard
              fileName={`${file.name.replace(/\.pdf$/i, "")} - Extracted.pdf`}
              fileType="pdf"
              summary={`${selected.size} page${selected.size === 1 ? "" : "s"} extracted into a new PDF`}
              onReset={handleReset}
            />
          ) : !file ? (
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">1. Upload a PDF</p>
              <Dropzone
                multiple={false}
                accept=".pdf"
                onFilesAdded={(files) => setFile(files[0])}
                title="Drop a PDF to extract pages from"
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
                <p className="mb-3 text-sm font-medium text-foreground">
                  2. Select pages to extract ({selected.size} of {TOTAL_PAGES} selected)
                </p>
                <PageThumbGrid
                  totalPages={TOTAL_PAGES}
                  selected={selected}
                  onToggle={toggle}
                  tone="primary"
                  disabled={status === "processing"}
                />
              </div>

              {status === "processing" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">Extracting pages…</span>
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
                  disabled={selected.size === 0}
                  className="self-start"
                >
                  Extract {selected.size || ""} pages <ArrowRight />
                </Button>
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
