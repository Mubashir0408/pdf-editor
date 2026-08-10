import { Router } from "express";

import { extractPages } from "../controllers/extractPages.controller";
import { validate } from "../middlewares/validate.middleware";
import { enforceUsage } from "../middlewares/usage.middleware";
import { extractPagesBodySchema } from "../validators/extractPages.validator";

const router = Router();

router.post("/", enforceUsage("extract-pages"), validate({ body: extractPagesBodySchema }), extractPages);

export default router;
