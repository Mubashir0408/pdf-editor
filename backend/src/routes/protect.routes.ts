import { Router } from "express";

import { protectPdf } from "../controllers/protect.controller";
import { validate } from "../middlewares/validate.middleware";
import { protectBodySchema } from "../validators/protect.validator";

const router = Router();

router.post("/", validate({ body: protectBodySchema }), protectPdf);

export default router;
