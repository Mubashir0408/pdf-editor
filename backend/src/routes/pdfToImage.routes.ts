import { Router } from "express";

import { convertPdfToImage } from "../controllers/pdfToImage.controller";
import { validate } from "../middlewares/validate.middleware";
import { pdfToImageBodySchema } from "../validators/pdfToImage.validator";

const router = Router();

router.post("/", validate({ body: pdfToImageBodySchema }), convertPdfToImage);

export default router;
