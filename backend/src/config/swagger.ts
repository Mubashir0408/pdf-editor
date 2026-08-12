import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import type { RequestHandler } from "express";

/**
 * Documentation-only module: an OpenAPI 3.0 document describing the real
 * routes registered in `routes/index.ts`, plus the Express wiring to serve
 * it as interactive Swagger UI at `/api-docs`. Nothing here is imported by
 * any route, controller, service, or validator — this file only *describes*
 * them from the outside, so it can't change how any of them behave.
 *
 * The spec is hand-written (not generated from JSDoc comments on the route
 * files) specifically so that adding documentation never means touching
 * the actual route/controller/validator source.
 */

const fileIdParam = {
  name: "id",
  in: "path" as const,
  required: true,
  description:
    "A stored file id — the `id` a prior `/upload` (for source files) or a tool response's `downloadUrl` (for generated output) returned. Shaped as `<uuid>.<extension>`.",
  schema: { type: "string" as const, example: "3fe57c09-253b-4bf8-873d-395b152c85de.pdf" },
};

const storedFileId = {
  type: "string" as const,
  description: "The `id` field from a prior `POST /upload` response.",
  example: "3fe57c09-253b-4bf8-873d-395b152c85de.pdf",
};

const processedFileResponse = {
  type: "object" as const,
  properties: {
    id: { type: "string", description: "Generated output file id (pass to `/download/{id}`)." },
    tool: { type: "string", example: "merge" },
    outputName: { type: "string", example: "Merged Document.pdf" },
    size: { type: "integer", description: "Output file size in bytes." },
    downloadUrl: { type: "string", example: "/download/db771364-....pdf?name=Merged%20Document.pdf" },
    createdAt: { type: "string", format: "date-time" },
  },
  required: ["id", "tool", "outputName", "size", "downloadUrl", "createdAt"],
};

function successEnvelope(dataSchema: object) {
  return {
    type: "object" as const,
    properties: {
      success: { type: "boolean", enum: [true] },
      message: { type: "string" },
      data: dataSchema,
    },
    required: ["success", "message", "data"],
  };
}

function processedFileSuccess(description: string, status = "201") {
  return {
    [status]: {
      description,
      content: { "application/json": { schema: successEnvelope(processedFileResponse) } },
    },
  };
}

/** Every error shape in this API shares this envelope (see `ApiResponse.ts` / `error.middleware.ts`). */
const apiErrorSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", enum: [false] },
    message: { type: "string" },
    errors: {
      type: "array",
      items: {
        type: "object",
        properties: { field: { type: "string" }, message: { type: "string" } },
      },
    },
    status: { type: "integer" },
    timestamp: { type: "string", format: "date-time" },
    requestId: { type: "string" },
  },
  required: ["success", "message", "errors", "status", "timestamp", "requestId"],
};

/** Reusable error responses, referenced by every documented operation. */
const errorResponses = {
  ValidationError: {
    description: "The request body/params/query failed schema validation.",
    content: { "application/json": { schema: apiErrorSchema } },
  },
  NotFound: {
    description: "The referenced file id doesn't exist or has expired (uploads/generated files are cleaned up periodically).",
    content: { "application/json": { schema: apiErrorSchema } },
  },
  UnsupportedMediaType: {
    description: "The uploaded file's extension/mime type isn't one of: PDF, DOCX, PPTX, XLSX, JPG, PNG.",
    content: { "application/json": { schema: apiErrorSchema } },
  },
  PayloadTooLarge: {
    description: "The uploaded file exceeds the server's configured maximum upload size.",
    content: { "application/json": { schema: apiErrorSchema } },
  },
  UsageLimitReached: {
    description:
      "Guest usage limit reached for this feature (2 free uses without signing in). Only applies to unauthenticated requests — a valid `Authorization: Bearer <Supabase access token>` header bypasses this entirely. No-op (never returned) if Supabase isn't configured on the server.",
    content: { "application/json": { schema: apiErrorSchema } },
  },
  TooManyRequests: {
    description: "Global or per-route rate limit exceeded.",
    content: { "application/json": { schema: apiErrorSchema } },
  },
  ServerError: {
    description: "Unexpected server error.",
    content: { "application/json": { schema: apiErrorSchema } },
  },
};

/** Shared description block, attached to every tool endpoint that sits
 *  behind the guest usage limit (see `usage.middleware.ts`). */
