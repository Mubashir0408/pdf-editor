import { Router } from "express";

import { convertExcelToPdf } from "../controllers/excelToPdf.controller";
import { validate } from "../middlewares/validate.middleware";
import { heavyProcessingLimiter } from "../middlewares/rateLimiter.middleware";
import { excelToPdfBodySchema } from "../validators/excelToPdf.validator";

const router = Router();

router.post("/", heavyProcessingLimiter, validate({ body: excelToPdfBodySchema }), convertExcelToPdf);

export default router;
