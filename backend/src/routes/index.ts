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
router.use("/download", downloadRoutes);
router.use("/pdf-info", pdfInfoRoutes);

export default router;
