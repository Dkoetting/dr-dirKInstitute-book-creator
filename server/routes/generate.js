/**
 * GET /api/generate/:jobId
 *
 * Server-Sent Events (SSE) â€“ streamt den Generierungsfortschritt an den Browser.
 *
 * Query-Parameter:
 *   bookTitle, bookSubtitle, bookType, audience, level, length, model
 *
 * SSE-Events (alle Daten als JSON):
 *   progress      â€“ { chapter, total, percent, status }
 *   chapter_done  â€“ { chapter, title, percent }
 *   chapter_error â€“ { chapter, error }
 *   done          â€“ { chapters, downloadUrl, manuscriptUrl }
 *   error         â€“ { error }  (bei schwerwiegendem Fehler)
 */

const express = require('express');
const { getJob, setJobMeta } = require('../lib/jobStore');
const { generateChaptersFromSkill } = require('../lib/generateChaptersFromSkill');

// Optionen aus JSON-Konfigurationen
const publicationOptions = require('../config/publication-options.json'); // Typ/Level/LÃ¤nge [file:161]
const umfangOptions = require('../config/Umfang.json');                  // minWords/maxWords [file:162]
const zielgruppenOptions = require('../config/Zielgruppe.json');           // dedizierte Zielgruppe [file:160]

const router = express.Router();

// Defaults aus den JSONs ableiten
const DEFAULTS = {
  bookTitle: 'Unbenannte Publikation',
  bookSubtitle: '',
  bookType: publicationOptions.bookTypes[0]?.value ?? 'sachbuch',
  // Zielgruppe dediziert aus Zielgruppe.json, Default = "gemischt"
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
  model: 'claude-opus-4-20250514',
};

// Hilfsfunktion: Wert gegen erlaubte Optionen prÃ¼fen, sonst Default
function normalizeOption(value, allowedList, fallback) {
  if (!value) return fallback;
  const found = allowedList.find(opt => opt.value === value);
  return found ? found.value : fallback;
}

// Heartbeat-Intervall in ms â€“ verhindert Proxy-/Nginx-Timeouts bei langen Generierungen
const HEARTBEAT_INTERVAL_MS = 20_000;

// GET /api/generate/:jobId
router.get('/:jobId', async (req, res) => {
  const { jobId } = req.params;

  // Rohwerte aus Query, danach normalisieren
  const {
    bookTitle = DEFAULTS.bookTitle,
    bookSubtitle = DEFAULTS.bookSubtitle,
    bookType: rawBookType,
    audience: rawAudience,
    level: rawLevel,
    length: rawLength,
    model = DEFAULTS.model,
  } = req.query;

  // Buchtyp: aus publication-options.json
  const bookType = normalizeOption(
    rawBookType,
    publicationOptions.bookTypes,
    DEFAULTS.bookType
  );

  // Zielgruppe: explizit aus Zielgruppe.json
  const audience = normalizeOption(
    rawAudience,
    zielgruppenOptions,
    DEFAULTS.audience
  );

  // Level/LÃ¤nge: aus publication-options.json
  const level = normalizeOption(
    rawLevel,
    publicationOptions.levels,
    DEFAULTS.level
  );
  const length = normalizeOption(
    rawLength,
    publicationOptions.lengths,
    DEFAULTS.length
  );

  // Umfang (min/max WÃ¶rter) passend zur LÃ¤nge aus Umfang.json holen
  const umfangConfig =
    umfangOptions.find(u => u.value === length) ||
    umfangOptions.find(u => u.value === DEFAULTS.length);

  const minWords = umfangConfig?.minWords;
  const maxWords = umfangConfig?.maxWords;

  const job = getJob(jobId);
  if (!job) {
    return res.status(404).json({ error: `Job nicht gefunden: ${jobId}` });
  }

  setJobMeta(jobId, {
    bookTitle,
    bookSubtitle,
    bookType,
    audience,
    level,
    length,
    model,
    minWords,
    maxWords,
  });

  // â”€â”€ SSE-Header setzen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx-Buffering deaktivieren
  res.flushHeaders();

  // â”€â”€ Hilfsfunktionen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** Schreibt ein SSE-Event in den Response-Stream. */
  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    if (typeof res.flush === 'function') res.flush(); // compression-Middleware
  };

  /** Sendet einen leeren Kommentar als Keepalive-Ping. */
  const ping = () => res.write(': ping\n\n');

  // â”€â”€ Keepalive-Timer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const heartbeat = setInterval(ping, HEARTBEAT_INTERVAL_MS);

  // Bei Client-Disconnect aufrÃ¤umen
  req.on('close', () => {
    clearInterval(heartbeat);
    console.log(`[generate] Client ${jobId} getrennt.`);
  });

  // â”€â”€ Generierung starten â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const params = {
    jobId,
    bookTitle,
    bookSubtitle,
    bookType,
    audience,
    level,
    length,
    model,
    minWords,
    maxWords,
  };

  console.log(
    `[generate] Starte Job ${jobId} | Modell: ${model} | Typ: ${bookType} | Zielgruppe: ${audience} | Level: ${level} | Umfang: ${length} (${minWords}-${maxWords} WÃ¶rter)`
  );

  try {
    await generateChaptersFromSkill(job.files, params, send);
  } catch (err) {
    console.error(`[generate] Fehler in Job ${jobId}:`, err);
    send('error', { error: err.message ?? 'Unbekannter Fehler bei der Generierung.' });
  } finally {
    clearInterval(heartbeat);
    res.end();
    console.log(`[generate] Job ${jobId} abgeschlossen.`);
  }
});

module.exports = router;

