import { Router } from "express";

import { convertPdfToWord } from "../controllers/pdfToWord.controller";
import { validate } from "../middlewares/validate.middleware";
import { pdfToWordBodySchema } from "../validators/pdfToWord.validator";

const router = Router();

router.post("/", validate({ body: pdfToWordBodySchema }), convertPdfToWord);

export default router;
