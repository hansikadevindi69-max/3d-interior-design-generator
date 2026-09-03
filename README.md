# 3D Interior Design Generator

AI-powered 3D interior design generator - converts floor plans/images (or
walkthrough videos) with a free-form design prompt into a real-time, editable
3D interior design: furniture placement, color schemes, materials, lighting
and decorative elements - with export to PNG images and glTF 3D models.

## How it works

1. **Upload** a floor plan image (or video) and describe the design you want
   ("modern minimalist living room with navy blue and gold accents").
2. The **backend** analyzes the floor plan to estimate room count,
   dimensions and spatial constraints, then generates a 3D scene: furniture
   placed per room type, a color palette and materials parsed from the
   prompt, and lighting/decor.
3. The **frontend** renders the generated scene live with Three.js, and lets
   you export a PNG snapshot or a glTF 3D model.

## Project structure

```
backend/    RESTful API (Node.js/Express + SQLite) - floor plan analysis,
            design generation, project/design storage
frontend/   Web UI (React + Vite + Three.js) - upload, prompt, 3D preview
docs/       Additional documentation (API reference)
```

## Getting started

> **Important:** these commands must be run **on your own computer** (or a
> dev environment like GitHub Codespaces), not inside a remote AI sandbox.
> `http://localhost:...` only works in a browser running on the *same
> machine* as the server.

### Quickstart (recommended - runs both servers with one command)

```bash
npm run setup   # installs backend + frontend dependencies
npm run dev      # starts the API (port 4000) and the UI (port 5173) together
```

Then open **http://localhost:5173** in your browser.

### Running each part separately

#### Backend

```bash
cd backend
cp .env.example .env   # optional, defaults work out of the box
npm install
npm test                # run the test suite
npm start                # start the API on http://localhost:4000
```

#### Frontend

```bash
cd frontend
npm install
npm test                 # run the test suite
npm run dev               # start the dev server on http://localhost:5173
```

The frontend dev server proxies `/api` and `/uploads` requests to the backend
on port 4000 (see `frontend/vite.config.js`), so run both servers together
during development.

## Configuration

Backend configuration is managed through environment variables (see
`backend/.env.example`):

| Variable              | Description                                             |
|-----------------------|-----------------------------------------------------------|
| `PORT`                | API port (default `4000`)                                 |
| `DATABASE_PATH`       | Path to the SQLite database file                          |
| `UPLOAD_DIR`          | Directory where uploaded floor plans are stored            |
| `MAX_UPLOAD_SIZE_MB`  | Maximum upload size in megabytes                            |
| `AI_PROVIDER`         | `mock` (default, offline) or `openai` / `stability`         |
| `OPENAI_API_KEY`      | API key used when `AI_PROVIDER=openai`                      |
| `STABILITY_API_KEY`   | API key used when `AI_PROVIDER=stability`                   |

By default the app runs fully offline using a deterministic, keyword-based
design generator - no AI credentials are required to try it out.

## API

See [`docs/API.md`](docs/API.md) for the full REST API reference.

## Testing

- Backend: Jest + Supertest (`backend/npm test`) - unit tests for the floor
  plan analyzer and design generator services, plus integration tests
  covering the full project → floor plan → design workflow.
- Frontend: Vitest + React Testing Library (`frontend/npm test`) - component
  tests for the upload form and design summary, and unit tests for the
  Three.js scene builder.
