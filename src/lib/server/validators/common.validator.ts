import { z } from "zod";

const STORED_FILENAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|docx|pptx|xlsx|jpe?g|png|zip|txt)$/i;

export const storedFileIdSchema = z.string().regex(STORED_FILENAME_PATTERN, "Invalid file id");

export const idParamSchema = z.object({
  id: storedFileIdSchema,
});

export type IdParam = z.infer<typeof idParamSchema>;

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
