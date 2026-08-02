"use client";

import * as React from "react";

import { uploadFile } from "@/lib/api/upload";
import { getPdfInfo } from "@/lib/api/pdfInfo";
import { getApiErrorMessage } from "@/lib/api/errors";

export type SingleFileUploadStatus = "idle" | "uploading" | "ready" | "error";

interface UseSingleFileUploadOptions {
  /** Page-selection tools (Split, Rotate, Extract, Delete) need the real
   *  page count as soon as a file is picked; Protect/Watermark don't. */
  fetchPageCount?: boolean;
}

/**
 * Shared by every single-file tool page (Rotate, Extract, Delete, Protect,
 * Watermark, Split): pick a file, upload it immediately, and — for the
 * page-grid tools — fetch its real page count in the same step. One state
 * machine instead of five near-identical copies.
 */
export function useSingleFileUpload(options: UseSingleFileUploadOptions = {}) {
  const { fetchPageCount = false } = options;

  const [file, setFile] = React.useState<File | null>(null);
  const [uploadedId, setUploadedId] = React.useState<string | null>(null);
  const [pageCount, setPageCount] = React.useState<number | null>(null);
  const [status, setStatus] = React.useState<SingleFileUploadStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const upload = React.useCallback(
    async (selected: File) => {
      setFile(selected);
      setStatus("uploading");
      setError(null);

      try {
        const uploaded = await uploadFile(selected);
        setUploadedId(uploaded.id);

        if (fetchPageCount) {
          const info = await getPdfInfo(uploaded.id);
          setPageCount(info.pageCount);
        }

        setStatus("ready");
      } catch (err) {
        setError(getApiErrorMessage(err));
        setStatus("error");
      }
    },
    [fetchPageCount]
  );

  const reset = React.useCallback(() => {
    setFile(null);
    setUploadedId(null);
    setPageCount(null);
    setStatus("idle");
    setError(null);
  }, []);

  return { file, uploadedId, pageCount, status, error, upload, reset };
}
