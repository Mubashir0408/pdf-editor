"use client";

import * as React from "react";
import { Languages, ArrowRight, ArrowLeftRight } from "lucide-react";

import { ToolHero } from "@/components/tools/tool-hero";
import { Dropzone } from "@/components/tools/dropzone";
import { SelectedFileRow } from "@/components/tools/selected-file-row";
import { ResultCard } from "@/components/tools/result-card";
import { ToolFaq } from "@/components/tools/tool-faq";
import { RelatedTools } from "@/components/tools/related-tools";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languages } from "@/lib/mock-data";
import { useSimulatedTask } from "@/hooks/use-simulated-task";
import { useRecordToolUsage } from "@/hooks/use-recent-tools";
import { usePendingFile } from "@/components/providers/pending-file-provider";

const faqs = [
  { q: "Does translation preserve formatting?", a: "Yes — layout, fonts, and images stay in place while the text is translated." },
  { q: "How many languages are supported?", a: "16 languages including Spanish, French, German, Japanese, and Arabic." },
  { q: "Do I need an account?", a: "No. Translation works instantly with no sign-up required." },
];

export default function TranslatePage() {
  const { consume } = usePendingFile();
  useRecordToolUsage("translate");
  const [file, setFile] = React.useState<File | null>(() => consume());
  const [source, setSource] = React.useState("English");
  const [target, setTarget] = React.useState("Spanish");
  const { status, progress, start, reset } = useSimulatedTask(2400);

  const handleReset = () => {
    setFile(null);
    reset();
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={Languages}
        title="Translate PDF"
        description="Translate entire documents while preserving layout and formatting."
        gradientFrom="#5B7FFF"
        gradientTo="#36CFC9"
      />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {status === "done" && file ? (
            <ResultCard
              fileName={`${file.name.replace(/\.[^.]+$/, "")} (${target}).pdf`}
              fileType="pdf"
              summary={`Translated from ${source} to ${target}`}
              onReset={handleReset}
            />
          ) : !file ? (
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">1. Upload a document</p>
              <Dropzone
                multiple={false}
                onFilesAdded={(files) => setFile(files[0])}
                title="Drop a document to translate"
                formats="PDF or DOCX up to 100MB"
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
                <p className="mb-3 text-sm font-medium text-foreground">2. Choose languages</p>
                <div className="flex flex-col items-center gap-3 sm:flex-row">
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Source language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => {
                      setSource(target);
                      setTarget(source);
                    }}
                    aria-label="Swap languages"
                  >
                    <ArrowLeftRight className="size-4" />
                  </Button>

                  <Select value={target} onValueChange={setTarget}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Target language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-foreground">3. Preview</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-muted/40 p-4">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">{source} (original)</p>
                    <div className="space-y-1.5">
                      {[100, 92, 88, 96, 70].map((w, i) => (
                        <div key={i} className="h-2 rounded-full bg-foreground/10" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <p className="mb-2 text-xs font-medium text-primary">{target} (translated)</p>
                    <div className="space-y-1.5">
                      {[94, 100, 82, 90, 64].map((w, i) => (
                        <div key={i} className="h-2 rounded-full bg-primary/25" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {status === "processing" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">Translating…</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {status !== "processing" && (
                <Button variant="gradient" size="lg" onClick={start} className="self-start">
                  Translate document <ArrowRight />
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ToolFaq items={faqs} />
      <RelatedTools currentId="translate" />
    </div>
  );
}
