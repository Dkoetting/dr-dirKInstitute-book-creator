# Kapitel 2: Theoretischer Rahmen und Grundbegriffe

# Theoretischer Rahmen und Grundbegriffe

Die agentenbasierte Modellierung revolutioniert, wie wir komplexe Systeme verstehen und gestalten. Nach diesem Kapitel werden Sie die zentralen Konzepte der Agententheorie verstehen und anwenden können. Sie lernen, autonome Agenten zu charakterisieren, ihre Eigenschaften zu identifizieren und erste eigene Agentenmodelle zu skizzieren. Zudem erwerben Sie die Fähigkeit, zwischen verschiedenen Agententypen zu unterscheiden und deren Einsatzgebiete zu bewerten. Schließlich entwickeln Sie ein Verständnis für die grundlegenden Interaktionsmuster in Multi-Agenten-Systemen.

## Das Agenten-Grundmodell

Ein Agent ist eine autonome Einheit, die ihre Umgebung wahrnimmt und auf Basis dieser Wahrnehmungen eigenständig handelt. Das grundlegende Agentenmodell besteht aus vier Kernkomponenten:

**1. Sensoren**: Mechanismen zur Wahrnehmung der Umgebung
**2. Aktuatoren**: Werkzeuge zur Einflussnahme auf die Umgebung  
**3. Entscheidungslogik**: Regeln oder Algorithmen zur Handlungswahl
**4. Interner Zustand**: Gespeichertes Wissen und aktuelle Verfassung

Diese Komponenten arbeiten in einem kontinuierlichen Kreislauf: Der Agent nimmt seine Umgebung wahr (Perzeption), verarbeitet die Informationen (Kognition), trifft Entscheidungen (Deliberation) und führt Handlungen aus (Aktion).

## Zentrale Definitionen

**Agent**: Eine software- oder hardwarebasierte Entität, die autonom in einer Umgebung agiert, um definierte Ziele zu erreichen.

**Autonomie**: Die Fähigkeit eines Agenten, ohne direkte menschliche Intervention oder Kontrolle durch andere Agenten zu handeln.

**Umgebung (Environment)**: Der Kontext, in dem ein Agent existiert und operiert, einschließlich anderer Agenten, Objekte und Randbedingungen.

**Multi-Agenten-System (MAS)**: Ein System aus mehreren interagierenden Agenten, die gemeinsam oder konkurrierend in einer geteilten Umgebung agieren.

**Emergenz**: Das Entstehen komplexer Systemeigenschaften durch die Interaktion einfacher Agenten, die auf individueller Ebene nicht vorhersehbar sind.

## Agententypen und ihre Eigenschaften

Agenten lassen sich nach ihrer Komplexität in vier Hauptkategorien einteilen:

**Einfache Reflexagenten** reagieren direkt auf Wahrnehmungen mit vordefinierten Aktionen. Ein Thermostat ist ein klassisches Beispiel: Unterschreitet die Temperatur einen Schwellenwert, aktiviert er die Heizung.

**Modellbasierte Reflexagenten** verfügen über ein internes Modell ihrer Umgebung. Sie können den aktuellen Zustand interpretieren und vergangene Informationen nutzen.

**Zielbasierte Agenten** verfolgen explizite Ziele und wählen Aktionen, die sie diesen Zielen näherbringen. Sie können verschiedene Handlungsoptionen bewerten.

**Nutzenbasierte Agenten** optimieren eine Nutzenfunktion und treffen Entscheidungen unter Berücksichtigung von Wahrscheinlichkeiten und Präferenzen.

## Beispiel 1: Der Staubsaugerroboter

Ein autonomer Staubsaugerroboter demonstriert die Agentenprinzipien im Alltag:

- **Sensoren**: Abstandssensoren, Schmutzerkennung, Akkustandsmesser
- **Aktuatoren**: Räder, Saugmotor, Bürsten
- **Entscheidungslogik**: Navigationalalgorithmus, Reinigungsmuster
- **Interner Zustand**: Kartierung der Wohnung, bereits gereinigte Bereiche

