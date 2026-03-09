/**
 * generateChaptersFromSkill.js
 *
 * Zentrale Integrationsstelle für die KI-gestützte Kapitelgenerierung.
 *
 * PHASE 1: Mock-Implementierung.
 *   Sendet realistische SSE-Progress-Events und gibt Dummy-Kapiteldaten zurück.
 *
 * PHASE 2 – KI-Integration (erste Ausbaustufe):
 *   - Pro Kapitel wird statt Mock-Text ein KI-generierter Text erzeugt.
 *   - Die bestehende Kapitelstruktur (Titel, Reflexion, Übung etc.) bleibt erhalten.
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const Anthropic = require('@anthropic-ai/sdk');
const { Document, Packer, Paragraph, HeadingLevel, TextRun } = require('docx'); // NEU

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * @typedef {Object} GenerateParams
 * @property {string} jobId
 * @property {string} bookTitle
 * @property {string} [bookSubtitle]
 * @property {'sachbuch'|'fachbuch'|'artikel'|'workbook'} bookType
 * @property {'c-level'|'management'|'wissenschaft'|'lehre'|'bildung'|'gemischt'} audience
 * @property {'einsteiger'|'fortgeschritten'|'expert'} level
 * @property {'kurz'|'standard'|'ausfuehrlich'} length
 * @property {string} model
 */

/**
 * Generiert Kapitel aus hochgeladenen Dateien und Metadaten.
 * Kommuniziert Fortschritt per SSE über die `send`-Funktion.
 *
 * @param {Express.Multer.File[]} files  – Datei-Objekte aus dem Job-Store
 * @param {GenerateParams} params        – Generierungsparameter aus dem Query-String
 * @param {function(string, object): void} send  – SSE-Sender: send(eventName, data)
 */
async function generateChaptersFromSkill(files, params, send) {
  // ── Phase 2 (später): Dateiinhalte extrahieren ─────────────────────────────
  // const fileContents = await extractFileContents(files);

  const chapters = buildMockChapters(params);
  const total = chapters.length;
  const completed = [];

  for (let i = 0; i < total; i++) {
    const num = i + 1;
    const ch = chapters[i];

    // Fortschritt: Strukturierung
    send('progress', {
      chapter: num,
      total,
      percent: Math.round((i / total) * 75),
      status: `Strukturiere Kapitel ${num}: ${ch.title}`,
    });
    await sleep(200); // etwas kürzer, KI-Call kostet Zeit

    // Fortschritt: Text generieren
    send('progress', {
      chapter: num,
      total,
      percent: Math.round(((i + 0.5) / total) * 75),
      status: `Schreibe Kapitel ${num}: ${ch.title}`,
    });

    // ── KI-Call pro Kapitel ────────────────────────────────────────────────
    ch.text = await callModelForChapter(ch, params);

    completed.push(ch);

    send('chapter_done', {
      chapter: num,
      title: ch.title,
      percent: Math.round(((i + 1) / total) * 80),
    });
  }

  // Manuskript zusammenführen
  send('progress', {
    chapter: total,
    total,
    percent: 90,
    status: 'Manuskript wird zusammengeführt …',
  });
  await sleep(800);

  // ── Phase 2: MD/DOCX/ZIP generieren und "hochladen" ─────────────────────
  const { downloadUrl, manuscriptUrl, docxUrl } = await buildAndUploadManuscript(
    completed,
    params
  );

  send('progress', {
    chapter: total,
    total,
    percent: 98,
    status: 'Download wird vorbereitet …',
  });
  await sleep(400);

  // done-Event enthält jetzt auch docxUrl
  send('done', { chapters: completed, downloadUrl, manuscriptUrl, docxUrl });
}

// ─── KI-Hilfsfunktion: Kapiteltext generieren (Claude) ──────────────────────

