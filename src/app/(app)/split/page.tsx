"use client";

import * as React from "react";
import { Scissors, ArrowRight, FileText } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Dropzone } from "@/components/tools/dropzone";
import { ResultCard } from "@/components/tools/result-card";
import { ToolFaq } from "@/components/tools/tool-faq";
import { RelatedTools } from "@/components/tools/related-tools";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useSimulatedTask } from "@/hooks/use-simulated-task";
import { useRecordToolUsage } from "@/hooks/use-recent-tools";
import { usePendingFile } from "@/components/providers/pending-file-provider";

const faqs = [
  { q: "How do I choose which pages to split out?", a: "Type page ranges like \"1-4, 7, 10-12\" or click pages directly in the preview grid." },
  { q: "What format is the result?", a: "Selected pages are packaged into a downloadable file — a single PDF or a zip if you split into multiple pieces." },
  { q: "Do I need an account?", a: "No. Splitting works instantly with no sign-up required." },
];

function parseRanges(input: string, maxPage: number): Set<number> {
  const pages = new Set<number>();
  input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((chunk) => {
      const match = chunk.match(/^(\d+)(?:-(\d+))?$/);
      if (!match) return;
      const start = Math.max(1, parseInt(match[1], 10));
      const end = match[2] ? Math.min(maxPage, parseInt(match[2], 10)) : start;
      for (let p = start; p <= Math.min(end, maxPage); p++) pages.add(p);
    });
  return pages;
}

export default function SplitPage() {
  const { consume } = usePendingFile();
  useRecordToolUsage("split");
  const [file, setFile] = React.useState<File | null>(() => consume());
  const [range, setRange] = React.useState("1-4, 7, 10-12");
  const totalPages = 16;
  const { status, progress, start, reset } = useSimulatedTask(2000);

  const selectedPages = React.useMemo(() => parseRanges(range, totalPages), [range]);

  const handleReset = () => {
    setFile(null);
    reset();
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        icon={Scissors}
        title="Split PDF"
        description="Break a document apart by page range and export each piece."
      />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {status === "done" && file ? (
            <ResultCard
              fileName={`${file.name.replace(/\.pdf$/i, "")} - Split.zip`}
              fileType="zip"
              summary={`${selectedPages.size} pages extracted into a new file`}
              onReset={handleReset}
            />
          ) : !file ? (
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">1. Upload a PDF</p>
              <Dropzone
                multiple={false}
                accept=".pdf"
                onFilesAdded={(files) => setFile(files[0])}
                title="Drop a PDF to split"
                formats="PDF files only"
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
                <FileText className="size-5 text-primary" />
                <p className="flex-1 truncate text-sm font-medium text-foreground">{file.name}</p>
                <span className="text-xs text-muted-foreground">{totalPages} pages</span>
              </div>

              <div>
                <Label htmlFor="range" className="mb-2">
                  2. Page ranges to extract
                </Label>
                <Input
                  id="range"
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  placeholder="e.g. 1-4, 7, 10-12"
                  disabled={status === "processing"}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {selectedPages.size} of {totalPages} pages selected
                </p>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-foreground">3. Preview pages</p>
                <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 lg:grid-cols-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    const selected = selectedPages.has(page);
                    return (
                      <button
                        key={page}
                        onClick={() => {
                          const next = new Set(selectedPages);
                          if (next.has(page)) next.delete(page);
                          else next.add(page);
                          setRange(
                            Array.from(next)
                              .sort((a, b) => a - b)
                              .join(", ")
                          );
                        }}
                        disabled={status === "processing"}
                        className={cn(
                          "flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-lg border text-xs font-medium transition-colors",
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <FileText className="size-4" />
                        {page}
                      </button>
                    );
                  })}
                </div>
              </div>

              {status === "processing" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">Splitting…</span>
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
                  disabled={selectedPages.size === 0}
                  className="self-start"
                >
                  Split {selectedPages.size} pages <ArrowRight />
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ToolFaq items={faqs} />
      <RelatedTools currentId="split" />
    </div>
  );
}
