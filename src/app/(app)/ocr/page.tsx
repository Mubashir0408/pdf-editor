"use client";

import * as React from "react";
import { ScanText, Copy, Download, Check } from "lucide-react";

import { ToolHero } from "@/components/tools/tool-hero";
import { Dropzone } from "@/components/tools/dropzone";
import { SelectedFileRow } from "@/components/tools/selected-file-row";
import { ToolFaq } from "@/components/tools/tool-faq";
import { RelatedTools } from "@/components/tools/related-tools";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSimulatedTask } from "@/hooks/use-simulated-task";
import { useRecordToolUsage } from "@/hooks/use-recent-tools";
import { usePendingFile } from "@/components/providers/pending-file-provider";

const faqs = [
  { q: "What file types can I scan?", a: "JPG, PNG images, and scanned PDFs up to 50MB." },
  { q: "How accurate is the text extraction?", a: "Typical confidence is above 95% for clear scans; skewed or low-resolution images may need manual review." },
  { q: "Do I need an account?", a: "No. OCR works instantly with no sign-up required." },
];

const SAMPLE_TEXT = `INVOICE #4471

Bill To: BrightGrid Studio
Date: March 3, 2026
Due Date: March 18, 2026

Description                         Qty     Amount
Design consultation                  6       $900.00
Brand asset production               1       $1,450.00
Photography licensing                4       $620.00

Subtotal                                     $2,970.00
Tax (8%)                                     $237.60
Total Due                                    $3,207.60

Thank you for your business. Payment is due within 15 days
of the invoice date. Late payments may incur a 1.5% monthly fee.`;

export default function OcrPage() {
  const { consume } = usePendingFile();
  useRecordToolUsage("ocr");
  const [file, setFile] = React.useState<File | null>(null);
  React.useEffect(() => {
    const pending = consume();
    if (pending) setFile(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [copied, setCopied] = React.useState(false);
  const { status, progress, start, reset } = useSimulatedTask(2000);

  const handleReset = () => {
    setFile(null);
    reset();
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(SAMPLE_TEXT).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={ScanText}
        title="OCR Scanner"
        description="Extract editable, searchable text from scanned images and PDFs."
        gradientFrom="#36CFC9"
        gradientTo="#22C55E"
      />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {!file ? (
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">1. Upload an image or scanned PDF</p>
              <Dropzone
                multiple={false}
                accept=".pdf,.jpg,.jpeg,.png"
                onFilesAdded={(files) => setFile(files[0])}
                title="Drop an image or scanned PDF"
                formats="JPG, PNG, or scanned PDF up to 50MB"
              />
            </div>
          ) : (
            <>
              <SelectedFileRow
                name={file.name}
                size={file.size}
                onRemove={status === "processing" ? undefined : handleReset}
              />

              {status === "idle" && (
                <Button variant="gradient" size="lg" onClick={start} className="self-start">
                  <ScanText /> Extract text
                </Button>
              )}

              {status === "processing" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">Scanning document…</span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {status === "done" && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">Extracted text</p>
                      <Badge variant="success">98.4% confidence</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyText}>
                        {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button variant="gradient" size="sm">
                        <Download /> Download .txt
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    readOnly
                    value={SAMPLE_TEXT}
                    className="min-h-72 font-mono text-sm leading-relaxed"
                  />
                  <Button variant="ghost" size="sm" onClick={handleReset} className="self-start">
                    Scan another file
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ToolFaq items={faqs} />
      <RelatedTools currentId="ocr" />
    </div>
  );
}