const usageLimitNote =
  "\n\n**Usage limit:** guests get 2 free uses of this endpoint (tracked by an anonymous cookie); a valid `Authorization: Bearer <Supabase access token>` bypasses the limit entirely. A successful call only counts against the limit if the operation actually succeeds.";

function toolOperation(opts: {
  summary: string;
  description: string;
  requestBody: object;
  successDescription: string;
  successStatus?: string;
  extraErrors?: (keyof typeof errorResponses)[];
}) {
  const responses: Record<string, unknown> = {
    ...processedFileSuccess(opts.successDescription, opts.successStatus ?? "201"),
    "400": errorResponses.ValidationError,
    "404": errorResponses.NotFound,
    "429": errorResponses.UsageLimitReached,
    "500": errorResponses.ServerError,
  };
  for (const key of opts.extraErrors ?? []) {
    responses[key === "UnsupportedMediaType" ? "415" : key === "PayloadTooLarge" ? "413" : "429"] =
      errorResponses[key];
  }

  return {
    summary: opts.summary,
    description: opts.description + usageLimitNote,
    tags: ["PDF Tools"],
    security: [{ bearerAuth: [] }, {}],
    requestBody: {
      required: true,
      content: { "application/json": { schema: opts.requestBody } },
    },
    responses,
  };
}

