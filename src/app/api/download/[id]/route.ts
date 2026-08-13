import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/server/apiHandler";
import { parseOrThrow } from "@/lib/server/validate";
import { idParamSchema } from "@/lib/server/validators/common.validator";
import { downloadService } from "@/lib/server/services";

/**
 * Replaces the old Express `download.controller.ts`'s
 * `streamToResponse` — instead of proxying bytes through this serverless
 * function, this redirects to a short-lived Supabase Storage signed URL
 * (with `?download=` set, so Supabase attaches the right
 * `Content-Disposition` header itself) — avoids consuming function
 * execution time/response size on a potentially large file.
 */
export const GET = apiHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = parseOrThrow(idParamSchema, await params, "path parameters");

  const url = new URL(req.url);
  const displayName = url.searchParams.get("name") ?? undefined;

  const signedUrl = await downloadService.getSignedDownloadUrl(id, displayName);
  return NextResponse.redirect(signedUrl);
});
