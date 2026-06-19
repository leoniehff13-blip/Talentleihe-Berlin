# Win-Win VerbundPraxis

Web- und Mobile-App (Nachfolger der Flutter-Version „Lehrstellen-Radar"), gebaut mit Ionic + React + Vite.
Backend: Appwrite. Native iOS/Android: Capacitor.

## Voraussetzungen

- Node.js 20 oder neuer (`node --version`)
- macOS für iOS-Builds, ein installiertes Xcode für die iOS-Native-App
- Android Studio (optional, für Android-Native-App)

## Erststart

1. **Abhängigkeiten installieren** – im Terminal in diesen Ordner wechseln und einmalig ausführen:

   ```bash
   npm install
   ```

2. **Appwrite-Werte eintragen** – kopiere die Vorlage und ergänze deine Project-ID:

   ```bash
   cp .env.example .env.local
   ```

   Danach `.env.local` öffnen und `VITE_APPWRITE_PROJECT_ID` setzen.
   Die Project-ID findest du in der Appwrite-Konsole oben im Projekt-Header.

3. **Dev-Server starten**:

   ```bash
   npm run dev
   ```

   Dann im Browser http://localhost:5173 öffnen. Auf der Startseite gibt es einen Button „Verbindung prüfen" – wenn dort „Verbindung steht …" oder „Verbunden …" steht, klappt die Anbindung an Appwrite.

## Native Apps (Capacitor)

Erst einmalig die Plattformen hinzufügen:

```bash
npm run build           # baut die Web-Version nach dist/
npm run cap:add:ios     # legt das ios/-Projekt an (nur einmal)
npm run cap:add:android # legt das android/-Projekt an (nur einmal)
```

Danach jedes Mal nach Code-Änderungen:

```bash
npm run cap:sync        # neuer Web-Build + sync ins native Projekt
npm run cap:open:ios    # öffnet Xcode
npm run cap:open:android # öffnet Android Studio
```

In Xcode bzw. Android Studio kannst du dann auf einem Simulator/Gerät starten oder die App fürs Stores bauen.

## Projektstruktur

```
src/
├─ App.tsx              # Routing und globale Ionic-Setups
├─ main.tsx             # Einstiegspunkt
├─ pages/Home.tsx       # Startseite (Demo)
├─ lib/appwrite.ts      # Appwrite-Client (account, databases, storage)
└─ theme/variables.css  # zentrale Design-Variablen
```

## Nächste Schritte

- Eigene Seiten unter `src/pages/` anlegen und in `src/App.tsx` als Route eintragen.
- Datenmodelle aus der Flutter-App in TypeScript-Typen übersetzen (z. B. unter `src/types/`).
- Die Appwrite-Datenbank/Collections in der Konsole anlegen und über `databases` aus `src/lib/appwrite.ts` ansprechen.
- Sobald die App reif fürs Hosting ist: Repo zu GitHub pushen, dann in der Appwrite-Konsole unter „Sites" das Repo verbinden – Framework `Vite`, Build-Command `npm run build`, Output-Dir `dist`.
