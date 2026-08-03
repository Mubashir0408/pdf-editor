import { Router } from "express";

import { convertExcelToPdf } from "../controllers/excelToPdf.controller";
import { validate } from "../middlewares/validate.middleware";
import { excelToPdfBodySchema } from "../validators/excelToPdf.validator";

const router = Router();

router.post("/", validate({ body: excelToPdfBodySchema }), convertExcelToPdf);

export default router;
