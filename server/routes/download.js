// server/routes/download.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const { getJob } = require('../lib/jobStore');

// Konfigurations-JSONs (fÃ¼r Metadaten/Defaults, falls im Job nichts steht)
const publicationOptions = require('../config/publication-options.json'); // Typ/Level/LÃ¤nge [file:161]
const zielgruppenOptions = require('../config/Zielgruppe.json');            // dedizierte Zielgruppen [file:160]

const router = express.Router();

// Defaults aus JSONs ableiten (fÃ¼r Metadaten-Fallback)
const DEFAULTS = {
  bookTitle: 'Unbenannte Publikation',
  bookSubtitle: '',
  bookType: publicationOptions.bookTypes[0]?.value ?? 'sachbuch',
  audience:
    zielgruppenOptions.find(a => a.value === 'gemischt')?.value ??
    zielgruppenOptions[0]?.value ??
    'gemischt',
  level:
    publicationOptions.levels.find(l => l.value === 'fortgeschritten')?.value ??
    publicationOptions.levels[0]?.value ??
    'fortgeschritten',
  length:
    publicationOptions.lengths.find(l => l.value === 'standard')?.value ??
    publicationOptions.lengths[0]?.value ??
    'standard',
};

// Optional: Metadaten-Normalisierung (falls du sie spÃ¤ter im Log/Tracking nutzen willst)
function normalizeOption(value, allowedList, fallback) {
  if (!value) return fallback;
  const found = allowedList.find(opt => opt.value === value);
  return found ? found.value : fallback;
}

/**
 * GET /api/download/:jobId/:filename
 *
 * Liefert eine bereits von generateChaptersFromSkill erzeugte Datei aus:
 *   server/downloads/:jobId/:filename
 *
 * Erwartete Dateien (Phase 2):
 *   - kapitel.zip
 *   - Manuskript_Gesamt.md
 */
router.get('/:jobId/:filename', (req, res) => {
  const { jobId, filename } = req.params;
  const job = getJob(jobId);

  if (!job) {
    return res.status(404).send('Job nicht gefunden');
  }

  // Metadaten aus dem Job (sofern beim Generieren gespeichert),
  // sonst sinnvolle Defaults aus den JSON-Konfigurationen
  const rawMeta = job.meta || {};

  const bookTitle = rawMeta.bookTitle || DEFAULTS.bookTitle;
  const bookSubtitle = rawMeta.bookSubtitle || DEFAULTS.bookSubtitle;
  const bookType = normalizeOption(
    rawMeta.bookType,
    publicationOptions.bookTypes,
    DEFAULTS.bookType
  );
  const audience = normalizeOption(
    rawMeta.audience,
    zielgruppenOptions,
    DEFAULTS.audience
  );
  const level = normalizeOption(
    rawMeta.level,
    publicationOptions.levels,
    DEFAULTS.level
  );
  const length = normalizeOption(
    rawMeta.length,
    publicationOptions.lengths,
    DEFAULTS.length
  );

  // Nur Logging/Debug â€“ Download bleibt identisch
  console.log(
    `[download] Job ${jobId} | Datei: ${filename} | Typ: ${bookType} | Zielgruppe: ${audience} | Level: ${level} | Umfang: ${length} | Titel: ${bookTitle}${bookSubtitle ? ' â€“ ' + bookSubtitle : ''}`
  );

  const safeFilename = filename || 'Manuskript_Gesamt.md';
  const baseDir = path.join(__dirname, '..', 'downloads', jobId);
  const filePath = path.join(baseDir, safeFilename);

  if (!fs.existsSync(filePath)) {
    console.error('[download] Datei nicht gefunden:', filePath);
    return res.status(404).send('Datei nicht gefunden');
  }

  res.download(filePath, safeFilename, (err) => {
    if (err) {
      console.error('[download] Fehler beim Download:', err);
      if (!res.headersSent) {
        res.status(500).send('Fehler beim Herunterladen der Datei');
      }
    }
  });
});

module.exports = router;

