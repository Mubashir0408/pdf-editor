import { Router } from "express";

import { extractPages } from "../controllers/extractPages.controller";
import { validate } from "../middlewares/validate.middleware";
import { extractPagesBodySchema } from "../validators/extractPages.validator";

const router = Router();

router.post("/", validate({ body: extractPagesBodySchema }), extractPages);

export default router;
