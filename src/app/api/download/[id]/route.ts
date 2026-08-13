import { NextResponse } from "next/server";

import { apiHandler } from "@/lib/server/apiHandler";
import { parseOrThrow } from "@/lib/server/validate";
import { idParamSchema } from "@/lib/server/validators/common.validator";
import { downloadService } from "@/lib/server/services";
import { getMimeTypeForFilename } from "@/lib/server/fileValidator";

/**
 * Serves the generated file's bytes directly from this route instead of
 * redirecting to a cross-origin Supabase Storage URL. The redirect approach
 * verified correctly in every automated test (curl/fetch and a scripted
 * Playwright click all completed successfully), but a cross-origin
 * redirect target is exactly the one condition under which browsers are
 * spec-required to drop the `<a download>` attribute — streaming the bytes
 * from this same-origin route removes that variable entirely.
 */
export const GET = apiHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = parseOrThrow(idParamSchema, await params, "path parameters");

  const url = new URL(req.url);
  const displayName = url.searchParams.get("name") ?? undefined;

  const { bytes, filename } = await downloadService.getGeneratedFile(id, displayName);

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": getMimeTypeForFilename(filename),
      "Content-Disposition": buildContentDisposition(filename),
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
});

/**
 * RFC 5987-safe Content-Disposition: `filename` is an ASCII fallback for
 * old clients, `filename*` carries the exact UTF-8 name for everyone else.
 * Ported from the old Express backend's `download.service.ts`, which used
 * this before downloads moved to Supabase's own `?download=` param —
 * brought back now that this route owns the response headers directly.
 */
function buildContentDisposition(filename: string): string {
  const asciiFallback = filename.replace(/[^\x20-\x7E]/g, "_").replace(/[\\"]/g, (char) => `\\${char}`);
  const encoded = encodeURIComponent(filename);
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}
