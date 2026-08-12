import type { Request, Response } from "express";

import { chatService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import type { ChatBody } from "../validators/chat.validator";

export const sendChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as ChatBody;

  const reply = await chatService.ask(body);

  sendSuccess(res, { reply }, "Reply generated", 200);
});
