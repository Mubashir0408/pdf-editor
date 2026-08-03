import { Router } from "express";

import { startTranslateJob, getTranslateJobStatus } from "../controllers/translate.controller";
import { validate } from "../middlewares/validate.middleware";
import { translateBodySchema, translateJobParamSchema } from "../validators/translate.validator";

const router = Router();

router.post("/", validate({ body: translateBodySchema }), startTranslateJob);
router.get("/:jobId", validate({ params: translateJobParamSchema }), getTranslateJobStatus);

export default router;
