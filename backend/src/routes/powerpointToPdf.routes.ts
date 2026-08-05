import { Router } from "express";

import { convertPowerpointToPdf } from "../controllers/powerpointToPdf.controller";
import { validate } from "../middlewares/validate.middleware";
import { heavyProcessingLimiter } from "../middlewares/rateLimiter.middleware";
import { powerpointToPdfBodySchema } from "../validators/powerpointToPdf.validator";

const router = Router();

router.post("/", heavyProcessingLimiter, validate({ body: powerpointToPdfBodySchema }), convertPowerpointToPdf);

export default router;
