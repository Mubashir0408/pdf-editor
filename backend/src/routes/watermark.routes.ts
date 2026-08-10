import { Router } from "express";

import { watermarkPdf } from "../controllers/watermark.controller";
import { validate } from "../middlewares/validate.middleware";
import { enforceUsage } from "../middlewares/usage.middleware";
import { watermarkBodySchema } from "../validators/watermark.validator";

const router = Router();

router.post("/", enforceUsage("watermark"), validate({ body: watermarkBodySchema }), watermarkPdf);

export default router;
