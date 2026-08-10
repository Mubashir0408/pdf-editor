import { Router } from "express";

import { convertPdfToImage } from "../controllers/pdfToImage.controller";
import { validate } from "../middlewares/validate.middleware";
import { heavyProcessingLimiter } from "../middlewares/rateLimiter.middleware";
import { enforceUsage } from "../middlewares/usage.middleware";
import { pdfToImageBodySchema } from "../validators/pdfToImage.validator";

const router = Router();

router.post(
  "/",
  heavyProcessingLimiter,
  enforceUsage("pdf-to-image"),
  validate({ body: pdfToImageBodySchema }),
  convertPdfToImage
);

export default router;
