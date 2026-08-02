import { Router } from "express";

import healthRoutes from "./health.routes";
import uploadRoutes from "./upload.routes";
import mergeRoutes from "./merge.routes";
import downloadRoutes from "./download.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/upload", uploadRoutes);
router.use("/merge", mergeRoutes);
router.use("/download", downloadRoutes);

export default router;