export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Docy API",
    version: "1.0.0",
    description:
      "Stateless PDF processing API — every tool follows the same shape: reference a previously uploaded file by id, get back a processed-file id and a `/download` URL. No accounts or database; files are held on disk temporarily and swept after `TEMP_FILE_MAX_AGE_MS`. This document is generated from the real Express routes and Zod validators — it does not describe anything not already implemented.",
  },
  servers: [{ url: "/", description: "This server" }],
  tags: [
    { name: "System", description: "Health and file metadata." },
    { name: "Files", description: "Upload and download." },
    { name: "PDF Tools", description: "The actual conversion/editing operations." },
    { name: "Translate", description: "Async translation job (start + poll)." },
    { name: "Usage", description: "Guest usage-limit status, and the check-in used by client-only tools (Convert/Compress/OCR) that have no processing endpoint of their own." },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Optional. A Supabase access token. When present and valid, the request is treated as an authenticated user and bypasses the guest usage limit entirely.",
      },
    },
    responses: errorResponses,
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        description: "Always returns 200 while the process is up — this app is stateless, so there's nothing else to check.",
        tags: ["System"],
        responses: {
          "200": {
            description: "Service is healthy.",
            content: {
              "application/json": {
                schema: successEnvelope({
                  type: "object",
                  properties: {
                    status: { type: "string", enum: ["ok"] },
                    version: { type: "string" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                }),
              },
            },
          },
        },
      },
    },

    "/upload": {
      post: {
        summary: "Upload a file",
        description:
          "Accepts a single file, stores it under a generated id, and returns that id for use in every tool endpoint below. Allowed types: PDF, DOCX, PPTX, XLSX, JPG, PNG.",
        tags: ["Files"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary", description: "The file to upload (field name must be `file`). Max size is server-configured (`MAX_UPLOAD_SIZE`, default 100MB)." },
                },
                required: ["file"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "File uploaded.",
            content: {
              "application/json": {
                schema: successEnvelope({
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    originalName: { type: "string" },
                    mimeType: { type: "string" },
                    extension: { type: "string" },
                    size: { type: "integer" },
                    status: { type: "string", enum: ["UPLOADED"] },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                  },
                }),
              },
            },
          },
          "400": { description: "No file provided under the `file` field.", content: { "application/json": { schema: apiErrorSchema } } },
          "413": errorResponses.PayloadTooLarge,
          "415": errorResponses.UnsupportedMediaType,
          "500": errorResponses.ServerError,
        },
      },
    },

    "/pdf-info/{id}": {
      get: {
        summary: "Get a PDF's page count",
        description: "Used by page-selection tools (Split/Rotate/Extract/Delete) to know the real page count of an uploaded PDF.",
        tags: ["System"],
        parameters: [fileIdParam],
        responses: {
          "200": {
            description: "Page count.",
            content: { "application/json": { schema: successEnvelope({ type: "object", properties: { pageCount: { type: "integer" } } }) } },
          },
          "404": errorResponses.NotFound,
          "500": errorResponses.ServerError,
        },
      },
    },

    "/download/{id}": {
      get: {
        summary: "Download a generated file",
        description: "Streams a previously generated output file (from any tool's `downloadUrl`) as an attachment.",
        tags: ["Files"],
        parameters: [
          fileIdParam,
          {
            name: "name",
            in: "query",
            required: false,
            description: "Display filename for the download (from the tool response's `downloadUrl` query string).",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "The file's raw bytes, with `Content-Type`/`Content-Disposition` set for the file type.",
            content: { "application/octet-stream": { schema: { type: "string", format: "binary" } } },
          },
          "404": { description: "File no longer available (already downloaded/swept, or never existed).", content: { "application/json": { schema: apiErrorSchema } } },
          "500": errorResponses.ServerError,
        },
      },
    },

    "/merge": {
      post: toolOperation({
        summary: "Merge PDFs",
        description: "Combines 2–20 previously uploaded PDFs into one, in the given order.",
        requestBody: {
          type: "object",
          properties: { fileIds: { type: "array", items: storedFileId, minItems: 2, maxItems: 20 } },
          required: ["fileIds"],
        },
        successDescription: "Merged PDF created.",
      }),
    },

    "/split": {
      post: toolOperation({
        summary: "Split a PDF",
        description:
          "Two modes: `range` splits by explicit page groups you provide (one output file per group, packaged as a zip if more than one); `pages` splits every page into its own file.",
        requestBody: {
          oneOf: [
            {
              type: "object",
              properties: {
                mode: { type: "string", enum: ["range"] },
                fileId: storedFileId,
                groups: {
                  type: "array",
                  description: "One or more groups of 1-indexed page numbers; each group becomes one output file.",
                  items: { type: "array", items: { type: "integer", minimum: 1 } },
                  minItems: 1,
                },
              },
              required: ["mode", "fileId", "groups"],
            },
            {
              type: "object",
              properties: { mode: { type: "string", enum: ["pages"] }, fileId: storedFileId },
              required: ["mode", "fileId"],
            },
          ],
        },
        successDescription: "Split output created (a single PDF for one group, otherwise a zip).",
      }),
    },

    "/rotate": {
      post: toolOperation({
        summary: "Rotate pages",
        description: "Rotates specific pages of a PDF to an absolute angle.",
        requestBody: {
          type: "object",
          properties: {
            fileId: storedFileId,
            rotations: {
              type: "object",
              description: "Map of 1-indexed page number (as a string key) -> absolute rotation in degrees (multiple of 90).",
              additionalProperties: { type: "integer", multipleOf: 90 },
              example: { "1": 90, "3": 180 },
            },
          },
          required: ["fileId", "rotations"],
        },
        successDescription: "Rotated PDF created.",
      }),
    },

    "/extract-pages": {
      post: toolOperation({
        summary: "Extract pages",
        description: "Creates a new PDF containing only the given pages, in the order listed.",
        requestBody: {
          type: "object",
          properties: {
            fileId: storedFileId,
            pages: { type: "array", items: { type: "integer", minimum: 1 }, minItems: 1, description: "1-indexed page numbers, no duplicates." },
          },
          required: ["fileId", "pages"],
        },
        successDescription: "PDF with the extracted pages created.",
      }),
    },

    "/delete-pages": {
      post: toolOperation({
        summary: "Delete pages",
        description: "Creates a new PDF with the given pages removed.",
        requestBody: {
          type: "object",
          properties: {
            fileId: storedFileId,
            pages: { type: "array", items: { type: "integer", minimum: 1 }, minItems: 1, description: "1-indexed page numbers to remove, no duplicates." },
          },
          required: ["fileId", "pages"],
        },
        successDescription: "PDF with the pages removed created.",
      }),
    },

    "/protect": {
      post: toolOperation({
        summary: "Password-protect a PDF",
        description: "Encrypts a PDF with a password, and optionally restricts printing/copying.",
        requestBody: {
          type: "object",
          properties: {
            fileId: storedFileId,
            password: { type: "string", minLength: 6 },
            confirmPassword: { type: "string", description: "Must match `password`." },
            allowPrinting: { type: "boolean", default: true },
            allowCopying: { type: "boolean", default: false },
          },
          required: ["fileId", "password", "confirmPassword"],
        },
        successDescription: "Password-protected PDF created.",
      }),
    },

    "/watermark": {
      post: toolOperation({
        summary: "Add a text watermark",
        description: "Stamps text onto every page of a PDF.",
        requestBody: {
          type: "object",
          properties: {
            fileId: storedFileId,
            text: { type: "string", minLength: 1, maxLength: 100 },
            position: { type: "string", enum: ["center", "diagonal", "top-left", "top-right", "bottom-left", "bottom-right"] },
            opacity: { type: "number", minimum: 10, maximum: 100, description: "Percent." },
            fontSize: { type: "integer", minimum: 8, maximum: 120 },
            rotation: { type: "number", minimum: -180, maximum: 180, description: "Degrees." },
          },
          required: ["fileId", "text", "position", "opacity", "fontSize", "rotation"],
        },
        successDescription: "Watermarked PDF created.",
      }),
    },

    "/word-to-pdf": {
      post: toolOperation({
        summary: "Convert Word to PDF",
        description: "Converts a previously uploaded .docx to PDF.",
        requestBody: { type: "object", properties: { fileId: storedFileId }, required: ["fileId"] },
        successDescription: "PDF created.",
      }),
    },
    "/excel-to-pdf": {
      post: toolOperation({
        summary: "Convert Excel to PDF",
        description: "Converts a previously uploaded .xlsx to PDF (each sheet becomes a page).",
        requestBody: { type: "object", properties: { fileId: storedFileId }, required: ["fileId"] },
        successDescription: "PDF created.",
      }),
    },
    "/powerpoint-to-pdf": {
      post: toolOperation({
        summary: "Convert PowerPoint to PDF",
        description: "Converts a previously uploaded .pptx to PDF (each slide becomes a page).",
        requestBody: { type: "object", properties: { fileId: storedFileId }, required: ["fileId"] },
        successDescription: "PDF created.",
      }),
    },

    "/image-to-pdf": {
      post: toolOperation({
        summary: "Convert images to PDF",
        description: "Combines 1–30 previously uploaded JPG/PNG images into one PDF, one image per page.",
        requestBody: {
          type: "object",
          properties: { fileIds: { type: "array", items: storedFileId, minItems: 1, maxItems: 30 } },
          required: ["fileIds"],
        },
        successDescription: "PDF created.",
      }),
    },

    "/pdf-to-image": {
      post: toolOperation({
        summary: "Convert PDF to image(s)",
        description: "Renders each page of a PDF to an image. A single-page PDF returns one image; multi-page returns a zip.",
        requestBody: {
          type: "object",
          properties: { fileId: storedFileId, format: { type: "string", enum: ["png", "jpg"], default: "png" } },
          required: ["fileId"],
        },
        successDescription: "Image (or zip of images) created.",
      }),
    },

    "/pdf-to-word": {
      post: toolOperation({
        summary: "Convert PDF to Word",
        description: "Extracts a PDF's text into an editable .docx. Fails if the PDF has no extractable text (e.g. a scanned document).",
        requestBody: { type: "object", properties: { fileId: storedFileId }, required: ["fileId"] },
        successDescription: "DOCX created.",
      }),
    },

    "/translate": {
      post: {
        summary: "Start a PDF translation job",
        description:
          "Translation is slow (OCR fallback for scanned pages + batched translation calls), so it runs as a background job — this starts it and returns a `jobId` to poll." + usageLimitNote,
        tags: ["Translate"],
        security: [{ bearerAuth: [] }, {}],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fileId: storedFileId,
                  sourceLang: { type: "string", description: "ISO language code, or \"auto\" to detect.", default: "auto" },
                  targetLang: { type: "string", description: "ISO language code." },
                },
                required: ["fileId", "targetLang"],
              },
            },
          },
        },
        responses: {
          "202": {
            description: "Job accepted and started.",
            content: { "application/json": { schema: successEnvelope({ type: "object", properties: { jobId: { type: "string", format: "uuid" } } }) } },
          },
          "400": errorResponses.ValidationError,
          "429": errorResponses.UsageLimitReached,
          "500": errorResponses.ServerError,
        },
      },
    },
    "/translate/{jobId}": {
      get: {
        summary: "Get translation job status",
        description: "Poll this until `status` is `done` or `error`.",
        tags: ["Translate"],
        parameters: [{ name: "jobId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": {
            description: "Current job status.",
            content: {
              "application/json": {
                schema: successEnvelope({
                  type: "object",
                  properties: {
                    status: { type: "string", enum: ["processing", "done", "error"] },
                    stage: { type: "string", enum: ["extracting", "ocr", "translating", "rendering", "done", "error"] },
                    progress: { type: "integer", minimum: 0, maximum: 100 },
                    current: { type: "integer" },
                    total: { type: "integer" },
                    error: { type: "string" },
                    result: {
                      type: "object",
                      description: "Present only once status is \"done\".",
                      properties: {
                        translatedText: { type: "string" },
                        ocrPageCount: { type: "integer" },
                        files: {
                          type: "object",
                          properties: { pdf: processedFileResponse, txt: processedFileResponse, docx: processedFileResponse },
                        },
                      },
                    },
                  },
                }),
              },
            },
          },
          "404": { description: "Job not found or expired.", content: { "application/json": { schema: apiErrorSchema } } },
        },
      },
    },

    "/usage/{feature}": {
      get: {
        summary: "Get remaining guest uses for a feature",
        description:
          "Read-only — never counts as a use. For a signed-in caller (valid `Authorization: Bearer`), `remaining`/`limit` are `null` (unlimited). Also `null` if Supabase isn't configured on the server.",
        tags: ["Usage"],
        security: [{ bearerAuth: [] }, {}],
        parameters: [
          {
            name: "feature",
            in: "path",
            required: true,
            description: "One of the gated feature keys (matches tool route names, plus `convert`/`compress`/`ocr` for the client-only tools).",
            schema: {
              type: "string",
              enum: [
                "merge", "split", "rotate", "extract-pages", "delete-pages", "protect", "watermark",
                "word-to-pdf", "excel-to-pdf", "powerpoint-to-pdf", "image-to-pdf", "pdf-to-image",
                "pdf-to-word", "translate", "convert", "compress", "ocr",
              ],
            },
          },
        ],
        responses: {
          "200": {
            description: "Usage status.",
            content: {
              "application/json": {
                schema: successEnvelope({
                  type: "object",
                  properties: {
                    authenticated: { type: "boolean" },
                    remaining: { type: "integer", nullable: true },
                    limit: { type: "integer", nullable: true },
                  },
                }),
              },
            },
          },
          "400": { description: "Unknown feature key.", content: { "application/json": { schema: apiErrorSchema } } },
        },
      },
    },
    "/usage/{feature}/check": {
      post: {
        summary: "Check in a use for a client-only tool",
        description:
          "Convert, Compress, and OCR run entirely client-side (no processing endpoint of their own), so this endpoint stands in for \"the operation\" from a usage-limit perspective: it checks the guest limit and increments in one step. Same bypass rules as every other gated endpoint." + usageLimitNote,
        tags: ["Usage"],
        security: [{ bearerAuth: [] }, {}],
        parameters: [
          {
            name: "feature",
            in: "path",
            required: true,
            schema: { type: "string", enum: ["convert", "compress", "ocr"] },
          },
        ],
        responses: {
          "200": {
            description: "Usage recorded.",
            content: {
              "application/json": {
                schema: successEnvelope({
                  type: "object",
                  properties: { authenticated: { type: "boolean" }, remaining: { type: "integer", nullable: true } },
                }),
              },
            },
          },
          "400": errorResponses.ValidationError,
          "429": errorResponses.UsageLimitReached,
        },
      },
    },
  },
};

