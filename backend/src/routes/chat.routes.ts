import { Router } from "express";

import { sendChatMessage } from "../controllers/chat.controller";
import { validate } from "../middlewares/validate.middleware";
import { heavyProcessingLimiter } from "../middlewares/rateLimiter.middleware";
import { chatBodySchema } from "../validators/chat.validator";

const router = Router();

router.post("/", heavyProcessingLimiter, validate({ body: chatBodySchema }), sendChatMessage);

export default router;
