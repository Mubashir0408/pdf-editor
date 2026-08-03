import { Router } from "express";

import { convertWordToPdf } from "../controllers/wordToPdf.controller";
import { validate } from "../middlewares/validate.middleware";
import { wordToPdfBodySchema } from "../validators/wordToPdf.validator";

const router = Router();

router.post("/", validate({ body: wordToPdfBodySchema }), convertWordToPdf);

export default router;
