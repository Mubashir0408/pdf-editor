import { Router } from "express";

import { downloadFile } from "../controllers/download.controller";
import { validate } from "../middlewares/validate.middleware";
import { idParamSchema } from "../validators/common.validator";

const router = Router();

router.get("/:id", validate({ params: idParamSchema }), downloadFile);

export default router;
