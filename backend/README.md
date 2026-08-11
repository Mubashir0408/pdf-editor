# Docy — Backend

Express + TypeScript API for a stateless PDF tool site (in the spirit of
iLovePDF) — no accounts, no saved documents, no database. Every request
uploads file(s), processes them, and returns a download; nothing persists
beyond that.

## Stack

Node.js · Express · TypeScript · Multer · pdf-lib · Zod · Pino

## Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

That's it — there's no database to provision or migrate.

## Processing flow

Every tool follows the same shape:

1. Client uploads file(s) — validated (mime type, extension, size) and
   written to `uploads/` under a generated, collision-proof name. That
   generated filename **is** the file's id; nothing about it is recorded
   anywhere else.
2. The client calls the tool's endpoint (e.g. `POST /merge`) referencing
   those ids.
3. The tool processes the file(s) (pdf-lib for PDF tools) and writes the
   result to `generated/`.
4. The response describes the output and a `downloadUrl`; `GET /download/:id`
   streams it.
5. Once a tool successfully finishes with a given upload, that input file
   is deleted from `uploads/` — it's already been read into the output, so
   nothing further needs it. (On failure, uploads are left in place so a
   retry doesn't have to re-upload files that were already fine.)

There's no background sweep for abandoned uploads (a user who uploads but
never finishes) yet — worth adding once there's real traffic to justify it.

## Development

```bash
npm run dev      # start with hot reload (tsx watch)
npm run lint      # ESLint
npm run format    # Prettier
npm run build     # compile to dist/
npm start          # run the compiled build (after npm run build)
```

## API

All responses use one consistent envelope:

```jsonc
// success
{ "success": true, "message": "...", "data": { ... } }

// error
{ "success": false, "message": "...", "errors": [], "status": 400, "timestamp": "...", "requestId": "..." }
```

| Method | Route           | Description                                                              |
| ------ | --------------- | ------------------------------------------------------------------------- |
| GET    | `/health`       | Server status, version, timestamp                                       |
| POST   | `/upload`       | Upload a file (`multipart/form-data`, field name `file`)                |
| POST   | `/merge`        | Merge PDFs: `{ fileIds: string[] }` (2–20 previously-uploaded ids, in order) |
| GET    | `/download/:id` | Streams a processed file (e.g. the output of `/merge`)                  |

Accepted upload types: PDF, DOCX, PPTX, XLSX, JPG, PNG. Max size is set by
`MAX_UPLOAD_SIZE` in `.env` (bytes; default 100MB).

## Folder structure

```
src/
  config/       env loading (zod-validated), logger, cors
  controllers/  thin request/response glue — no business logic
  routes/       Express routers — wire middleware + controllers only
  services/     business logic, one class per domain, constructor-injected
  middlewares/  upload (Multer), validation, rate limiting, error handling
  validators/   Zod schemas
  utils/        ApiError, ApiResponse, asyncHandler, file/path helpers
  types/        shared TypeScript types
uploads/        uploaded files land here (gitignored)
generated/      processed output files (merged PDFs, ...), gitignored
logs/           reserved for future file-based logging
public/         reserved for future static assets
```
