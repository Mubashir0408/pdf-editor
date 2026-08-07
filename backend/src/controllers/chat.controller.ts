import type { Request, Response } from "express";

import { chatService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { logger } from "../config/logger";
import type { ChatBody } from "../validators/chat.validator";

export const sendChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as ChatBody;

  const result = await chatService.ask(body);

  logger.info({ requestId: req.id, hasFile: Boolean(body.fileId) }, "AI chat message answered");

  sendSuccess(res, result, "Chat response generated", 200);
});
