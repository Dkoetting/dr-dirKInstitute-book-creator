// server/routes/download.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { getJob } = require('../lib/jobStore');

const router = express.Router();

/**
 * GET /api/download/:jobId/:filename
 *
 * Liefert entweder:
 * - eine Dummy-Gesamtmanuskript-Datei (MD) oder
 * - eine Dummy-ZIP mit Kapitel-Platzhaltern.
 *
 * Für Phase 1: einfache, generierte Textdatei pro Job.
 * Später: echte Kapitel-Dateien + ZIP/Docx.
 */
router.get('/:jobId/:filename', (req, res) => {
  const { jobId, filename } = req.params;
  const job = getJob(jobId);

  if (!job) {
    return res.status(404).send('Job nicht gefunden');
  }

  // Für die erste Version erzeugen wir immer eine einfache Markdown-Datei
  // mit einem Platzhalter-Inhalt auf Basis der Job-Metadaten.
  const safeFilename = filename || 'Manuskript_Gesamt.md';
  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, `${jobId}-${safeFilename.replace(/[^a-zA-Z0-9_.-]/g, '_')}`);

  const {
    bookTitle = 'Unbenannte Publikation',
    bookSubtitle = '',
    bookType = 'sachbuch',
    audience = 'gemischt',
    level = 'fortgeschritten',
    length = 'standard',
  } = job.meta || {};

  const header = `# ${bookTitle}\n\n`;
  const subtitle = bookSubtitle ? `## ${bookSubtitle}\n\n` : '';
  const metaBlock =
    `> Typ: ${bookType} | Zielgruppe: ${audience} | Level: ${level} | Umfang: ${length}\n\n`;

  const info =
    `Dieses Dokument ist ein Platzhalter-Manuskript für Job ${jobId}.\n` +
    `Die echte KI-generierte Fassung wird in Phase 2 durch generateChaptersFromSkill.js erzeugt.\n\n`;

  const content = header + subtitle + metaBlock + info;

  fs.writeFile(filePath, content, err => {
    if (err) {
      console.error('[download] Fehler beim Schreiben der Datei:', err);
      return res.status(500).send('Fehler beim Erzeugen der Download-Datei');
    }
    res.download(filePath, safeFilename, downloadErr => {
      if (downloadErr) {
        console.error('[download] Fehler beim Download:', downloadErr);
      }
      // Optionale Aufräum-Aktion: Datei wieder löschen
      fs.unlink(filePath, () => {});
    });
  });
});

module.exports = router;
