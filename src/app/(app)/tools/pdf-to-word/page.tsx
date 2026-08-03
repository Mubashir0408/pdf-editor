"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { FileEdit, ArrowRight } from "lucide-react";

import { ToolHero } from "@/components/tools/tool-hero";
import { ToolErrorState } from "@/components/tools/tool-error-state";
import { Dropzone } from "@/components/tools/dropzone";
import { SelectedFileRow } from "@/components/tools/selected-file-row";
import { ResultCard } from "@/components/tools/result-card";
import { ToolFaq } from "@/components/tools/tool-faq";
import { RelatedTools } from "@/components/tools/related-tools";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePendingFile } from "@/components/providers/pending-file-provider";
import { useSingleFileUpload } from "@/hooks/use-single-file-upload";
import { convertPdfToWord } from "@/lib/api/pdfToWord";
import { buildDownloadUrl } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { ProcessedFileResponse } from "@/lib/api/types";

const faqs = [
  { q: "Will the layout match the original PDF?", a: "The text and reading order carry over, reflowed into an editable document. Exact layout, tables, and images from the PDF are not reproduced." },
  { q: "What if my PDF is a scanned document?", a: "A scanned or image-only PDF has no extractable text, so this tool can't convert it — try the OCR tool first." },
  { q: "Do I need an account?", a: "No. Converting works instantly with no sign-up required." },
];

export default function PdfToWordPage() {
  const { t } = useTranslation();
  const { consume } = usePendingFile();

  const { file, uploadedId, status: uploadStatus, error: uploadError, upload, reset: resetUpload } =
    useSingleFileUpload();

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

  const handleConvert = async () => {
    if (!uploadedId) return;
    setProcessing(true);
    setProcessError(null);
    try {
      const processed = await convertPdfToWord(uploadedId);
      setResult(processed);
    } catch (err) {
      setProcessError(getApiErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  const showError = uploadStatus === "error" || !!processError;
  const errorMessage = processError ?? uploadError ?? undefined;
  const retry = uploadStatus === "error" && file ? () => upload(file) : handleConvert;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={FileEdit}
        title={t("tools.pdfToWord.title")}
        description={t("tools.pdfToWord.description")}
        gradientFrom="#5B7FFF"
        gradientTo="#7C5CFF"
      />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {showError ? (
            <ToolErrorState description={errorMessage} onRetry={retry} />
          ) : result ? (
            <ResultCard
              fileName={result.outputName}
              fileType="docx"
              summary="Converted to Word"
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
                title="Drop a PDF here"
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

              {uploadStatus === "ready" && !processing && (
                <Button variant="gradient" size="lg" onClick={handleConvert} className="self-start">
                  Convert to Word <ArrowRight />
                </Button>
              )}
              {processing && (
                <p className="text-sm text-muted-foreground">Converting your PDF…</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ToolFaq items={faqs} />
      <RelatedTools currentId="pdf-to-word" />
    </div>
  );
}
