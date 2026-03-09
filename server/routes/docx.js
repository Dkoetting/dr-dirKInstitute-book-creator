const express = require('express');
const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  TableOfContents,
} = require('docx');
const { getJob } = require('../lib/jobStore');

const router = express.Router();

function parseMarkdown(md) {
  const lines = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const blocks = [];
  let inCode = false;

  for (const raw of lines) {
    const line = raw;
    if (line.trim().startsWith('```')) {
      inCode = !inCode;
      if (!inCode) blocks.push({ type: 'blank' });
      continue;
    }

    if (inCode) {
      blocks.push({ type: 'code', text: line || ' ' });
      continue;
    }

    if (!line.trim()) {
      blocks.push({ type: 'blank' });
      continue;
    }

    const hm = line.match(/^(#{1,6})\s+(.*)$/);
    if (hm) {
      blocks.push({ type: 'heading', level: Math.min(hm[1].length, 3), text: hm[2].trim() });
      continue;
    }

    const bm = line.match(/^\s*[-*+]\s+(.*)$/);
    if (bm) {
      blocks.push({ type: 'bullet', text: bm[1].trim() });
      continue;
    }

    const nm = line.match(/^\s*\d+\.\s+(.*)$/);
    if (nm) {
      blocks.push({ type: 'number', text: nm[1].trim() });
      continue;
    }

    blocks.push({ type: 'paragraph', text: line });
  }

  return blocks;
}

function extractChapters(blocks) {
  return blocks.filter((b) => b.type === 'heading' && b.level === 1).map((b) => b.text);
}

function mapHeading(level) {
  if (level === 1) return HeadingLevel.HEADING_1;
  if (level === 2) return HeadingLevel.HEADING_2;
  return HeadingLevel.HEADING_3;
}

router.post('/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = getJob(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job nicht gefunden oder abgelaufen.' });
  }

  const baseDir = path.join(__dirname, '..', 'downloads', jobId);
  const mdPath = path.join(baseDir, 'Manuskript_Gesamt.md');

  if (!fs.existsSync(mdPath)) {
    return res.status(404).json({ error: 'Manuskript_Gesamt.md nicht gefunden.' });
  }

  const body = req.body || {};
  const title = body.doc_title || 'Agentic Sovereignty';
  const subtitle = body.doc_subtitle || '';
  const author = body.doc_author || 'Dr. Dirk Kötting';
  const date = body.doc_date || new Date().toISOString().slice(0, 10);
  const shortTitle = body.doc_short_title || title;

  const markdown = fs.readFileSync(mdPath, 'utf8');
  const blocks = parseMarkdown(markdown);
  const chapters = extractChapters(blocks);

  const children = [];

  children.push(new Paragraph({ text: title, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }));
  if (subtitle) {
    children.push(new Paragraph({ text: subtitle, alignment: AlignmentType.CENTER }));
  }
  children.push(new Paragraph({ text: `${author} | ${date}`, alignment: AlignmentType.CENTER }));
  children.push(new Paragraph({ pageBreakBefore: true, text: 'Inhaltsverzeichnis', heading: HeadingLevel.HEADING_1 }));
  children.push(new TableOfContents('Inhaltsverzeichnis', {
    hyperlink: true,
    headingStyleRange: '1-3',
  }));

  children.push(new Paragraph({ pageBreakBefore: true, text: 'Vorwort', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph(body.foreword || ''));
  children.push(new Paragraph({ pageBreakBefore: true, text: 'Über mich', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph(body.about_me || ''));
  children.push(new Paragraph({ pageBreakBefore: true, text: 'Einleitung', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph(body.introduction || ''));
  children.push(new Paragraph({ pageBreakBefore: true, text: 'Abkürzungsverzeichnis', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph(body.abbreviations_list || ''));
  children.push(new Paragraph({ pageBreakBefore: true, text: 'Abbildungsverzeichnis', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph(body.figures_list || ''));
  children.push(new Paragraph({ pageBreakBefore: true, text: 'Tabellenverzeichnis', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph(body.tables_list || ''));

  if (chapters.length > 0) {
    children.push(new Paragraph({ pageBreakBefore: true, text: 'Kapitelübersicht', heading: HeadingLevel.HEADING_1 }));
    chapters.forEach((ch, i) => {
      children.push(new Paragraph({ text: `${i + 1}. ${ch}` }));
    });
  }

  let firstH1 = false;
  for (const b of blocks) {
    if (b.type === 'blank') {
      children.push(new Paragraph(''));
      continue;
    }

    if (b.type === 'code') {
      children.push(new Paragraph({ children: [new TextRun({ text: b.text, font: 'Consolas' })] }));
      continue;
    }

    if (b.type === 'heading') {
      const pageBreak = b.level === 1 && firstH1;
      if (b.level === 1) firstH1 = true;
      children.push(new Paragraph({ text: b.text, heading: mapHeading(b.level), pageBreakBefore: pageBreak }));
      continue;
    }

    if (b.type === 'bullet') {
      children.push(new Paragraph({ text: b.text, bullet: { level: 0 } }));
      continue;
    }

    if (b.type === 'number') {
      children.push(new Paragraph({ text: b.text }));
      continue;
    }

    children.push(new Paragraph(b.text));
  }

  const doc = new Document({
    sections: [
      {
        headers: {
          default: new Header({ children: [new Paragraph(shortTitle)] }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun('[p] Dr. DirKInstitute, Seite '),
                  PageNumber.CURRENT,
                  new TextRun(' von '),
                  PageNumber.TOTAL_PAGES,
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const outPath = path.join(baseDir, 'Manuskript_Gesamt.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);

  return res.json({
    ok: true,
    jobId,
    file: 'Manuskript_Gesamt.docx',
    downloadUrl: `/api/download/${jobId}/Manuskript_Gesamt.docx`,
  });
});

module.exports = router;
