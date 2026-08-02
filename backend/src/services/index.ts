import { prisma } from "../database/prisma";
import { HealthService } from "./health.service";
import { UploadService } from "./upload.service";
import { FileService } from "./file.service";
import { PdfService } from "./pdf.service";
import { DownloadService } from "./download.service";
import { MergeService } from "./merge.service";

/**
 * Composition root: every service is constructed exactly once here, with
 * its dependencies injected via the constructor. Controllers import the
 * instances from this module rather than constructing services
 * themselves, which keeps them easy to unit test — swap what's exported
 * here for a mock and every controller picks it up.
 */
export const healthService = new HealthService(prisma);
export const uploadService = new UploadService(prisma);
export const fileService = new FileService(prisma);
export const pdfService = new PdfService();
export const downloadService = new DownloadService(prisma);
export const mergeService = new MergeService(fileService, pdfService, downloadService);
