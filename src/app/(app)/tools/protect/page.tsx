"use client";

import * as React from "react";
import { Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useRecordToolUsage } from "@/hooks/use-recent-tools";
import { usePendingFile } from "@/components/providers/pending-file-provider";
import { useSingleFileUpload } from "@/hooks/use-single-file-upload";
import { protectPdf } from "@/lib/api/protect";
import { buildDownloadUrl } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { ProcessedFileResponse } from "@/lib/api/types";

const faqs = [
  { q: "How strong is the encryption?", a: "Files are protected with a password required to open them, matching standard PDF encryption practices." },
  { q: "Can I control printing and copying separately?", a: "Yes — toggle printing and copy/paste permissions independently of the open password." },
  { q: "Do I need an account?", a: "No. Password protection works instantly with no sign-up required." },
];

export default function ProtectPage() {
  const { consume } = usePendingFile();
  useRecordToolUsage("protect");

  const { file, uploadedId, status: uploadStatus, error: uploadError, upload, reset: resetUpload } =
    useSingleFileUpload();

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [allowPrinting, setAllowPrinting] = React.useState(true);
  const [allowCopying, setAllowCopying] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [processError, setProcessError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ProcessedFileResponse | null>(null);

  const pendingFile = React.useRef(consume());
  React.useEffect(() => {
    if (pendingFile.current) void upload(pendingFile.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const passwordsMatch = password.length >= 6 && password === confirm;
  const showMismatch = confirm.length > 0 && password !== confirm;

  const handleReset = () => {
    resetUpload();
    setPassword("");
    setConfirm("");
    setProcessing(false);
    setProcessError(null);
    setResult(null);
  };

  const handleProtect = async () => {
    if (!uploadedId) return;
    setProcessing(true);
    setProcessError(null);
    try {
      const processed = await protectPdf({
        fileId: uploadedId,
        password,
        confirmPassword: confirm,
        allowPrinting,
        allowCopying,
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
  const retry = uploadStatus === "error" && file ? () => upload(file) : handleProtect;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ToolHero
        icon={Lock}
        title="Password Protect PDF"
        description="Encrypt sensitive documents with a password before sharing."
        gradientFrom="#EF4444"
        gradientTo="#F59E0B"
      />

      <Card className="py-6">
        <CardContent className="flex flex-col gap-6">
          {showError ? (
            <ToolErrorState description={errorMessage} onRetry={retry} />
          ) : result ? (
            <ResultCard
              fileName={result.outputName}
              fileType="pdf"
              summary="Your file is now password protected"
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
                title="Drop a PDF to protect"
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

              <div>
                <p className="mb-3 text-sm font-medium text-foreground">2. Set a password</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        disabled={processing}
                        className="pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirm">Confirm password</Label>
                    <Input
                      id="confirm"
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter password"
                      disabled={processing}
                      aria-invalid={showMismatch}
                    />
                    {showMismatch && (
                      <p className="text-xs text-destructive">Passwords do not match</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-foreground">3. Permissions</p>
                <div className="flex flex-col gap-3">
                  <Label className="flex cursor-pointer items-center gap-2.5 text-sm font-normal">
                    <Checkbox
                      checked={allowPrinting}
                      onCheckedChange={(v) => setAllowPrinting(!!v)}
                      disabled={processing}
                    />
                    Allow printing
                  </Label>
                  <Label className="flex cursor-pointer items-center gap-2.5 text-sm font-normal">
                    <Checkbox
                      checked={allowCopying}
                      onCheckedChange={(v) => setAllowCopying(!!v)}
                      disabled={processing}
                    />
                    Allow copying text and images
                  </Label>
                </div>
              </div>

              {processing || uploadStatus === "uploading" ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      {uploadStatus === "uploading" ? "Uploading…" : "Encrypting…"}
                    </span>
                  </div>
                  <Progress value={70} />
                </div>
              ) : (
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleProtect}
                  disabled={!passwordsMatch}
                  className="self-start"
                >
                  <Lock /> Protect PDF <ArrowRight />
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ToolFaq items={faqs} />
      <RelatedTools currentId="protect" />
    </div>
  );
}
