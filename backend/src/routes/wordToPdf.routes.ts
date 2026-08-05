import { Router } from "express";

import { convertWordToPdf } from "../controllers/wordToPdf.controller";
import { validate } from "../middlewares/validate.middleware";
import { heavyProcessingLimiter } from "../middlewares/rateLimiter.middleware";
import { wordToPdfBodySchema } from "../validators/wordToPdf.validator";

const router = Router();

router.post("/", heavyProcessingLimiter, validate({ body: wordToPdfBodySchema }), convertWordToPdf);

export default router;
