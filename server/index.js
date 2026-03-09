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
 */

'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { pruneOldJobs } = require('./lib/jobStore');

const uploadRouter = require('./routes/upload');
const generateRouter = require('./routes/generate');
const downloadRouter = require('./routes/download');
const docxRouter = require('./routes/docx');
const configRouter = require('./routes/config'); // NEU: Konfig-API
const healthRouter = require('./routes/health');

const app = express();
const PORT = process.env.PORT ?? 3001;
const PROJECT_ROOT = path.join(__dirname, '..');

// ── Middleware ───────────────────────────────────────────────────────────────

// CORS: erlaubt lokale Entwicklung (Frontend auf 3000, Backend auf 3001)
app.use(cors());

// JSON-Parsing
app.use(express.json());

// ── Statische Dateien (index.html, Logo, etc.) ──────────────────────────────
app.use(express.static(PROJECT_ROOT));

// ── API-Routen ───────────────────────────────────────────────────────────────
// Upload von Dateien:           POST /api/upload
app.use('/api/upload', uploadRouter);

// Kapitelgenerierung per SSE:   GET  /api/generate/:jobId
app.use('/api/generate', generateRouter);

// Downloads (ZIP, Manuskript):  GET  /api/download/:jobId/:filename
app.use('/api/download', downloadRouter);

// DOCX-Konvertierung (falls vorhanden):  /api/docx/...
app.use('/api/docx', docxRouter);

// Konfigurations-Endpunkte für Frontend: /api/config/...
app.use('/api/config', configRouter);
app.use('/api/health', healthRouter);

// ── Fallback: alle anderen Pfade → index.html (SPA-Muster) ─────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(PROJECT_ROOT, 'index.html'));
});

// ── Globaler Fehler-Handler ─────────────────────────────────────────────────
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