async function callModelForChapter(chapter, params) {
  const {
    bookTitle,
    bookType = 'sachbuch',
    audience = 'gemischt',
    level = 'fortgeschritten',
    length = 'standard',
    model,
  } = params;

  const systemPrompt =
    'Du bist ein strukturierter deutschsprachiger Fachbuch-Autor. ' +
    'Du schreibst klar, präzise und praxisorientiert für professionelle Leser.';

  const userPrompt = [
    `Schreibe ein vollständiges Kapitel für ein ${bookType} mit dem Titel: "${bookTitle}".`,
    `Kapitel ${chapter.number}: "${chapter.title}".`,
    `Zielgruppe: ${audience}, Niveau: ${level}, gewünschter Umfang: ${length}.`,
    ``,
    `Strukturiere den Text wie folgt (ohne Überschriften zu nummerieren):`,
    `1. Einstieg (80–120 Wörter, mit 3–5 Lernzielen im Fließtext).`,
    `2. Kernteil mit Modell/Framework, Definitionen und 1–2 Beispielen.`,
    `3. 3–5 Reflexionsfragen, klar und operativ formuliert (als Liste).`,
    `4. Eine Übung mit: Ziel, Dauer, Material, Schritt-für-Schritt-Anleitung.`,
    `5. Abschließende Zusammenfassung (max. 80 Wörter, 3–5 Kernaussagen).`,
    ``,
    `Schreibe alles in gut lesbarem, professionellem Deutsch.`,
  ].join('\n');

  const response = await anthropic.messages.create({
    model: model || 'claude-3-5-sonnet-20241022', // ggf. dein Standardmodell anpassen
    max_tokens: 1800,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const parts = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text);

  return parts.join('\n');
}

// ─── Manuskript-/ZIP-/DOCX-Erzeugung ────────────────────────────────────────

/**
 * Baut aus den generierten Kapiteln:
 * - Einzel-Kapitel (.md)
 * - Gesamt-Manuskript (.md)
 * - Gesamt-Manuskript (.docx)
 * - ZIP mit allen Einzel-Kapiteln
 *
 * @param {Array} chapters - Array mit fertigen Kapiteln
 * @param {GenerateParams} params - Job-Parameter
 * @returns {Promise<{downloadUrl: string, manuscriptUrl: string, docxUrl: string}>}
 */
async function buildAndUploadManuscript(chapters, params) {
  const { jobId } = params;
  // Zielverzeichnis pro Job
  const outputDir = path.join(__dirname, '../downloads', jobId);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Einzelne Kapitel als .md speichern
  const chapterFiles = [];
  for (const ch of chapters) {
    const filename = `kapitel-${ch.number}-${sanitizeFilename(ch.title)}.md`;
    const filepath = path.join(outputDir, filename);
    const content = formatChapterAsMarkdown(ch);
    fs.writeFileSync(filepath, content, 'utf-8');
    chapterFiles.push({ filename, filepath });
  }

  // 2. Gesamt-Manuskript als .md
  const manuscriptFilename = 'Manuskript_Gesamt.md';
  const manuscriptPath = path.join(outputDir, manuscriptFilename);
  const fullManuscript = chapters.map(formatChapterAsMarkdown).join('\n\n---\n\n');
  fs.writeFileSync(manuscriptPath, fullManuscript, 'utf-8');

  // 3. Gesamt-Manuskript als .docx (NEU)
  const docxFilename = 'Manuskript_Gesamt.docx';
  const docxPath = path.join(outputDir, docxFilename);
  await createDocxFromChapters(chapters, docxPath);

  // 4. ZIP mit allen Kapitel-.md-Dateien
  const zipFilename = 'kapitel.zip';
  const zipPath = path.join(outputDir, zipFilename);
  await createZip(chapterFiles, zipPath);

  // Pfade für den bestehenden Download-Endpunkt
  return {
    downloadUrl: `/api/download/${jobId}/${zipFilename}`,
    manuscriptUrl: `/api/download/${jobId}/${manuscriptFilename}`,
    docxUrl: `/api/download/${jobId}/${docxFilename}`,
  };
}

/**
 * Erstellt ein Word-Dokument (.docx) aus den Kapiteln.
 */
async function createDocxFromChapters(chapters, outputPath) {
  const paragraphs = [];

  chapters.forEach((ch) => {
    // Kapiteltitel
    paragraphs.push(
      new Paragraph({
        text: `Kapitel ${ch.number}: ${ch.title}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    // Kapiteltext (Absätze aus Zeilen)
    const textLines = (ch.text || '').split('\n').filter((line) => line.trim());
    textLines.forEach((line) => {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(line)],
          spacing: { after: 120 },
        })
      );
    });

    // Reflexionsfragen
    if (ch.reflections && ch.reflections.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: 'Reflexionsfragen',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
      ch.reflections.forEach((q, i) => {
        paragraphs.push(
          new Paragraph({
            text: `${i + 1}. ${q}`,
            spacing: { after: 100 },
          })
        );
      });
    }

    // Übung
    if (ch.exercise) {
      paragraphs.push(
        new Paragraph({
          text: `Übung: ${ch.exercise.title}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Ziel: ', bold: true }),
            new TextRun(ch.exercise.goal),
          ],
          spacing: { after: 100 },
        })
      );
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Dauer: ', bold: true }),
            new TextRun(ch.exercise.duration),
          ],
          spacing: { after: 100 },
        })
      );
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Material: ', bold: true }),
            new TextRun(ch.exercise.material),
          ],
          spacing: { after: 100 },
        })
      );
      paragraphs.push(
        new Paragraph({
          text: 'Schritte:',
          spacing: { before: 150, after: 100 },
        })
      );
      ch.exercise.steps.forEach((step, i) => {
        paragraphs.push(
          new Paragraph({
            text: `${i + 1}. ${step}`,
            spacing: { after: 80 },
          })
        );
      });
    }

    // Leerraum zwischen Kapiteln
    paragraphs.push(
      new Paragraph({
        text: '',
        spacing: { before: 400 },
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
}

/**
 * Formatiert ein Kapitel als Markdown.
 */
function formatChapterAsMarkdown(chapter) {
  let md = `# Kapitel ${chapter.number}: ${chapter.title}\n\n`;
  md += `${chapter.text}\n\n`;

  if (chapter.reflections && chapter.reflections.length > 0) {
    md += `## Reflexionsfragen\n\n`;
    chapter.reflections.forEach((q, i) => {
      md += `${i + 1}. ${q}\n`;
    });
    md += `\n`;
  }

  if (chapter.exercise) {
    md += `## Übung: ${chapter.exercise.title}\n\n`;
    md += `**Ziel:** ${chapter.exercise.goal}\n\n`;
    md += `**Dauer:** ${chapter.exercise.duration}\n\n`;
    md += `**Material:** ${chapter.exercise.material}\n\n`;
    md += `**Schritte:**\n\n`;
    chapter.exercise.steps.forEach((step, i) => {
      md += `${i + 1}. ${step}\n`;
    });
    md += `\n`;
  }

  return md;
}

/**
 * Erstellt ein ZIP-Archiv aus den Kapiteldateien.
 */
function createZip(files, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    files.forEach(({ filename, filepath }) => {
      archive.file(filepath, { name: filename });
    });

    archive.finalize();
  });
}

