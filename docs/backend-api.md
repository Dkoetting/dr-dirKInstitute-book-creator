# Backend-API für Dr. DirkInstitute Book Creator

## POST /api/upload

Nimmt Dateien entgegen und erzeugt eine Job-ID.

**Request**

- Content-Type: multipart/form-data  
- Feld: `files[]` (eine oder mehrere Dateien: `.docx`, `.pptx`, `.pdf`, `.txt`, `.md`, `.csv`, `.png`, `.jpg`, `.zip`)

**Response (JSON)**

```json
{
  "jobId": "string",
  "files": [
    { "name": "Datei1.docx", "size": 123456 },
    { "name": "Datei2.pdf",  "size": 98765 }
  ]
}
