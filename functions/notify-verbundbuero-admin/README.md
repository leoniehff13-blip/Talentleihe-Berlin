# notify-verbundbuero-admin

Appwrite Function, die das Verbundbüro Berlin per E-Mail benachrichtigt, sobald
ein:e neu registrierte:r Verbundbüro-User:in die eigene E-Mail bestätigt hat.

## Deployment-Schritte

### 1. Resend-Konto anlegen

1. Auf https://resend.com registrieren (gratis, kein Kreditkarten-Zwang)
2. Im Resend-Dashboard unter **API Keys** einen neuen Key erstellen
   (`Create API Key` → Name z. B. „Talentleihe Verbundbüro" → Permission: **Sending access**)
3. Den Key kopieren (beginnt mit `re_…`)

Optional, aber empfohlen:
- Unter **Domains** deine eigene Domain (z. B. `verbundbuero-berlin.de`)
  hinzufügen und die DNS-Einträge in deinem Domain-Provider hinterlegen.
- Solange du das nicht tust, kannst du `onboarding@resend.dev` als Absender
  nutzen — aber nur an Test-Empfänger (Resend-Limitierung im Gratis-Tier).

### 2. Function in der Appwrite-Konsole anlegen

1. Appwrite-Konsole → dein Projekt → **Functions** → **Create function**
2. **Connect Git repository** wählen
3. Branch: `main`, Root directory: `functions/notify-verbundbuero-admin`
4. **Function ID**: exakt `notify-verbundbuero-admin` eintragen
   (genau dieser Wert wird vom Frontend referenziert)
5. **Runtime**: `Node 18.0` oder neuer
6. **Entrypoint**: `src/main.js`
7. **Build command**: leer lassen
8. **Permissions**: Bei „Execute access" `users` setzen
   (damit jeder eingeloggte User die Function aufrufen darf)

### 3. Environment-Variablen setzen

In der Function-Konfiguration im Tab **Settings → Environment variables**:

| Key | Wert |
|---|---|
| `RESEND_API_KEY` | dein Resend-Key aus Schritt 1 |
| `ADMIN_EMAIL` | `leonie@3hoffis.de` |
| `FROM_EMAIL` | `onboarding@resend.dev` (oder eigene verifizierte Adresse) |

### 4. Function deployen

Sobald die Function angelegt ist, baut Appwrite Sites bei jedem `git push`
automatisch neu. Im Tab **Deployments** der Function siehst du den Status.

### 5. Testen

Im Frontend einen neuen Verbundbüro-Account anlegen (mit einer **anderen**
Mail als `leonie@3hoffis.de`). Nach Klick auf den Verifizierungs-Link in der
ersten Mail wird die Function getriggert. Im Resend-Dashboard sollte die
gesendete Mail auftauchen.

Falls es hakt:
- Logs der Function in der Appwrite-Konsole anschauen
- Resend-Dashboard checken (rejected mails sind dort sichtbar)
- Browser-Konsole nach Fehlern durchsuchen
