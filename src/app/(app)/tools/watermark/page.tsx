"use client";

import * as React from "react";
import { Stamp, ArrowRight, FileText } from "lucide-react";

import { ToolHero } from "@/components/tools/tool-hero";
import { ToolErrorState } from "@/components/tools/tool-error-state";
import { Dropzone } from "@/components/tools/dropzone";
import { SelectedFileRow } from "@/components/tools/selected-file-row";
import { ResultCard } from "@/components/tools/result-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSimulatedTask } from "@/hooks/use-simulated-task";

const positions = [
  { id: "center", label: "Center", classes: "items-center justify-center" },
  { id: "diagonal", label: "Diagonal", classes: "items-center justify-center" },
  { id: "top-left", label: "Top left", classes: "items-start justify-start" },
  { id: "top-right", label: "Top right", classes: "items-start justify-end" },
  { id: "bottom-left", label: "Bottom left", classes: "items-end justify-start" },
  { id: "bottom-right", label: "Bottom right", classes: "items-end justify-end" },
] as const;

export default function WatermarkPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [text, setText] = React.useState("CONFIDENTIAL");
  const [position, setPosition] = React.useState<(typeof positions)[number]["id"]>("diagonal");
  const [opacity, setOpacity] = React.useState([35]);
  const { status, progress, start, retry, reset } = useSimulatedTask(2000, { failureRate: 0.15 });

  const handleReset = () => {
    setFile(null);
    reset();
  };

  const activePosition = positions.find((p) => p.id === position)!;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={Stamp}
        title="Watermark PDF"
        description="Brand and protect your documents with a custom watermark."
        gradientFrom="#7C5CFF"
        gradientTo="#EF4444"
      />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {status === "error" ? (
            <ToolErrorState
              description="We couldn't apply the watermark. Please try again."
              onRetry={retry}
            />
          ) : status === "done" && file ? (
            <ResultCard
              fileName={file.name}
              fileType="pdf"
              summary={`"${text}" watermark applied to every page`}
              onReset={handleReset}
            />
          ) : !file ? (
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">1. Upload a PDF</p>
              <Dropzone
                multiple={false}
                accept=".pdf"
                onFilesAdded={(files) => setFile(files[0])}
                title="Drop a PDF to watermark"
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

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="wm-text">2. Watermark text</Label>
                    <Input
                      id="wm-text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      disabled={status === "processing"}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Position</Label>
                    <Select
                      value={position}
                      onValueChange={(v) => setPosition(v as typeof position)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Label>Opacity</Label>
                      <span className="text-xs text-muted-foreground">{opacity[0]}%</span>
                    </div>
                    <Slider
                      value={opacity}
                      onValueChange={setOpacity}
                      min={10}
                      max={80}
                      step={5}
                      disabled={status === "processing"}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-foreground">Preview</p>
                  <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40 p-4">
                    <FileText className="absolute size-10 text-muted-foreground/20" />
                    <div className={cn("absolute inset-4 flex", activePosition.classes)}>
                      <span
                        className={cn(
                          "select-none text-lg font-bold uppercase tracking-widest text-primary",
                          position === "diagonal" && "-rotate-45 text-2xl"
                        )}
                        style={{ opacity: opacity[0] / 100 }}
                      >
                        {text || "WATERMARK"}
                      </span>
                    </div>
                    <div className="absolute inset-4 flex flex-col justify-end gap-1.5 opacity-30">
                      {[100, 90, 95, 80, 70].map((w, i) => (
                        <div key={i} className="h-1.5 rounded-full bg-foreground/20" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {status === "processing" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">Applying watermark…</span>
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
                  disabled={!text.trim()}
                  className="self-start"
                >
                  <Stamp /> Apply watermark <ArrowRight />
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
