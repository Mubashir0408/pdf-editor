import { Router } from "express";

import healthRoutes from "./health.routes";
import uploadRoutes from "./upload.routes";
import fileRoutes from "./file.routes";
import mergeRoutes from "./merge.routes";
import downloadRoutes from "./download.routes";
import dbTestRoutes from "./dbTest.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/upload", uploadRoutes);
router.use("/files", fileRoutes);
router.use("/merge", mergeRoutes);
router.use("/download", downloadRoutes);
router.use("/db-test", dbTestRoutes); // TEMPORARY diagnostic route — see dbTest.controller.ts

export default router;
