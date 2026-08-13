/**
 * Ported from the old Express backend's `config/swagger.ts` — pure data,
 * no framework dependency, so it moves over unchanged except every route
 * path gains the `/api` prefix routes now live under (App Router Route
 * Handlers under `src/app/api/`), and `servers` reflects the single
 * same-origin deployment (no more separate backend origin).
 */

const fileIdParam = {
  name: "id",
  in: "path" as const,
  required: true,
  description:
    "A stored file id — the `id` a prior `/api/upload/complete` (for source files) or a tool response's `downloadUrl` (for generated output) returned. Shaped as `<uuid>.<extension>`.",
  schema: { type: "string" as const, example: "3fe57c09-253b-4bf8-873d-395b152c85de.pdf" },
};

const storedFileId = {
  type: "string" as const,
  description: "The `id` field from a prior upload.",
  example: "3fe57c09-253b-4bf8-873d-395b152c85de.pdf",
};

const processedFileResponse = {
  type: "object" as const,
  properties: {
    id: { type: "string", description: "Generated output file id (pass to `/api/download/{id}`)." },
    tool: { type: "string", example: "merge" },
    outputName: { type: "string", example: "Merged Document.pdf" },
    size: { type: "integer", description: "Output file size in bytes." },
    downloadUrl: { type: "string", example: "/api/download/db771364-....pdf?name=Merged%20Document.pdf" },
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

const errorResponses = {
  ValidationError: {
    description: "The request body/params/query failed schema validation.",
    content: { "application/json": { schema: apiErrorSchema } },
  },
  NotFound: {
    description: "The referenced file id doesn't exist or has expired (Storage objects are swept periodically).",
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
      "Guest usage limit reached for this feature (5 free uses without signing in). Only applies to unauthenticated requests — a valid `Authorization: Bearer <Supabase access token>` header bypasses this entirely. No-op (never returned) if Supabase isn't configured on the server.",
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

const usageLimitNote =
  "\n\n**Usage limit:** guests get 5 free uses of this endpoint (tracked by an anonymous cookie); a valid `Authorization: Bearer <Supabase access token>` bypasses the limit entirely. A successful call only counts against the limit if the operation actually succeeds.";

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
    responses[key === "UnsupportedMediaType" ? "415" : key === "PayloadTooLarge" ? "413" : "429"] = errorResponses[key];
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
      "PDF processing API, built as Next.js App Router Route Handlers deployed alongside the frontend on a single Vercel project. Every tool follows the same shape: reference a previously uploaded file by id, get back a processed-file id and a `/api/download` URL. Source/output files live in Supabase Storage temporarily and are swept periodically.",
  },
  servers: [{ url: "/", description: "This server" }],
  tags: [
    { name: "System", description: "Health and file metadata." },
    { name: "Files", description: "Upload and download." },
    { name: "PDF Tools", description: "The actual conversion/editing operations." },
    { name: "Translate", description: "Async translation job (start + poll)." },
    { name: "AI", description: "AI Chat, grounded in an uploaded PDF via OpenRouter." },
    {
      name: "Usage",
      description:
        "Guest usage-limit status, and the check-in used by client-only tools (Convert/Compress/OCR) that have no processing endpoint of their own.",
    },
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
    "/api/health": {
      get: {
        summary: "Health check",
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

    "/api/upload/sign": {
      post: {
        summary: "Step 1 of uploading a file — request a signed Storage upload URL",
        description:
          "Validates the file's type/size and returns a Supabase Storage signed URL the browser PUTs the file bytes to directly (bypassing this server's request-body limit).",
        tags: ["Files"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  originalName: { type: "string" },
                  mimeType: { type: "string" },
                  size: { type: "integer" },
                },
                required: ["originalName", "mimeType", "size"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Signed upload URL created.",
            content: {
              "application/json": {
                schema: successEnvelope({
                  type: "object",
                  properties: { id: { type: "string" }, uploadUrl: { type: "string" } },
                }),
              },
            },
          },
          "413": errorResponses.PayloadTooLarge,
          "415": errorResponses.UnsupportedMediaType,
        },
      },
    },
    "/api/upload/complete": {
      post: {
        summary: "Step 2 of uploading a file — confirm and validate",
        description: "Called after the browser's direct PUT to Storage finishes. Verifies the file's real content matches its extension.",
        tags: ["Files"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { id: storedFileId, originalName: { type: "string" }, mimeType: { type: "string" } },
                required: ["id", "originalName", "mimeType"],
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
          "415": errorResponses.UnsupportedMediaType,
          "404": errorResponses.NotFound,
        },
      },
    },

    "/api/pdf-info/{id}": {
      get: {
        summary: "Get a PDF's page count",
        tags: ["System"],
        parameters: [fileIdParam],
        responses: {
          "200": {
            description: "Page count.",
            content: { "application/json": { schema: successEnvelope({ type: "object", properties: { pageCount: { type: "integer" } } }) } },
          },
          "404": errorResponses.NotFound,
        },
      },
    },

    "/api/download/{id}": {
      get: {
        summary: "Download a generated file",
        description: "Redirects to a short-lived signed Supabase Storage URL for the file.",
        tags: ["Files"],
        parameters: [
          fileIdParam,
          { name: "name", in: "query", required: false, description: "Display filename for the download.", schema: { type: "string" } },
        ],
        responses: {
          "302": { description: "Redirect to a signed Storage URL." },
          "404": { description: "File no longer available.", content: { "application/json": { schema: apiErrorSchema } } },
        },
      },
    },

    "/api/merge": {
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
    "/api/split": {
      post: toolOperation({
        summary: "Split a PDF",
        description: "Two modes: `range` splits by explicit page groups; `pages` splits every page into its own file.",
        requestBody: {
          oneOf: [
            {
              type: "object",
              properties: {
                mode: { type: "string", enum: ["range"] },
                fileId: storedFileId,
                groups: { type: "array", items: { type: "array", items: { type: "integer", minimum: 1 } }, minItems: 1 },
              },
              required: ["mode", "fileId", "groups"],
            },
            { type: "object", properties: { mode: { type: "string", enum: ["pages"] }, fileId: storedFileId }, required: ["mode", "fileId"] },
          ],
        },
        successDescription: "Split output created (a single PDF for one group, otherwise a zip).",
      }),
    },
    "/api/rotate": {
      post: toolOperation({
        summary: "Rotate pages",
        description: "Rotates specific pages of a PDF to an absolute angle.",
        requestBody: {
          type: "object",
          properties: {
            fileId: storedFileId,
            rotations: { type: "object", additionalProperties: { type: "integer", multipleOf: 90 }, example: { "1": 90, "3": 180 } },
          },
          required: ["fileId", "rotations"],
        },
        successDescription: "Rotated PDF created.",
      }),
    },
    "/api/extract-pages": {
      post: toolOperation({
        summary: "Extract pages",
        requestBody: {
          type: "object",
          properties: { fileId: storedFileId, pages: { type: "array", items: { type: "integer", minimum: 1 }, minItems: 1 } },
          required: ["fileId", "pages"],
        },
        description: "Creates a new PDF containing only the given pages, in the order listed.",
        successDescription: "PDF with the extracted pages created.",
      }),
    },
    "/api/delete-pages": {
      post: toolOperation({
        summary: "Delete pages",
        requestBody: {
          type: "object",
          properties: { fileId: storedFileId, pages: { type: "array", items: { type: "integer", minimum: 1 }, minItems: 1 } },
          required: ["fileId", "pages"],
        },
        description: "Creates a new PDF with the given pages removed.",
        successDescription: "PDF with the pages removed created.",
      }),
    },
    "/api/protect": {
      post: toolOperation({
        summary: "Password-protect a PDF",
        requestBody: {
          type: "object",
          properties: {
            fileId: storedFileId,
            password: { type: "string", minLength: 6 },
            confirmPassword: { type: "string" },
            allowPrinting: { type: "boolean", default: true },
            allowCopying: { type: "boolean", default: false },
          },
          required: ["fileId", "password", "confirmPassword"],
        },
        description: "Encrypts a PDF with a password, and optionally restricts printing/copying.",
        successDescription: "Password-protected PDF created.",
      }),
    },
    "/api/watermark": {
      post: toolOperation({
        summary: "Add a text watermark",
        requestBody: {
          type: "object",
          properties: {
            fileId: storedFileId,
            text: { type: "string", minLength: 1, maxLength: 100 },
            position: { type: "string", enum: ["center", "diagonal", "top-left", "top-right", "bottom-left", "bottom-right"] },
            opacity: { type: "number", minimum: 10, maximum: 100 },
            fontSize: { type: "integer", minimum: 8, maximum: 120 },
            rotation: { type: "number", minimum: -180, maximum: 180 },
          },
          required: ["fileId", "text", "position", "opacity", "fontSize", "rotation"],
        },
        description: "Stamps text onto every page of a PDF.",
        successDescription: "Watermarked PDF created.",
      }),
    },
    "/api/word-to-pdf": {
      post: toolOperation({
        summary: "Convert Word to PDF",
        requestBody: { type: "object", properties: { fileId: storedFileId }, required: ["fileId"] },
        description: "Converts a previously uploaded .docx to PDF.",
        successDescription: "PDF created.",
      }),
    },
    "/api/excel-to-pdf": {
      post: toolOperation({
        summary: "Convert Excel to PDF",
        requestBody: { type: "object", properties: { fileId: storedFileId }, required: ["fileId"] },
        description: "Converts a previously uploaded .xlsx to PDF (each sheet becomes a page).",
        successDescription: "PDF created.",
      }),
    },
    "/api/powerpoint-to-pdf": {
      post: toolOperation({
        summary: "Convert PowerPoint to PDF",
        requestBody: { type: "object", properties: { fileId: storedFileId }, required: ["fileId"] },
        description: "Converts a previously uploaded .pptx to PDF (each slide becomes a page).",
        successDescription: "PDF created.",
      }),
    },
    "/api/image-to-pdf": {
      post: toolOperation({
        summary: "Convert images to PDF",
        requestBody: {
          type: "object",
          properties: { fileIds: { type: "array", items: storedFileId, minItems: 1, maxItems: 30 } },
          required: ["fileIds"],
        },
        description: "Combines 1–30 previously uploaded JPG/PNG images into one PDF, one image per page.",
        successDescription: "PDF created.",
      }),
    },
    "/api/pdf-to-image": {
      post: toolOperation({
        summary: "Convert PDF to image(s)",
        requestBody: {
          type: "object",
          properties: { fileId: storedFileId, format: { type: "string", enum: ["png", "jpg"], default: "png" } },
          required: ["fileId"],
        },
        description: "Renders each page of a PDF to an image. A single-page PDF returns one image; multi-page returns a zip.",
        successDescription: "Image (or zip of images) created.",
      }),
    },
    "/api/pdf-to-word": {
      post: toolOperation({
        summary: "Convert PDF to Word",
        requestBody: { type: "object", properties: { fileId: storedFileId }, required: ["fileId"] },
        description: "Extracts a PDF's text into an editable .docx. Fails if the PDF has no extractable text.",
        successDescription: "DOCX created.",
      }),
    },

    "/api/translate": {
      post: {
        summary: "Start a PDF translation job",
        description:
          "Runs asynchronously (via Next.js `after()`) — this returns a `jobId` immediately to poll." + usageLimitNote,
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
                  sourceLang: { type: "string", default: "auto" },
                  targetLang: { type: "string" },
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
        },
      },
    },
    "/api/translate/{jobId}": {
      get: {
        summary: "Get translation job status",
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
                  },
                }),
              },
            },
          },
          "404": { description: "Job not found or expired.", content: { "application/json": { schema: apiErrorSchema } } },
        },
      },
    },

    "/api/chat": {
      post: {
        summary: "Ask the AI assistant a question, optionally grounded in a PDF",
        description:
          "Calls OpenRouter server-side. If `fileId` is given, the answer is grounded in that PDF's extracted text; otherwise it's a normal general-purpose answer.",
        tags: ["AI"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { message: { type: "string", maxLength: 4000 }, fileId: storedFileId },
                required: ["message"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "AI reply.",
            content: { "application/json": { schema: successEnvelope({ type: "object", properties: { reply: { type: "string" } } }) } },
          },
          "400": errorResponses.ValidationError,
          "429": { description: "OpenRouter's free-tier rate limit was hit.", content: { "application/json": { schema: apiErrorSchema } } },
          "503": { description: "AI service not configured or temporarily unavailable.", content: { "application/json": { schema: apiErrorSchema } } },
        },
      },
    },

    "/api/usage/{feature}": {
      get: {
        summary: "Get remaining guest uses for a feature",
        tags: ["Usage"],
        security: [{ bearerAuth: [] }, {}],
        parameters: [{ name: "feature", in: "path", required: true, schema: { type: "string" } }],
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
        },
      },
    },
    "/api/usage/{feature}/check": {
      post: {
        summary: "Check in a use for a client-only tool",
        description: "Convert, Compress, and OCR run entirely client-side — this endpoint stands in for the operation." + usageLimitNote,
        tags: ["Usage"],
        security: [{ bearerAuth: [] }, {}],
        parameters: [{ name: "feature", in: "path", required: true, schema: { type: "string" } }],
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
          "429": errorResponses.UsageLimitReached,
        },
      },
    },
  },
};
