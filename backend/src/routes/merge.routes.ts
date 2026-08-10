import { Router } from "express";

import { mergePdfs } from "../controllers/merge.controller";
import { validate } from "../middlewares/validate.middleware";
import { enforceUsage } from "../middlewares/usage.middleware";
import { mergeBodySchema } from "../validators/merge.validator";

const router = Router();

router.post("/", enforceUsage("merge"), validate({ body: mergeBodySchema }), mergePdfs);

export default router;
