import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";

export const GET = apiHandler(async () => {
  return sendSuccess({
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});
