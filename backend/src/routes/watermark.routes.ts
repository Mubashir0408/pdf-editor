import { Router } from "express";

import { watermarkPdf } from "../controllers/watermark.controller";
import { validate } from "../middlewares/validate.middleware";
import { watermarkBodySchema } from "../validators/watermark.validator";

const router = Router();

router.post("/", validate({ body: watermarkBodySchema }), watermarkPdf);

export default router;
