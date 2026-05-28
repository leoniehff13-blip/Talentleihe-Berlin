import { AppwriteException } from "appwrite";

/**
 * Übersetzt Appwrite-Fehlermeldungen (und allgemeine JS-Fehler) ins Deutsche.
 * Gibt immer einen verständlichen deutschen Satz zurück.
 */

const TYPE_MAP: Record<string, string> = {
  // Auth
  user_invalid_credentials:
    "Ungültige Anmeldedaten. Bitte E-Mail und Passwort überprüfen.",
  user_already_exists:
    "Diese E-Mail-Adresse ist bereits registriert.",
  user_email_already_exists:
    "Diese E-Mail-Adresse ist bereits registriert.",
  user_session_already_exists:
    "Du bist bereits angemeldet. Bitte zuerst ausloggen.",
  user_not_found:
    "Kein Konto mit dieser E-Mail-Adresse gefunden.",
  user_blocked:
    "Dieses Konto wurde gesperrt. Bitte melde dich beim Support.",
  user_password_reset_required:
    "Das Passwort muss zurückgesetzt werden.",
  user_invalid_token:
    "Ungültiger oder abgelaufener Bestätigungslink.",
  general_unauthorized_scope:
    "Keine Berechtigung. Bitte einloggen.",
  // Datenbank
  document_not_found:
    "Eintrag wurde nicht gefunden.",
  document_already_exists:
    "Dieser Eintrag existiert bereits.",
  document_invalid_structure:
    "Ungültige Datenstruktur. Bitte alle Pflichtfelder korrekt ausfüllen.",
  document_missing_required:
    "Pflichtfelder fehlen. Bitte alle Felder ausfüllen.",
  collection_not_found:
    "Datenbankfehler: Sammlung nicht gefunden.",
  database_not_found:
    "Datenbankfehler: Datenbank nicht gefunden.",
  // Storage
  storage_file_type_not_allowed:
    "Dieser Dateityp ist nicht erlaubt. Erlaubt sind PDF, Word und Bilddateien.",
  storage_file_size_exceeded:
    "Die Datei ist zu groß. Maximal erlaubt sind 10 MB.",
  storage_bucket_not_found:
    "Speicherbereich nicht gefunden.",
  storage_device_not_found:
    "Speichergerät nicht gefunden.",
  // Rate Limit
  rate_limit_exceeded:
    "Zu viele Anfragen. Bitte kurz warten und erneut versuchen.",
  general_rate_limit_exceeded:
    "Zu viele Anfragen. Bitte kurz warten und erneut versuchen.",
};

export function translateError(err: unknown): string {
  if (err instanceof AppwriteException) {
    // Typ-basierte Übersetzung (zuverlässigste Methode)
    if (err.type && TYPE_MAP[err.type]) {
      return TYPE_MAP[err.type];
    }
    // Fallback: Mustersuche in der englischen Meldung
    const m = err.message.toLowerCase();
    if (m.includes("invalid credentials") || m.includes("invalid email or password")) {
      return "Ungültige Anmeldedaten. Bitte E-Mail und Passwort überprüfen.";
    }
    if (m.includes("already registered") || m.includes("already exists")) {
      return "Diese E-Mail-Adresse ist bereits registriert.";
    }
    if (m.includes("session is active") || m.includes("session is prohibited")) {
      return "Du bist bereits angemeldet. Bitte zuerst ausloggen.";
    }
    if (m.includes("missing scope") || m.includes("unauthorized")) {
      return "Keine Berechtigung. Bitte einloggen.";
    }
    if (m.includes("not found")) {
      return "Eintrag wurde nicht gefunden.";
    }
    if (m.includes("network") || m.includes("fetch") || m.includes("failed to fetch")) {
      return "Verbindungsfehler. Bitte Internetverbindung prüfen.";
    }
    if (m.includes("too many requests") || m.includes("rate limit")) {
      return "Zu viele Anfragen. Bitte kurz warten und erneut versuchen.";
    }
    if (m.includes("file size") || m.includes("too large")) {
      return "Die Datei ist zu groß. Maximal erlaubt sind 10 MB.";
    }
    // Unbekannter Appwrite-Fehler: Code + Originaltext
    return `Fehler (${err.code}): ${err.message}`;
  }

  if (err instanceof Error) {
    const m = err.message.toLowerCase();
    if (m.includes("failed to fetch") || m.includes("networkerror") || m.includes("network request failed")) {
      return "Verbindungsfehler. Bitte Internetverbindung prüfen.";
    }
    return err.message;
  }

  return String(err);
}
