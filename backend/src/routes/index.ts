import { Router } from "express";

import healthRoutes from "./health.routes";
import uploadRoutes from "./upload.routes";
import mergeRoutes from "./merge.routes";
import downloadRoutes from "./download.routes";
import pdfInfoRoutes from "./pdfInfo.routes";
import splitRoutes from "./split.routes";
import rotateRoutes from "./rotate.routes";
import extractPagesRoutes from "./extractPages.routes";
import deletePagesRoutes from "./deletePages.routes";
import protectRoutes from "./protect.routes";
import watermarkRoutes from "./watermark.routes";
import wordToPdfRoutes from "./wordToPdf.routes";
import excelToPdfRoutes from "./excelToPdf.routes";
import powerpointToPdfRoutes from "./powerpointToPdf.routes";
import imageToPdfRoutes from "./imageToPdf.routes";
import pdfToImageRoutes from "./pdfToImage.routes";
import pdfToWordRoutes from "./pdfToWord.routes";
import translateRoutes from "./translate.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/upload", uploadRoutes);
router.use("/merge", mergeRoutes);
router.use("/split", splitRoutes);
router.use("/rotate", rotateRoutes);
router.use("/extract-pages", extractPagesRoutes);
router.use("/delete-pages", deletePagesRoutes);
router.use("/protect", protectRoutes);
router.use("/watermark", watermarkRoutes);
router.use("/word-to-pdf", wordToPdfRoutes);
router.use("/excel-to-pdf", excelToPdfRoutes);
router.use("/powerpoint-to-pdf", powerpointToPdfRoutes);
router.use("/image-to-pdf", imageToPdfRoutes);
router.use("/pdf-to-image", pdfToImageRoutes);
router.use("/pdf-to-word", pdfToWordRoutes);
router.use("/translate", translateRoutes);
router.use("/download", downloadRoutes);
router.use("/pdf-info", pdfInfoRoutes);

export default router;
