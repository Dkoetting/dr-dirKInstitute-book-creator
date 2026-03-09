# Kapitel 3: Kernmodell und Architektur

# Kernmodell und Architektur

Die Architektur agentischer Systeme bildet das Fundament für deren praktische Anwendung. In diesem Kapitel lernen Sie die grundlegenden Bausteine und deren Zusammenspiel kennen. Sie werden verstehen, wie Agenten ihre Umgebung wahrnehmen, Entscheidungen treffen und autonom handeln. Zudem erfahren Sie, welche Komponenten für die Kommunikation zwischen mehreren Agenten erforderlich sind. Nach der Lektüre können Sie die Kernelemente einer agentischen Architektur identifizieren und deren Funktionsweise erklären. Abschließend sind Sie in der Lage, einfache Agentenmodelle zu skizzieren und deren Informationsflüsse nachzuvollziehen.

## Das PEAS-Modell als Grundgerüst

Jeder Agent lässt sich durch vier fundamentale Aspekte beschreiben, die gemeinsam das PEAS-Modell bilden:

**Performance** (Leistungsmaß): Definiert, wie der Erfolg des Agenten gemessen wird. Dies kann Geschwindigkeit, Genauigkeit, Energieeffizienz oder eine Kombination mehrerer Faktoren sein.

**Environment** (Umgebung): Beschreibt den Kontext, in dem der Agent operiert. Die Umgebung kann physisch oder digital, statisch oder dynamisch, vollständig oder teilweise beobachtbar sein.

**Actuators** (Aktoren): Die Werkzeuge, mit denen der Agent auf seine Umgebung einwirkt. Bei einem Roboter sind dies Motoren und Greifer, bei einem Software-Agenten APIs oder Datenbankschnittstellen.

**Sensors** (Sensoren): Komponenten zur Wahrnehmung der Umgebung. Dies reicht von Kameras und Temperaturfühlern bis zu Dateneingängen und Nutzereingaben.

## Die Kernkomponenten agentischer Architektur

Ein vollständiger Agent besteht aus mehreren miteinander verbundenen Komponenten:

**Wahrnehmungsmodul**: Sammelt und verarbeitet Rohdaten aus den Sensoren. Es filtert relevante Informationen und übersetzt sie in eine für den Agenten verständliche Form.

**Wissensrepräsentation**: Speichert das Welt- und Domänenwissen des Agenten. Dies umfasst sowohl statisches Wissen (Fakten, Regeln) als auch dynamisches Wissen (aktuelle Zustände, Erfahrungen).

**Entscheidungsmodul**: Der zentrale Baustein, der basierend auf Wahrnehmungen und Wissen die nächsten Aktionen bestimmt. Hier kommen verschiedene Ansätze zum Einsatz:
- Regelbasierte Systeme für deterministische Entscheidungen
- Lernende Systeme für adaptive Verhaltensweisen
- Hybride Ansätze für komplexe Anforderungen

**Ausführungsmodul**: Übersetzt abstrakte Entscheidungen in konkrete Aktionen und steuert die Aktoren entsprechend an.

**Kommunikationsschnittstelle**: Ermöglicht bei Multi-Agenten-Systemen den Austausch von Nachrichten, Wissen und Koordinationsinformationen zwischen einzelnen Agenten.

## Beispiel 1: Autonomer Staubsauger-Roboter

Ein Haushaltsroboter demonstriert die praktische Umsetzung der Architektur:

- **Sensoren**: Infrarotsensoren für Hinderniserkennung, Bodensensoren für Treppenerkennung, Schmutzsensoren
- **Wahrnehmungsmodul**: Erstellt eine interne Karte der Wohnung, identifiziert verschmutzte Bereiche
- **Wissensrepräsentation**: Speichert Raumlayout, bereits gereinigte Flächen, typische Verschmutzungsmuster
- **Entscheidungsmodul**: Plant effiziente Reinigungsrouten, priorisiert stark verschmutzte Bereiche
- **Aktoren**: Räder für Bewegung, rotierende Bürsten, Saugmotor
- **Performance**: Flächenabdeckung pro Zeiteinheit, Energieeffizienz, Gründlichkeit der Reinigung

## Beispiel 2: E-Mail-Filter-Agent

Ein Software-Agent zur E-Mail-Klassifikation zeigt die Architektur in digitaler Form:

- **Sensoren**: E-Mail-Eingang, Metadaten (Absender, Betreff, Zeitstempel)
- **Wahrnehmungsmodul**: Textanalyse, Mustererkennung in Betreffzeilen und Inhalten
- **Wissensrepräsentation**: Bekannte Spam-Merkmale, Nutzerverhalten, Whitelist/Blacklist
- **Entscheidungsmodul**: Klassifikation in Kategorien (wichtig, normal, spam), Lernalgorithmus passt sich an Nutzerfeedback an
- **Aktoren**: Verschieben in Ordner, Markierungen setzen, Benachrichtigungen auslösen
- **Performance**: Erkennungsrate von Spam, Minimierung falsch-positiver Klassifikationen

## Reflexionsfragen

- Welche Sensoren und Aktoren würden Sie für einen agentischen Kundenservice-Chatbot definieren?
- Wie unterscheidet sich die Wissensrepräsentation eines reaktiven Agenten von der eines lernenden Agenten?
- Welche Herausforderungen entstehen, wenn mehrere Agenten in derselben Umgebung agieren?
- Wie würden Sie das Performance-Maß für einen Agenten definieren, der medizinische Diagnosen unterstützt?
- Welche Architekturkomponente ist Ihrer Meinung nach am kritischsten für die Gesamtleistung eines Agenten?

## Übung: Entwurf einer Agentenarchitektur

**Ziel**: Entwicklung einer vollständigen PEAS-Beschreibung und Architekturskizze für einen eigenen Agenten

**Dauer**: 45 Minuten

**Material**: 
- Papier und Stift oder digitales Zeichenwerkzeug
- PEAS-Vorlage (kann selbst erstellt werden)

**Schritt-für-Schritt-Anleitung**:

1. **Problemauswahl** (5 Minuten): Wählen Sie ein konkretes Problem aus Ihrem Alltag oder Arbeitsumfeld. Beispiele: Terminplanung, Lagerverwaltung, Energieoptimierung.

2. **PEAS-Definition** (15 Minuten):
   - Performance: Definieren Sie 2-3 messbare Erfolgskriterien
   - Environment: Beschreiben Sie die Umgebung (physisch/digital, dynamisch/statisch)

## Reflexionsfragen

1. Welche drei Aspekte von „Kernmodell und Architektur" sind in Ihrer Organisation heute nicht sichtbar?
2. Welche Normanforderungen sind durch kein existierendes Artefakt abgedeckt?
3. Wer trägt in Ihrer Organisation die operative Verantwortung für diesen Bereich?

## Übung: Übung 3.1 – Kernmodell und Architektur analysieren

**Ziel:** Strukturierte Analyse der Ist-Situation im Bereich „Kernmodell und Architektur"

**Dauer:** 30–45 Minuten

**Material:** Whiteboard oder Kollaborationstool, aktuelle Prozessdokumentation

**Schritte:**

1. Definieren Sie den Scope: Welche Einheit wird analysiert?
2. Erstellen Sie eine Liste aller relevanten Akteure und Systeme.
3. Bewerten Sie den Reifegrad anhand der Kapitel-Kriterien.
4. Identifizieren Sie die drei kritischsten Lücken.
5. Formulieren Sie je Lücke eine konkrete Maßnahme mit Verantwortlichem und Termin.

