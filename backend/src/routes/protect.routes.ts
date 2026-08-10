import { Router } from "express";

import { protectPdf } from "../controllers/protect.controller";
import { validate } from "../middlewares/validate.middleware";
import { enforceUsage } from "../middlewares/usage.middleware";
import { protectBodySchema } from "../validators/protect.validator";

const router = Router();

router.post("/", enforceUsage("protect"), validate({ body: protectBodySchema }), protectPdf);

export default router;
