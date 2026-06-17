# verbundbuero-approval

Verarbeitet die beiden Aktionen „Freigeben" und „Ablehnen", die vom Verbundbüro
über die Benachrichtigungsmail ausgelöst werden.

## Deployment

1. **API-Key in Appwrite anlegen**
   - Console → dein Projekt → **Settings → API Keys → Create API Key**
   - Name: `verbundbuero-approval`
   - Scopes: `databases.read`, `databases.write`, `users.read`, `users.write`
   - Den Key kopieren (beginnt mit `standard_…`)

2. **Function anlegen**
   - Console → **Functions → Create function**
   - Connect Git repository → Branch `main`
   - **Function ID exakt:** `verbundbuero-approval` (manuell überschreiben)
   - **Root directory:** `functions/verbundbuero-approval`
   - **Runtime:** Node 18.0+
   - **Entrypoint:** `src/main.js`
   - **Build command:** leer
   - **Execute access:** `Any` (damit die öffentliche Approval-Seite die Function
     ohne Login aufrufen kann)

3. **Environment-Variablen** im Settings-Tab der Function:

   | Key | Wert |
   |---|---|
   | `APPWRITE_ENDPOINT` | `https://fra.cloud.appwrite.io/v1` (oder dein Endpoint) |
   | `APPWRITE_PROJECT_ID` | deine Project-ID |
   | `APPWRITE_API_KEY` | der Key aus Schritt 1 |
   | `DATABASE_ID` | `lehrstellen` |
   | `PROFILES_TABLE_ID` | `profiles` |
   | `RESEND_API_KEY` | dein Resend-Key (auch in der notify-Function) |
   | `FROM_EMAIL` | `onboarding@resend.dev` oder eigene Domain |

4. **Nach erstem Deploy testen**: Im Frontend einen neuen Verbundbüro-Account
   anlegen, die Notify-Mail abwarten, auf „Freigeben" klicken → Konto sollte
   freigeschaltet sein. Bei „Ablehnen" → Account + Profil gelöscht, Antragsteller
   bekommt Ablehnungs-Mail.
