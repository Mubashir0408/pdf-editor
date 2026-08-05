"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { Stamp, ArrowRight, FileText } from "lucide-react";

import { ToolHero } from "@/components/tools/tool-hero";
import { ToolErrorState } from "@/components/tools/tool-error-state";
import { Dropzone } from "@/components/tools/dropzone";
import { SelectedFileRow } from "@/components/tools/selected-file-row";
import { ResultCard } from "@/components/tools/result-card";
import { ToolFaq } from "@/components/tools/tool-faq";
import { RelatedTools } from "@/components/tools/related-tools";
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
import { usePendingFile } from "@/components/providers/pending-file-provider";
import { useSingleFileUpload } from "@/hooks/use-single-file-upload";
import { watermarkPdf } from "@/lib/api/watermark";
import { buildDownloadUrl } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { ProcessedFileResponse, WatermarkPosition } from "@/lib/api/types";

const positions: { id: WatermarkPosition; label: string; classes: string; defaultRotation: number }[] = [
  { id: "center", label: "Center", classes: "items-center justify-center", defaultRotation: 0 },
  { id: "diagonal", label: "Diagonal", classes: "items-center justify-center", defaultRotation: 45 },
  { id: "top-left", label: "Top left", classes: "items-start justify-start", defaultRotation: 0 },
  { id: "top-right", label: "Top right", classes: "items-start justify-end", defaultRotation: 0 },
  { id: "bottom-left", label: "Bottom left", classes: "items-end justify-start", defaultRotation: 0 },
  { id: "bottom-right", label: "Bottom right", classes: "items-end justify-end", defaultRotation: 0 },
];

const faqs = [
  { q: "Can I customize the watermark text and position?", a: "Yes — set any text, choose a position, and adjust opacity, size, and rotation with a live preview before applying." },
  { q: "Will the watermark appear on every page?", a: "Yes, it's applied consistently across all pages of the document." },
  { q: "Do I need an account?", a: "No. Watermarking works instantly with no sign-up required." },
];

export default function WatermarkPage() {
  const { t } = useTranslation();
  const { consume } = usePendingFile();

  const { file, uploadedId, status: uploadStatus, error: uploadError, upload, reset: resetUpload } =
    useSingleFileUpload();

  const [text, setText] = React.useState("CONFIDENTIAL");
  const [position, setPosition] = React.useState<WatermarkPosition>("diagonal");
  const [opacity, setOpacity] = React.useState([35]);
  const [fontSize, setFontSize] = React.useState([36]);
  const [rotation, setRotation] = React.useState([45]);
  const [processing, setProcessing] = React.useState(false);
  const [processError, setProcessError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ProcessedFileResponse | null>(null);

  React.useEffect(() => {
    const pending = consume();
    if (pending) void upload(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    resetUpload();
    setProcessing(false);
    setProcessError(null);
    setResult(null);
  };

  const handlePositionChange = (next: WatermarkPosition) => {
    setPosition(next);
    setRotation([positions.find((p) => p.id === next)!.defaultRotation]);
  };

  const handleApply = async () => {
    if (!uploadedId) return;
    setProcessing(true);
    setProcessError(null);
    try {
      const processed = await watermarkPdf({
        fileId: uploadedId,
        text: text.trim(),
        position,
        opacity: opacity[0]!,
        fontSize: fontSize[0]!,
        rotation: rotation[0]!,
      });
      setResult(processed);
    } catch (err) {
      setProcessError(getApiErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  const showError = uploadStatus === "error" || !!processError;
  const errorMessage = processError ?? uploadError ?? undefined;
  const retry = uploadStatus === "error" && file ? () => upload(file) : handleApply;

  const activePosition = positions.find((p) => p.id === position)!;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={Stamp}
        title={t("tools.watermark.title")}
        description={t("tools.watermark.description")}
        gradientFrom="#7C5CFF"
        gradientTo="#EF4444"
      />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {showError ? (
            <ToolErrorState description={errorMessage} onRetry={retry} />
          ) : result ? (
            <ResultCard
              fileName={result.outputName}
              fileType="pdf"
              summary={`"${text}" watermark applied to every page`}
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
                title="Drop a PDF to watermark"
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

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="wm-text">2. Watermark text</Label>
                    <Input
                      id="wm-text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      maxLength={100}
                      disabled={processing}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="wm-position">Position</Label>
                    <Select value={position} onValueChange={(v) => handlePositionChange(v as WatermarkPosition)}>
                      <SelectTrigger id="wm-position" className="w-full">
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
                      aria-label="Opacity"
                      value={opacity}
                      onValueChange={setOpacity}
                      min={10}
                      max={80}
                      step={5}
                      disabled={processing}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Label>Font size</Label>
                      <span className="text-xs text-muted-foreground">{fontSize[0]}px</span>
                    </div>
                    <Slider
                      aria-label="Font size"
                      value={fontSize}
                      onValueChange={setFontSize}
                      min={12}
                      max={96}
                      step={2}
                      disabled={processing}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Label>Rotation</Label>
                      <span className="text-xs text-muted-foreground">{rotation[0]}°</span>
                    </div>
                    <Slider
                      aria-label="Rotation"
                      value={rotation}
                      onValueChange={setRotation}
                      min={-90}
                      max={90}
                      step={5}
                      disabled={processing}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-foreground">Preview</p>
                  <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40 p-4">
                    <FileText className="absolute size-10 text-muted-foreground/20" />
                    <div className={cn("absolute inset-4 flex", activePosition.classes)}>
                      <span
                        className="select-none font-bold uppercase tracking-widest text-primary"
                        style={{
                          opacity: opacity[0]! / 100,
                          fontSize: `${Math.min(fontSize[0]!, 32)}px`,
                          transform: `rotate(${-rotation[0]!}deg)`,
                        }}
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

              {processing || uploadStatus === "uploading" ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      {uploadStatus === "uploading" ? "Uploading…" : "Applying watermark…"}
                    </span>
                  </div>
                  <Progress value={70} />
                </div>
              ) : (
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleApply}
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

      <ToolFaq items={faqs} />
      <RelatedTools currentId="watermark" />
    </div>
  );
}
