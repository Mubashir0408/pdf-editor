import { Router } from "express";

import { deletePages } from "../controllers/deletePages.controller";
import { validate } from "../middlewares/validate.middleware";
import { enforceUsage } from "../middlewares/usage.middleware";
import { deletePagesBodySchema } from "../validators/deletePages.validator";

const router = Router();

router.post("/", enforceUsage("delete-pages"), validate({ body: deletePagesBodySchema }), deletePages);

export default router;
