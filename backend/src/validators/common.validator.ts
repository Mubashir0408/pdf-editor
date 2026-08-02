import { z } from "zod";

/**
 * Matches exactly the filenames our own storage layer generates
 * (`<uuid>.<ext>`, from `generateStoredFileName`) — nothing else. Every
 * route that takes a file id straight from a client and later joins it
 * onto `uploadDir`/`generatedDir` validates it against this first, which
 * is what rules out path traversal: a value that doesn't match this exact
 * shape (no slashes, no `..`, no arbitrary extension) never reaches
 * `path.join`.
 */
const STORED_FILENAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|docx|pptx|xlsx|jpe?g|png)$/i;

export const storedFileIdSchema = z.string().regex(STORED_FILENAME_PATTERN, "Invalid file id");

/** Reused by every route shaped as `GET /something/:id`. */
export const idParamSchema = z.object({
  id: storedFileIdSchema,
});

export type IdParam = z.infer<typeof idParamSchema>;
