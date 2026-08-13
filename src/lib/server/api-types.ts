export interface ApiSuccessBody<T = unknown> {
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

export type UploadStatus = "UPLOADED";

export interface UploadedFileDto {
  id: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  status: UploadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessedFileDto {
  id: string;
  tool: string;
  outputName: string;
  size: number;
  downloadUrl: string;
  createdAt: string;
}
