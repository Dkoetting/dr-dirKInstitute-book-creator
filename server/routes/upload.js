/**
 * POST /api/upload
 *
 * Nimmt eine oder mehrere Dateien als multipart/form-data entgegen (Feld: "files"),
 * legt einen Job im In-Memory-Store an und gibt { jobId, files } zurück.
 *
 * Phase 2 – Storage-Optionen:
 *   - multer.diskStorage()  → lokales Dateisystem
 *   - multer-s3             → direkter S3-Upload
 *   - eigene Middleware     → Azure Blob / GCS
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createJob } = require('../lib/jobStore');

const router = express.Router();

const ALLOWED_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.ms-powerpoint', // .ppt
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'image/png',
  'image/jpeg',
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream', // wird unten zusätzlich über Dateiendung abgesichert
]);

const ALLOWED_EXTENSIONS = new Set([
  '.docx',
  '.pptx',
  '.ppt',
  '.pdf',
  '.txt',
  '.md',
  '.markdown',
  '.csv',
  '.png',
  '.jpg',
  '.jpeg',
  '.zip',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB pro Datei
  fileFilter(_req, file, cb) {
    const mimetypeOk = ALLOWED_MIME_TYPES.has(file.mimetype);
    const ext = path.extname(file.originalname || '').toLowerCase();
    const extOk = ALLOWED_EXTENSIONS.has(ext);

    if (mimetypeOk && extOk) {
      cb(null, true);
    } else {
      cb(new Error(`Dateityp nicht erlaubt: ${file.mimetype}`));
    }
  },
});

// POST /api/upload
router.post('/', upload.array('files', 50), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Keine Dateien hochgeladen.' });
  }

  const jobId = uuidv4();

  // Datei-Puffer und Metadaten im Job-Store speichern
  createJob(jobId, req.files);

  const files = req.files.map((f) => ({
    name: f.originalname,
    size: f.size,
  }));

  console.log(`[upload] Job ${jobId} angelegt | ${files.length} Datei(en)`);
  res.json({ jobId, files });
});

// Multer-Fehlerbehandlung (z.B. Dateigröße überschritten, falscher Typ)
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError || err.message) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Interner Server-Fehler.' });
});

module.exports = router;
