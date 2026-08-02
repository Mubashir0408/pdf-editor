import { Router } from "express";

import { getFileById } from "../controllers/file.controller";
import { validate } from "../middlewares/validate.middleware";
import { getFileParamsSchema } from "../validators/file.validator";

const router = Router();

router.get("/:id", validate({ params: getFileParamsSchema }), getFileById);

export default router;