/**
 * The global app-wide CSP (see `app.ts`) is intentionally locked down to
 * `script-src 'none'; style-src 'none'` — correct for a JSON API that never
 * serves its own HTML/JS/CSS, but Swagger UI's page *is* HTML/JS/CSS.
 * Rather than loosen the app-wide policy, this applies a second, narrower
 * `helmet()` pass scoped to only the `/api-docs` path: same locked-down
 * baseline (no third-party origins, no `unsafe-eval`, no framing), with
 * just enough added to let Swagger UI's own same-origin bundle
 * (`swagger-ui-bundle.js` et al., served by `swaggerUi.serve` below) and
 * its one inline `<style>` tag render. Every other route is completely
 * unaffected — this middleware is never mounted outside `/api-docs`.
 */
const docsCsp = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      baseUri: ["'none'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      // Swagger UI's own bundled CSS embeds a couple of small icons (e.g.
      // the schema-expand arrow) as inline `data:` SVGs.
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

/** Mount at `/api-docs`: `app.use("/api-docs", swaggerDocsMiddleware)`. */
export const swaggerDocsMiddleware: RequestHandler[] = [
  docsCsp,
  ...swaggerUi.serve,
  swaggerUi.setup(openapiSpec, { customSiteTitle: "Docy API Docs" }),
];
