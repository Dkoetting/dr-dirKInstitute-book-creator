\# Backend-API für Dr. DirkInstitute Book Creator



\## POST /api/upload



Nimmt Dateien entgegen und erzeugt eine Job-ID.



Request:

\- Content-Type: multipart/form-data

\- Feld: files\[] (eine oder mehrere Dateien: .docx, .pptx, .pdf, .txt, .md, .csv, .png, .jpg, .zip)



Response (JSON):

{

&nbsp; "jobId": "string",

&nbsp; "files": \[

&nbsp;   { "name": "Datei1.docx", "size": 123456 },

&nbsp;   { "name": "Datei2.pdf", "size": 98765 }

&nbsp; ]

}



\## GET /api/generate/:jobId?bookTitle=...\&bookSubtitle=...\&bookType=...\&audience=...\&level=...\&length=...\&model=...



Server-Sent Events (SSE), die den Generierungsprozess eines vollständigen Buches steuern.



Events:

\- progress:

&nbsp; { "chapter": 1, "total": 10, "percent": 12, "status": "Strukturiere Kapitel 1" }



\- chapter\_done:

&nbsp; { "chapter": 1, "title": "Kapitelüberschrift", "percent": 20 }



\- chapter\_error:

&nbsp; { "chapter": 1, "error": "Fehlermeldung" }



\- done:

&nbsp; {

&nbsp;   "chapters": \[

&nbsp;     {

&nbsp;       "number": 1,

&nbsp;       "title": "Kapitel 1",

&nbsp;       "text": "...",

&nbsp;       "reflections": \["...", "..."],

&nbsp;       "exercise": { "title": "...", "steps": \["...", "..."] },

&nbsp;       "templates": \["...", "..."],

&nbsp;       "checklists": \["...", "..."],

&nbsp;       "figures": \[

&nbsp;         {

&nbsp;           "id": "Abb. 1.1",

&nbsp;           "caption": "Titel der Abbildung",

&nbsp;           "description": "Design-Briefing für die Grafik",

&nbsp;           "suggestedPlacement": "Abschnitt 1.3"

&nbsp;         }

&nbsp;       ]

&nbsp;     }

&nbsp;     // weitere Kapitel

&nbsp;   ],

&nbsp;   "downloadUrl": "https://.../buch-kapitel.zip",

&nbsp;   "manuscriptUrl": "https://.../Manuskript\_Gesamt.docx"

&nbsp; }



Hinweis:

\- Alle Kapitel werden am Ende zusätzlich zu einem Gesamtmanuskript zusammengeführt (manuscriptUrl).

\- Die Struktur pro Kapitel folgt dem Template aus `skills/dr-dirk-book-creator.SKILL.md`.



