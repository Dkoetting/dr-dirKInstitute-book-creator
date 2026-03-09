# Dr. DirkInstitute Book Creator

## Overview

Book Creator with:

- File upload (`/api/upload`)
- Streaming chapter generation via SSE (`/api/generate/:jobId`)
- Download endpoints for ZIP/MD/DOCX (`/api/download/:jobId/:filename`)
- DOCX generation endpoint (`/api/docx/:jobId`)
- Config API (`/api/config/...`)
- Healthcheck (`/api/health`)

## Requirements

- Node.js 20+
- npm
- `.env` file with API keys

## Setup

```powershell
cd C:\Users\info\Book_creator
npm install
copy .env.example .env
```

Add your real keys to `.env`.

## Run (local)

```powershell
npm run dev
```

App: `http://localhost:3001`

## API Quick Checks

```powershell
curl http://localhost:3001/api/health
curl http://localhost:3001/api/config/publication-options
curl http://localhost:3001/api/config/zielgruppen
curl http://localhost:3001/api/config/umfang
```

## Deployment Notes (GitHub + Vercel)

This app currently uses long-running SSE generation. Vercel can work for many API use-cases, but SSE/long jobs may hit platform limits.

Recommended rollout:

1. Push repo to GitHub.
2. Use Vercel for frontend/static shell only, or short API calls.
3. Keep generation backend (`/api/generate` SSE) on a dedicated server (later your own server).

For production reliability, separate frontend and backend base URLs via environment variables.

## Security

- Never commit `.env`.
- Rotate API keys if accidentally exposed.
