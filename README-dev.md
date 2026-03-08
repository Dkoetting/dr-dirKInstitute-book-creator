\# Dr. DirkInstitute Book Creator – Dev-Notizen



Ziel:

\- Web-App, die hochgeladene Dokumente (Transkripte, Notizen, PPT, PDFs etc.) nutzt,

&nbsp; um ein komplettes Fachbuch/Workbook im Stil des Dr. DirkInstitute zu erzeugen.



Wichtig:

\- Frontend: `index.html` ist bereits implementiert und deployed.

\- KI-Logik: in `skills/dr-dirk-book-creator.SKILL.md` beschrieben.

\- Backend-API: in `docs/backend-api.md` beschrieben.



Nächste Implementierungsschritte:

\- Next.js/Node-Backend mit Routen aus `backend-api.md` anlegen.

\- SSE in `/api/generate/:jobId` implementieren.

\- Pro Kapitel den Skill nutzen, um Struktur + Text + Reflexionsfragen + Übung + Conclusio + Templates/Checklisten/Figuren-Beschreibungen zu generieren.