/**
 * Macht Dateinamen filesystem-safe.
 */
function sanitizeFilename(str) {
  return str
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }[c]))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Mock-Hilfsfunktionen (Struktur bleibt) ─────────────────────────────────

const CHAPTER_TITLES = [
  'Einführung und Problemstellung',
  'Theoretischer Rahmen und Grundbegriffe',
  'Kernmodell und Architektur',
  'Anwendungsfelder und Praxisbeispiele',
  'Governance und Compliance',
  'Implementierungsstrategie',
  'Abschluss und Ausblick',
];

function buildMockChapters(params) {
  const { bookType = 'sachbuch', length = 'standard' } = params;

  return CHAPTER_TITLES.map((title, i) => {
    const num = i + 1;
    return {
      number: num,
      title,
      // buildMockText bleibt als Fallback, wird im Loop durch KI-Text überschrieben
      text: buildMockText(title, num, bookType, length),
      reflections: [
        `Welche drei Aspekte von „${title}" sind in Ihrer Organisation heute nicht sichtbar?`,
        'Welche Normanforderungen sind durch kein existierendes Artefakt abgedeckt?',
        'Wer trägt in Ihrer Organisation die operative Verantwortung für diesen Bereich?',
      ],
      exercise: {
        title: `Übung ${num}.1 – ${title} analysieren`,
        goal: `Strukturierte Analyse der Ist-Situation im Bereich „${title}"`,
        duration: '30–45 Minuten',
        material: 'Whiteboard oder Kollaborationstool, aktuelle Prozessdokumentation',
        steps: [
          'Definieren Sie den Scope: Welche Einheit wird analysiert?',
          'Erstellen Sie eine Liste aller relevanten Akteure und Systeme.',
          'Bewerten Sie den Reifegrad anhand der Kapitel-Kriterien.',
          'Identifizieren Sie die drei kritischsten Lücken.',
          'Formulieren Sie je Lücke eine konkrete Maßnahme mit Verantwortlichem und Termin.',
        ],
      },
      templates: [`[TEMPLATE] Reifegrad-Matrix für „${title}" (vom Autor auszufüllen)`],
      checklists: [`[CHECKLISTE] Mindestanforderungen für ${title}`],
      figures: [
        {
          id: `Abb. ${num}.1`,
          caption: `Übersichtsmodell: ${title}`,
          description: `Schematische Darstellung der Hauptkomponenten. Empfehlung: zweispaltiges Layout mit Legende rechts.`,
          suggestedPlacement: `Abschnitt ${num}.2`,
        },
      ],
    };
  });
}

function buildMockText(title, num, bookType, length) {
  const mode =
    length === 'kurz' ? 'kompakt' :
    length === 'ausfuehrlich' ? 'ausführlich' :
    'standard';

  return [
    `[MOCK – wird durch KI-Generierung ersetzt]`,
    ``,
    `Kapitel ${num}: ${title}`,
    ``,
    `Dieser Text ist ein Platzhalter (Modus: ${mode}, Typ: ${bookType}).`,
    ``,
    `In Phase 2 erzeugt generateChaptersFromSkill() gemäß skills/dr-dirk-book-creator.SKILL.md:`,
    `  • Einstieg (80–120 Wörter, 3–5 Lernziele)`,
    `  • Kernteil (zentrales Modell/Framework, Definitionen, 1–2 Beispiele)`,
    `  • Reflexionsfragen (3–5, operativ scharf)`,
    `  • Übung (Schritt-für-Schritt, Zeitbedarf, konkretes Ergebnis)`,
    `  • Conclusio – Was aus diesem Kapitel zählt (max. 80 Wörter, 3–5 Bullet-Points)`,
  ].join('\n');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { generateChaptersFromSkill };
