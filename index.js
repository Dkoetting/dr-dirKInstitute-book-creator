/**
 * server/index.js – Express-Einstiegspunkt
 *
 * Startet den Book-Creator-Backend-Server.
 * Serviert index.html + statische Assets aus dem Projekt-Root.
 *
 * Start:
 *   npm start        → node server/index.js
 *   npm run dev      → nodemon server/index.js (auto-reload)
 *
 * Umgebungsvariablen (optional):
 *   PORT   – TCP-Port (default: 3001)
 *
 * Migration auf Next.js:
 *   Die Routen-Logik in server/routes/ ist framework-agnostisch gehalten.
 *   Für Next.js: Inhalte von upload.js → pages/api/upload.ts
 *                Inhalte von generate.js → pages/api/generate/[jobId].ts
 */

'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const { pruneOldJobs } = require('./lib/jobStore');

const uploadRouter = require('./routes/upload');
const generateRouter = require('./routes/generate');
const downloadRouter = require('./routes/download'); // NEU

const app = express();
const PORT = process.env.PORT ?? 3001;
const PROJECT_ROOT = path.join(__dirname, '..');

// ── Middleware ───────────────────────────────────────────────────────────────

// CORS: erlaubt lokale Entwicklung (z.B. Vercel-Preview → lokaler Dev-Server)
app.use(cors());

app.use(express.json());

// ── Statische Dateien (index.html, Logo, etc.) ──────────────────────────────
app.use(express.static(PROJECT_ROOT));

// ── API-Routen ───────────────────────────────────────────────────────────────
app.use('/api/upload', uploadRouter);
app.use('/api/generate', generateRouter);
app.use('/api/download', downloadRouter); // NEU: liefert Manuskript/ZIP aus

// ── Fallback: alle anderen Pfade → index.html (SPA-Muster) ─────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(PROJECT_ROOT, 'index.html'));
});

// ── Globaler Fehler-Handler ──────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[server] Unbehandelter Fehler:', err);
  res.status(500).json({ error: 'Interner Server-Fehler.' });
});

// ── Job-Store bereinigen (alle 30 Minuten) ──────────────────────────────────
setInterval(pruneOldJobs, 30 * 60 * 1000);

// ── Server starten ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\nDr. DirkInstitute Book Creator – Backend');
  console.log(`  → http://localhost:${PORT}\n`);
});
