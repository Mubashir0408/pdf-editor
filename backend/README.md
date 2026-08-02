# DocuFlow AI — Backend (Milestone 1)

Express + TypeScript API. Currently implements file upload and metadata
retrieval only — no PDF processing, OCR, or AI yet (future milestones).

## Stack

Node.js · Express · TypeScript · PostgreSQL · Prisma · Zod · Multer · Pino

## Setup

```bash
cd backend
npm install
copy .env.example .env
```

Edit `.env` and point `DATABASE_URL` at a real PostgreSQL database, then
create the schema:

```bash
npm run prisma:migrate
```

(This step requires a running PostgreSQL instance and could not be run in
the environment this backend was built in — see "Known limitation" below.)

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

| Method | Route        | Description                                              |
| ------ | ------------ | -------------------------------------------------------- |
| GET    | `/health`    | Server + database status, version, timestamp             |
| POST   | `/upload`    | Upload a file (`multipart/form-data`, field name `file`) |
| GET    | `/files/:id` | Metadata for a previously uploaded file                  |

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
  database/     Prisma client singleton
prisma/         schema.prisma
uploads/        uploaded files land here (gitignored)
generated/      reserved for future processed/converted output files
logs/           reserved for future file-based logging
public/         reserved for future static assets
```

## Known limitation

This backend was built in a sandboxed environment with no PostgreSQL
instance available, so `npm run prisma:migrate` and full end-to-end
database behavior (actually persisting an upload, `/health` reporting
`"database": "connected"`) could not be verified here. Everything that
doesn't require a live database was verified: `npm install`, `npm run
lint`, `npm run build`, and the server starting and responding correctly
— including `/health` correctly reporting `"database": "disconnected"`
and returning HTTP 503 when it can't reach PostgreSQL, which confirms the
error-handling path works. Run `npm run prisma:migrate` yourself once
`DATABASE_URL` points at a real database, then re-verify `/health` and
`/upload`.
