import { Router } from "express";

import { rotatePdf } from "../controllers/rotate.controller";
import { validate } from "../middlewares/validate.middleware";
import { rotateBodySchema } from "../validators/rotate.validator";

const router = Router();

router.post("/", validate({ body: rotateBodySchema }), rotatePdf);

export default router;
