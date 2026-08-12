/**
 * Mirrors the backend's response envelope and DTOs exactly
 * (backend/src/types/api.ts, backend/src/types/file.ts) — except dates,
 * which arrive over JSON as ISO strings, never `Date` instances.
 */
export interface ApiSuccessBody<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors: ApiErrorDetail[];
  status: number;
  timestamp: string;
  requestId: string;
}

export type UploadStatus = "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface UploadedFileResponse {
  id: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  status: UploadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessedFileResponse {
  id: string;
  tool: string;
  outputName: string;
  size: number;
  downloadUrl: string;
  createdAt: string;
}

export interface PdfInfoResponse {
  pageCount: number;
}

export type SplitRequest =
  | { mode: "range"; fileId: string; groups: number[][] }
  | { mode: "pages"; fileId: string };

export type WatermarkPosition =
  | "center"
  | "diagonal"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type TranslateStage = "extracting" | "ocr" | "translating" | "rendering" | "done" | "error";

export interface TranslateJobResult {
  translatedText: string;
  ocrPageCount: number;
  files: {
    pdf: ProcessedFileResponse;
    txt: ProcessedFileResponse;
    docx: ProcessedFileResponse;
  };
}

export interface TranslateJobStatus {
  status: "processing" | "done" | "error";
  stage: TranslateStage;
  progress: number;
  current?: number;
  total?: number;
  result?: TranslateJobResult;
  error?: string;
}

export interface ChatResponse {
  reply: string;
}