Der Roboter nimmt kontinuierlich seine Umgebung wahr, vermeidet Hindernisse, erkennt verschmutzte Bereiche und kehrt bei niedrigem Akkustand zur Ladestation zurück. Er zeigt Autonomie, Reaktivität und Zielgerichtetheit.

## Beispiel 2: Softwareagent im E-Commerce

Ein Preisvergleichsagent illustriert Agenten in digitalen Umgebungen:

Der Agent durchsucht selbstständig verschiedene Online-Shops, extrahiert Produktinformationen und Preise, vergleicht Angebote nach benutzerdefinierten Kriterien und benachrichtigt den Nutzer bei günstigen Angeboten. Er passt sein Verhalten basierend auf dem Nutzerverhalten an und lernt Präferenzen. Hier zeigt sich besonders die Proaktivität von Agenten: Sie werden nicht nur auf Anfrage aktiv, sondern handeln eigeninitiativ im Interesse ihrer Nutzer.

## Interaktion und Kommunikation

In Multi-Agenten-Systemen ist die Interaktion zwischen Agenten zentral. Agenten können kooperieren, konkurrieren oder koordiniert handeln. Die Kommunikation erfolgt über definierte Protokolle und kann direkt (Agent-zu-Agent) oder indirekt (über die gemeinsame Umgebung) stattfinden.

Wichtige Interaktionsmuster sind:
- **Kooperation**: Gemeinsame Zielverfolgung
- **Koordination**: Abstimmung von Aktionen
- **Verhandlung**: Interessensausgleich
- **Wettbewerb**: Konkurrenz um Ressourcen

## Reflexionsfragen

- Welche Eigenschaften muss ein System aufweisen, damit Sie es als "agentisch" klassifizieren würden?
- Wie unterscheidet sich ein autonomer Agent von einem herkömmlichen Programm mit If-Then-Regeln?
- In welchen Bereichen Ihres Arbeitsumfelds könnten Agentensysteme Prozesse verbessern oder automatisieren?
- Welche ethischen Herausforderungen entstehen, wenn Agenten autonom Entscheidungen treffen?
- Wie würden Sie die Balance zwischen Agentenautonomie und menschlicher Kontrolle gestalten?

## Übung: Entwurf eines einfachen Agenten

**Ziel**: Entwicklung eines konzeptionellen Agentenentwurfs für ein praktisches Problem

**Dauer**: 30-45 Minuten

**Material**: Papier und Stift oder digitales Zeichenwerkzeug

**Anleitung**:

1. **Problemidentifikation** (5 Minuten): Wählen Sie eine repetitive Aufgabe aus Ihrem Alltag oder Arbeitsumfeld, die sich für Automatisierung eignet (z.B. E

## Reflexionsfragen

1. Welche drei Aspekte von „Theoretischer Rahmen und Grundbegriffe" sind in Ihrer Organisation heute nicht sichtbar?
2. Welche Normanforderungen sind durch kein existierendes Artefakt abgedeckt?
3. Wer trägt in Ihrer Organisation die operative Verantwortung für diesen Bereich?

## Übung: Übung 2.1 – Theoretischer Rahmen und Grundbegriffe analysieren

**Ziel:** Strukturierte Analyse der Ist-Situation im Bereich „Theoretischer Rahmen und Grundbegriffe"

**Dauer:** 30–45 Minuten

**Material:** Whiteboard oder Kollaborationstool, aktuelle Prozessdokumentation

**Schritte:**

1. Definieren Sie den Scope: Welche Einheit wird analysiert?
2. Erstellen Sie eine Liste aller relevanten Akteure und Systeme.
3. Bewerten Sie den Reifegrad anhand der Kapitel-Kriterien.
4. Identifizieren Sie die drei kritischsten Lücken.
5. Formulieren Sie je Lücke eine konkrete Maßnahme mit Verantwortlichem und Termin.

