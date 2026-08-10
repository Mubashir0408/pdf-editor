import { Router } from "express";

import { rotatePdf } from "../controllers/rotate.controller";
import { validate } from "../middlewares/validate.middleware";
import { enforceUsage } from "../middlewares/usage.middleware";
import { rotateBodySchema } from "../validators/rotate.validator";

const router = Router();

router.post("/", enforceUsage("rotate"), validate({ body: rotateBodySchema }), rotatePdf);

export default router;
