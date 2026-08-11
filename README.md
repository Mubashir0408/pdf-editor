# Docy

A public, no-account PDF tool site (convert, merge, split, and more) —
Next.js frontend + Express/TypeScript backend.

## Getting started

Install dependencies for both projects (they're independent — each has its
own `package.json`):

```bash
npm install
cd backend && npm install && cd ..
copy backend\.env.example backend\.env
```

Then, from the project root:

```bash
npm run dev
```

This starts **both** the Next.js frontend (`http://localhost:3000`) and the
Express backend (`http://localhost:5000`) together, each with hot reload,
labeled and color-coded in one terminal (`[frontend]` / `[backend]`).

To run either on its own:

```bash
npm run dev:frontend   # just Next.js
npm run dev:backend    # just the API
```

## Project structure

```
src/          Next.js app (frontend)
backend/      Express + TypeScript API — see backend/README.md
```

The backend is fully stateless: no database, no accounts. Every request
uploads a file, processes it, and returns a download — see
`backend/README.md` for how that flow works and what's implemented so far.

## Scripts (root)

| Script | Description |
| --- | --- |
| `npm run dev` | Start frontend + backend together |
| `npm run dev:frontend` | Start only the Next.js dev server |
| `npm run dev:backend` | Start only the Express dev server |
| `npm run build` | Production build of the frontend |
| `npm start` | Run the production frontend build |
| `npm run lint` | Lint the frontend |

Backend has its own equivalents (`npm run dev`, `build`, `start`, `lint`)
inside `backend/`.
