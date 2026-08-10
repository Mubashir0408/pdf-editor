import { Router } from "express";

import { getUsageStatus, checkInUsage } from "../controllers/usage.controller";
import { guestIdMiddleware } from "../middlewares/guestId.middleware";
import { validate } from "../middlewares/validate.middleware";
import { featureParamSchema } from "../validators/usage.validator";

const router = Router();

router.get("/:feature", guestIdMiddleware, validate({ params: featureParamSchema }), getUsageStatus);
router.post("/:feature/check", guestIdMiddleware, validate({ params: featureParamSchema }), checkInUsage);

export default router;
