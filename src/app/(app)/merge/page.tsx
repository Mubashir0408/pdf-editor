"use client";

import * as React from "react";
import { Layers, ArrowRight } from "lucide-react";
import { Reorder } from "framer-motion";

import { PageHeader } from "@/components/shared/page-header";
import { Dropzone } from "@/components/tools/dropzone";
import { SelectedFileRow } from "@/components/tools/selected-file-row";
import { ResultCard } from "@/components/tools/result-card";
import { ToolFaq } from "@/components/tools/tool-faq";
import { RelatedTools } from "@/components/tools/related-tools";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSimulatedTask } from "@/hooks/use-simulated-task";
import { useRecordToolUsage } from "@/hooks/use-recent-tools";
import { usePendingFile } from "@/components/providers/pending-file-provider";

interface MergeFile {
  id: string;
  name: string;
  size: number;
}

const faqs = [
  { q: "How many PDFs can I merge at once?", a: "Up to 20 files per merge, in any order you choose." },
  { q: "Can I reorder the files before merging?", a: "Yes — drag and drop each file into the order you want the final PDF to follow." },
  { q: "Do I need an account?", a: "No. Merging works instantly with no sign-up required." },
];

export default function MergePage() {
  const { consume } = usePendingFile();
  useRecordToolUsage("merge");
  const [files, setFiles] = React.useState<MergeFile[]>(() => {
    const pending = consume();
    return pending ? [{ id: `${pending.name}-${Date.now()}`, name: pending.name, size: pending.size }] : [];
  });
  const { status, progress, start, reset } = useSimulatedTask(2600);

  const handleFilesAdded = (added: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...added.map((f) => ({ id: `${f.name}-${Date.now()}-${Math.random()}`, name: f.name, size: f.size })),
    ]);
  };

  const handleReset = () => {
    setFiles([]);
    reset();
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        icon={Layers}
        title="Merge PDFs"
        description="Combine multiple documents into a single organized PDF."
      />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {status === "done" ? (
            <ResultCard
              fileName="Merged Document.pdf"
              fileType="pdf"
              summary={`${files.length} files combined into one PDF`}
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
                      <Reorder.Item key={f.id} value={f}>
                        <SelectedFileRow
                          name={f.name}
                          size={f.size}
                          index={i}
                          draggable
                          onRemove={
                            status === "processing"
                              ? undefined
                              : () => setFiles((prev) => prev.filter((x) => x.id !== f.id))
                          }
                        />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>
              )}

              {status === "processing" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">Merging…</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {files.length >= 2 && status !== "processing" && (
                <Button variant="gradient" size="lg" onClick={start} className="self-start">
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
