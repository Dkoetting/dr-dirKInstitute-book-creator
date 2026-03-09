# Dr. DirkInstitute Book Creator – Dev-Notizen

## Ziel

Web-App, die hochgeladene Dokumente (Transkripte, Notizen, PPT, PDFs etc.) nutzt,
um ein komplettes Fachbuch/Workbook im Stil des Dr. DirkInstitute zu erzeugen.

- **Frontend:** `index.html` – implementiert und lokal lauffähig.
- **KI-Skill:** `skills/dr-dirk-book-creator.SKILL.md`
- **API-Spezifikation:** `docs/backend-api.md`

---

## Backend starten (Phase 1 – Mock)

```bash
# Abhängigkeiten installieren (einmalig)
npm install

# Entwicklungsmodus mit auto-reload
npm run dev

# Produktionsmodus
npm start
```

Browser öffnen: **http://localhost:3001**

Der Server serviert `index.html` direkt – kein separater Frontend-Prozess nötig.

---

## Projektstruktur

```
Book_creator/
├── index.html                           # Frontend (statisch, kein Framework)
├── Logo_Dr.DirkInstitute.jpg
├── package.json
├── server/
│   ├── index.js                         # Express-Einstieg, Static-Serving, Routen-Mount
│   ├── routes/
│   │   ├── upload.js                    # POST /api/upload
│   │   └── generate.js                  # GET  /api/generate/:jobId  (SSE)
│   └── lib/
│       ├── jobStore.js                  # In-Memory-Job-Store (Phase 1)
│       └── generateChaptersFromSkill.js # Mock-Generator + TODO: KI-Integration
├── skills/
│   └── dr-dirk-book-creator.SKILL.md   # Stil, Workflow, Kapitel-Template
└── docs/
    ├── backend-api.md                   # API-Spezifikation
    └── README-dev.md                    # diese Datei
```

---

## API-Endpunkte

| Methode | Pfad                       | Beschreibung                          |
|---------|----------------------------|---------------------------------------|
| POST    | `/api/upload`              | Dateien hochladen, jobId zurückbekommen |
| GET     | `/api/generate/:jobId?...` | SSE-Stream: Kapitel generieren        |
| GET     | `/api/download/:jobId/:fn` | Datei-Download (Phase 2)              |

---

## Phase 2 – KI-Integration (TODO)

Die gesamte KI-Logik wird in **`server/lib/generateChaptersFromSkill.js`** integriert.
Die Funktion `generateChaptersFromSkill(files, params, send)` ist der einzige Punkt,
der geändert werden muss – alle anderen Schichten (Routen, SSE, Job-Store) bleiben unverändert.

### Schritt-für-Schritt

1. **Datei-Inhalte extrahieren**
   - `.docx` → [`mammoth`](https://www.npmjs.com/package/mammoth) (Markdown/Text)
   - `.pdf`  → [`pdf-parse`](https://www.npmjs.com/package/pdf-parse)
   - `.txt`, `.md`, `.csv` → direkt aus `file.buffer`

2. **System-Prompt aufbauen**
   - `skills/dr-dirk-book-creator.SKILL.md` einlesen und als System-Prompt verwenden.
   - Metadaten (`bookTitle`, `bookType`, `audience`, `level`, `length`) einfügen.

3. **Claude-API-Call pro Kapitel**
   ```js
   const Anthropic = require('@anthropic-ai/sdk');
   const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

   const message = await client.messages.create({
     model: params.model,          // 'claude-opus-4-20250514' o.ä.
     max_tokens: 8192,
     system: systemPrompt,
     messages: [{ role: 'user', content: userPromptForChapter }],
   });
   ```

4. **Manuskript erzeugen**
   - Kapitel als `.docx` mit [`docx`](https://www.npmjs.com/package/docx)
   - Kapitel-ZIP mit [`archiver`](https://www.npmjs.com/package/archiver)

5. **Download-URLs bereitstellen**
   - Phase 1: Platzhalter (`/api/download/:jobId/...` → HTTP 501)
   - Phase 2: Datei aus Disk/Cloud servieren

### Umgebungsvariablen (Phase 2)

```env
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

---

## Migration auf Next.js (optional)

Die Express-Routen sind so strukturiert, dass sie sich 1:1 in Next.js API-Routen überführen lassen:

| Express                      | Next.js (App Router)                        |
|------------------------------|---------------------------------------------|
| `server/routes/upload.js`    | `app/api/upload/route.ts`                   |
| `server/routes/generate.js`  | `app/api/generate/[jobId]/route.ts`         |
| `server/lib/jobStore.js`     | unverändert übernehmen                      |
| `server/lib/generateChaptersFromSkill.js` | unverändert übernehmen         |

Für Next.js SSE: `new Response(ReadableStream, { headers: { 'Content-Type': 'text/event-stream' } })`
