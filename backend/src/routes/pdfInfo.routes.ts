import { Router } from "express";

import { getPdfInfo } from "../controllers/pdfInfo.controller";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/common.validator";

const router = Router();

router.get("/:id", validate({ params: idParamSchema }), getPdfInfo);

export default router;
