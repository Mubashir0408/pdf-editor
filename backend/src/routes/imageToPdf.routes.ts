import { Router } from "express";

import { convertImageToPdf } from "../controllers/imageToPdf.controller";
import { validate } from "../middlewares/validate.middleware";
import { enforceUsage } from "../middlewares/usage.middleware";
import { imageToPdfBodySchema } from "../validators/imageToPdf.validator";

const router = Router();

router.post("/", enforceUsage("image-to-pdf"), validate({ body: imageToPdfBodySchema }), convertImageToPdf);

export default router;
