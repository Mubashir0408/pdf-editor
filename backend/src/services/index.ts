import { HealthService } from "./health.service";
import { UploadService } from "./upload.service";
import { PdfService } from "./pdf.service";
import { PdfEncryptionService } from "./pdfEncryption.service";
import { DownloadService } from "./download.service";
import { MergeService } from "./merge.service";
import { SplitService } from "./split.service";
import { RotateService } from "./rotate.service";
import { ExtractPagesService } from "./extractPages.service";
import { DeletePagesService } from "./deletePages.service";
import { ProtectService } from "./protect.service";
import { WatermarkService } from "./watermark.service";
import { HtmlRendererService } from "./htmlRenderer.service";
import { WordToPdfService } from "./wordToPdf.service";
import { ExcelToPdfService } from "./excelToPdf.service";
import { PowerpointToPdfService } from "./powerpointToPdf.service";
import { ImageToPdfService } from "./imageToPdf.service";
import { PdfToImageService } from "./pdfToImage.service";
import { PdfToWordService } from "./pdfToWord.service";
import { TranslationJobsService } from "./translationJobs.service";
import { PdfTranslateService } from "./pdfTranslate.service";
import { SupabaseService } from "./supabase.service";
import { OpenRouterService } from "./openrouter.service";
import { ChatService } from "./chat.service";

/**
 * Composition root: every service is constructed exactly once here, with
 * its dependencies injected via the constructor. Controllers import the
 * instances from this module rather than constructing services
 * themselves, which keeps them easy to unit test — swap what's exported
 * here for a mock and every controller picks it up.
 */
export const healthService = new HealthService();
export const uploadService = new UploadService();
export const pdfService = new PdfService();
export const pdfEncryptionService = new PdfEncryptionService();
export const downloadService = new DownloadService();

export const mergeService = new MergeService(pdfService, downloadService);
export const splitService = new SplitService(pdfService, downloadService);
export const rotateService = new RotateService(pdfService, downloadService);
export const extractPagesService = new ExtractPagesService(pdfService, downloadService);
export const deletePagesService = new DeletePagesService(pdfService, downloadService);
export const protectService = new ProtectService(pdfEncryptionService, downloadService);
export const watermarkService = new WatermarkService(pdfService, downloadService);

export const htmlRendererService = new HtmlRendererService();
export const wordToPdfService = new WordToPdfService(htmlRendererService, downloadService);
export const excelToPdfService = new ExcelToPdfService(htmlRendererService, downloadService);
export const powerpointToPdfService = new PowerpointToPdfService(htmlRendererService, downloadService);
export const imageToPdfService = new ImageToPdfService(pdfService, downloadService);
export const pdfToImageService = new PdfToImageService(downloadService);
export const pdfToWordService = new PdfToWordService(downloadService);

export const translationJobsService = new TranslationJobsService();
export const pdfTranslateService = new PdfTranslateService(
  htmlRendererService,
  downloadService,
  translationJobsService
);

export const supabaseService = new SupabaseService();

export const openRouterService = new OpenRouterService();
export const chatService = new ChatService(openRouterService);
