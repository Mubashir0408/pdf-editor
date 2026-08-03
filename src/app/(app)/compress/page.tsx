"use client";

import * as React from "react";
import { Minimize2, ArrowRight, FileText } from "lucide-react";

import { ToolHero } from "@/components/tools/tool-hero";
import { Dropzone } from "@/components/tools/dropzone";
import { ResultCard } from "@/components/tools/result-card";
import { ToolFaq } from "@/components/tools/tool-faq";
import { RelatedTools } from "@/components/tools/related-tools";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { formatBytes, cn } from "@/lib/utils";
import { useSimulatedTask } from "@/hooks/use-simulated-task";
import { useRecordToolUsage } from "@/hooks/use-recent-tools";
import { usePendingFile } from "@/components/providers/pending-file-provider";

const levels = [
  { id: "low", label: "Low compression", desc: "Best quality, smaller savings", ratio: 0.85 },
  { id: "recommended", label: "Recommended", desc: "Balanced quality and size", ratio: 0.52 },
  { id: "extreme", label: "Extreme compression", desc: "Smallest size, lower quality", ratio: 0.28 },
] as const;

const faqs = [
  { q: "Will compressing reduce quality?", a: "The Recommended level balances size and quality; choose Low compression if visual fidelity matters most, or Extreme for the smallest possible file." },
  { q: "What's the maximum file size?", a: "Files up to 200MB are supported." },
  { q: "Do I need an account?", a: "No. Compression works instantly with no sign-up required." },
];

export default function CompressPage() {
  const { consume } = usePendingFile();
  useRecordToolUsage("compress");
  const [file, setFile] = React.useState<File | null>(null);
  React.useEffect(() => {
    const pending = consume();
    if (pending) setFile(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [level, setLevel] = React.useState<(typeof levels)[number]["id"]>("recommended");
  const { status, progress, start, reset } = useSimulatedTask(2200);

  const selected = levels.find((l) => l.id === level)!;
  const estimatedSize = file ? Math.round(file.size * selected.ratio) : 0;

  const handleReset = () => {
    setFile(null);
    reset();
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={Minimize2}
        title="Compress PDF"
        description="Shrink file size while keeping documents sharp and readable."
        gradientFrom="#22C55E"
        gradientTo="#36CFC9"
      />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {status === "done" && file ? (
            <ResultCard
              fileName={file.name}
              fileType="pdf"
              summary={`Reduced from ${formatBytes(file.size)} to ${formatBytes(estimatedSize)} (${Math.round(
                (1 - selected.ratio) * 100
              )}% smaller)`}
              onReset={handleReset}
            />
          ) : !file ? (
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">1. Upload a PDF</p>
              <Dropzone
                multiple={false}
                accept=".pdf"
                onFilesAdded={(files) => setFile(files[0])}
                title="Drop a PDF to compress"
                formats="PDF files only, up to 200MB"
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
                <FileText className="size-5 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">Original size: {formatBytes(file.size)}</p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-foreground">2. Choose compression level</p>
                <RadioGroup
                  value={level}
                  onValueChange={(v) => setLevel(v as typeof level)}
                  className="gap-2.5"
                >
                  {levels.map((l) => (
                    <Label
                      key={l.id}
                      htmlFor={l.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                        level === l.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                      )}
                    >
                      <RadioGroupItem value={l.id} id={l.id} className="mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{l.label}</p>
                        <p className="text-xs text-muted-foreground">{l.desc}</p>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        ~{formatBytes(Math.round(file.size * l.ratio))}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-sm">
                <span className="text-muted-foreground">Estimated output size</span>
                <span className="font-semibold text-foreground">{formatBytes(estimatedSize)}</span>
              </div>

              {status === "processing" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">Compressing…</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {status !== "processing" && (
                <Button variant="gradient" size="lg" onClick={start} className="self-start">
                  Compress file <ArrowRight />
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ToolFaq items={faqs} />
      <RelatedTools currentId="compress" />
    </div>
  );
}
