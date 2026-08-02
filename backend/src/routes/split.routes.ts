import { Router } from "express";

import { splitPdf } from "../controllers/split.controller";
import { validate } from "../middlewares/validate.middleware";
import { splitBodySchema } from "../validators/split.validator";

const router = Router();

router.post("/", validate({ body: splitBodySchema }), splitPdf);

export default router;
