"use client";

import * as React from "react";
import { Scissors, ArrowRight } from "lucide-react";

import { ToolHero } from "@/components/tools/tool-hero";
import { ToolErrorState } from "@/components/tools/tool-error-state";
import { Dropzone } from "@/components/tools/dropzone";
import { SelectedFileRow } from "@/components/tools/selected-file-row";
import { ResultCard } from "@/components/tools/result-card";
import { ToolFaq } from "@/components/tools/tool-faq";
import { RelatedTools } from "@/components/tools/related-tools";
import { PageThumbGrid } from "@/components/tools/page-thumb-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useRecordToolUsage } from "@/hooks/use-recent-tools";
import { usePendingFile } from "@/components/providers/pending-file-provider";
import { useSingleFileUpload } from "@/hooks/use-single-file-upload";
import { splitPdf } from "@/lib/api/split";
import { buildDownloadUrl } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { ProcessedFileResponse } from "@/lib/api/types";
import type { FileType } from "@/lib/types";

const faqs = [
  { q: "How do I choose which pages to split out?", a: "Type page ranges like \"1-4, 7, 10-12\" (each range becomes its own file) or click pages directly in the preview grid — or switch to \"Every page\" to split the whole document into single-page files." },
  { q: "What format is the result?", a: "A single range gives you back one PDF; more than one range, or splitting every page, packages the pieces into a downloadable zip." },
  { q: "Do I need an account?", a: "No. Splitting works instantly with no sign-up required." },
];

type SplitMode = "range" | "pages";

function parseRangeGroups(input: string, maxPage: number): number[][] {
  const groups: number[][] = [];
  input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((chunk) => {
      const match = chunk.match(/^(\d+)(?:-(\d+))?$/);
      if (!match) return;
      const start = Math.max(1, parseInt(match[1]!, 10));
      const end = match[2] ? Math.min(maxPage, parseInt(match[2]!, 10)) : start;
      const group: number[] = [];
      for (let p = start; p <= Math.min(end, maxPage); p++) group.push(p);
      if (group.length > 0) groups.push(group);
    });
  return groups;
}

export default function SplitPage() {
  const { consume } = usePendingFile();
  useRecordToolUsage("split");

  const { file, uploadedId, pageCount, status: uploadStatus, error: uploadError, upload, reset: resetUpload } =
    useSingleFileUpload({ fetchPageCount: true });

  const [mode, setMode] = React.useState<SplitMode>("range");
  const [range, setRange] = React.useState("1-4, 7, 10-12");
  const [processing, setProcessing] = React.useState(false);
  const [processError, setProcessError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ProcessedFileResponse | null>(null);

  React.useEffect(() => {
    const pending = consume();
    if (pending) void upload(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = React.useMemo(
    () => (pageCount ? parseRangeGroups(range, pageCount) : []),
    [range, pageCount]
  );
  const selectedPages = React.useMemo(() => new Set(groups.flat()), [groups]);

  const handleReset = () => {
    resetUpload();
    setProcessing(false);
    setProcessError(null);
    setResult(null);
  };

  const togglePage = (page: number) => {
    const next = new Set(selectedPages);
    if (next.has(page)) next.delete(page);
    else next.add(page);
    setRange(Array.from(next).sort((a, b) => a - b).join(", "));
  };

  const handleSplit = async () => {
    if (!uploadedId) return;
    setProcessing(true);
    setProcessError(null);
    try {
      const processed = await splitPdf(
        mode === "pages" ? { mode: "pages", fileId: uploadedId } : { mode: "range", fileId: uploadedId, groups }
      );
      setResult(processed);
    } catch (err) {
      setProcessError(getApiErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  const showError = uploadStatus === "error" || !!processError;
  const errorMessage = processError ?? uploadError ?? undefined;
  const retry = uploadStatus === "error" && file ? () => upload(file) : handleSplit;

  const resultFileType: FileType = result?.outputName.endsWith(".zip") ? "zip" : "pdf";
  const canSplit = mode === "pages" ? !!pageCount : groups.length > 0;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={Scissors}
        title="Split PDF"
        description="Break a document apart by page range and export each piece."
        gradientFrom="#36CFC9"
        gradientTo="#5B7FFF"
      />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {showError ? (
            <ToolErrorState description={errorMessage} onRetry={retry} />
          ) : result ? (
            <ResultCard
              fileName={result.outputName}
              fileType={resultFileType}
              summary={
                mode === "pages"
                  ? `Split into ${pageCount} single-page files`
                  : `${selectedPages.size} pages extracted into ${groups.length} file${groups.length === 1 ? "" : "s"}`
              }
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
                title="Drop a PDF to split"
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
                <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 lg:grid-cols-8">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <>
                  <div>
                    <Label className="mb-2 block">2. Split mode</Label>
                    <RadioGroup
                      value={mode}
                      onValueChange={(v) => setMode(v as SplitMode)}
                      className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
                    >
                      <Label
                        htmlFor="mode-range"
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 font-normal transition-colors",
                          mode === "range" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                        )}
                      >
                        <RadioGroupItem value="range" id="mode-range" className="mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Custom ranges</p>
                          <p className="text-xs text-muted-foreground">Choose exactly which pages go where</p>
                        </div>
                      </Label>
                      <Label
                        htmlFor="mode-pages"
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 font-normal transition-colors",
                          mode === "pages" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                        )}
                      >
                        <RadioGroupItem value="pages" id="mode-pages" className="mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Every page</p>
                          <p className="text-xs text-muted-foreground">
                            Split all {pageCount} pages into separate files
                          </p>
                        </div>
                      </Label>
                    </RadioGroup>
                  </div>

                  {mode === "range" && (
                    <>
                      <div>
                        <Label htmlFor="range" className="mb-2">
                          3. Page ranges to extract
                        </Label>
                        <Input
                          id="range"
                          value={range}
                          onChange={(e) => setRange(e.target.value)}
                          placeholder="e.g. 1-4, 7, 10-12"
                          disabled={processing}
                        />
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {selectedPages.size} of {pageCount} pages selected · {groups.length} output file
                          {groups.length === 1 ? "" : "s"}
                        </p>
                      </div>

                      <div>
                        <p className="mb-3 text-sm font-medium text-foreground">4. Preview pages</p>
                        <PageThumbGrid
                          totalPages={pageCount}
                          selected={selectedPages}
                          onToggle={togglePage}
                          density="compact"
                          disabled={processing}
                        />
                      </div>
                    </>
                  )}

                  {processing && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">Splitting…</span>
                      </div>
                      <Progress value={70} />
                    </div>
                  )}

                  {!processing && (
                    <Button
                      variant="gradient"
                      size="lg"
                      onClick={handleSplit}
                      disabled={!canSplit}
                      className="self-start"
                    >
                      {mode === "pages" ? `Split into ${pageCount} files` : `Split ${selectedPages.size} pages`}{" "}
                      <ArrowRight />
                    </Button>
                  )}
                </>
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
