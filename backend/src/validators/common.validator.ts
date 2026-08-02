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
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|docx|pptx|xlsx|jpe?g|png|zip)$/i;

export const storedFileIdSchema = z.string().regex(STORED_FILENAME_PATTERN, "Invalid file id");

/** Reused by every route shaped as `GET /something/:id`. */
export const idParamSchema = z.object({
  id: storedFileIdSchema,
});

export type IdParam = z.infer<typeof idParamSchema>;

/**
 * Shared by Extract Pages and Delete Pages — both take a `fileId` plus a
 * flat list of 1-indexed page numbers, and differ only in what they *do*
 * with that list (keep them vs. remove them), which lives in each tool's
 * own service.
 */
export const pagesBodySchema = z.object({
  fileId: storedFileIdSchema,
  pages: z
    .array(z.number().int().positive())
    .min(1, "Select at least one page")
    .refine((pages) => new Set(pages).size === pages.length, {
      message: "Duplicate page numbers are not allowed",
    }),
});

export type PagesBody = z.infer<typeof pagesBodySchema>;
