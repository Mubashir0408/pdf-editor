import { supabaseService } from "../supabase.service";
import type { ProcessedFileDto } from "../api-types";

export type TranslateStage = "extracting" | "ocr" | "translating" | "rendering" | "done" | "error";

export interface TranslateJobResult {
  translatedText: string;
  ocrPageCount: number;
  files: {
    pdf: ProcessedFileDto;
    txt: ProcessedFileDto;
    docx: ProcessedFileDto;
  };
}

export interface TranslateJobState {
  status: "processing" | "done" | "error";
  stage: TranslateStage;
  progress: number;
  current?: number;
  total?: number;
  result?: TranslateJobResult;
  error?: string;
}

interface TranslationJobRow {
  id: string;
  status: string;
  stage: string;
  progress: number;
  current: number | null;
  total: number | null;
  result: TranslateJobResult | null;
  error: string | null;
}

function rowToState(row: TranslationJobRow): TranslateJobState {
  return {
    status: row.status as TranslateJobState["status"],
    stage: row.stage as TranslateStage,
    progress: row.progress,
    current: row.current ?? undefined,
    total: row.total ?? undefined,
    result: row.result ?? undefined,
    error: row.error ?? undefined,
  };
}

/**
 * Replaces the old Express backend's in-memory `Map`-based job store.
 * Serverless functions are isolated per invocation — a `POST /api/translate`
 * and a later `GET /api/translate/[jobId]` poll can land on completely
 * separate instances, so job state has to live somewhere both can reach:
 * a small Supabase table (`translation_jobs`) instead of process memory.
 * Same public shape (`create`/`update`/`get`) as the original, just backed
 * by Supabase reads/writes instead of Map operations — every caller in
 * `pdfTranslate.service.ts` only needed `await` added.
 */
export class TranslationJobsService {
  async create(): Promise<string> {
    const { data, error } = await supabaseService
      .raw()
      .from("translation_jobs")
      .insert({ status: "processing", stage: "extracting", progress: 0 })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(`Couldn't start the translation job: ${error?.message ?? "unknown error"}`);
    }
    return data.id as string;
  }

  async update(id: string, patch: Partial<TranslateJobState>): Promise<void> {
    await supabaseService
      .raw()
      .from("translation_jobs")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  async get(id: string): Promise<TranslateJobState | undefined> {
    const { data, error } = await supabaseService.raw().from("translation_jobs").select("*").eq("id", id).maybeSingle();
    if (error || !data) return undefined;
    return rowToState(data as TranslationJobRow);
  }
}
