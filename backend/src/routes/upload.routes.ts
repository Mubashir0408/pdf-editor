import { Router } from "express";

import { uploadFile } from "../controllers/upload.controller";
import { upload } from "../middlewares/upload.middleware";
import { uploadLimiter } from "../middlewares/rateLimiter.middleware";

const router = Router();

router.post("/", uploadLimiter, upload.single("file"), uploadFile);

export default router;
