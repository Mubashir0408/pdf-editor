import { Router } from "express";

import { deletePages } from "../controllers/deletePages.controller";
import { validate } from "../middlewares/validate.middleware";
import { deletePagesBodySchema } from "../validators/deletePages.validator";

const router = Router();

router.post("/", validate({ body: deletePagesBodySchema }), deletePages);

export default router;
