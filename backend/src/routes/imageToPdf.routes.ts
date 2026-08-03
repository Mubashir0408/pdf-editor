import { Router } from "express";

import { convertImageToPdf } from "../controllers/imageToPdf.controller";
import { validate } from "../middlewares/validate.middleware";
import { imageToPdfBodySchema } from "../validators/imageToPdf.validator";

const router = Router();

router.post("/", validate({ body: imageToPdfBodySchema }), convertImageToPdf);

export default router;
