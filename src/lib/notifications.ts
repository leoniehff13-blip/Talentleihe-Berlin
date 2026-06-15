import { ExecutionMethod } from "appwrite";
import { functions } from "./appwrite";

/**
 * Ruft die serverseitige Appwrite-Funktion "notifications" auf, um eine
 * Benachrichtigungs-Mail zu versenden. Funktion-ID aus
 * VITE_APPWRITE_FN_NOTIFICATIONS.
 *
 * Bewusst „fire and forget": Schlägt der Mailversand fehl, soll das den
 * eigentlichen Vorgang (Bewerben / Annehmen) NICHT abbrechen – daher werden
 * Fehler nur geloggt, nicht geworfen.
 */
const FN_ID = import.meta.env.VITE_APPWRITE_FN_NOTIFICATIONS as string | undefined;

async function callFn(payload: Record<string, unknown>): Promise<void> {
  if (!FN_ID) {
    // eslint-disable-next-line no-console
    console.warn("notifications: VITE_APPWRITE_FN_NOTIFICATIONS nicht gesetzt – Mail übersprungen.");
    return;
  }
  try {
    await functions.createExecution(
      FN_ID,
      JSON.stringify(payload),
      false,
      "/",
      ExecutionMethod.POST
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("notifications: Mailversand fehlgeschlagen", err);
  }
}

/** Bewerber:in hat sich beworben → Mail an den/die Anzeigen-Inhaber:in. */
export function notifyNeueBewerbung(bewerbungId: string): Promise<void> {
  return callFn({ action: "neue_bewerbung", bewerbungId });
}

/** Anzeigen-Inhaber:in hat angenommen → Mail an den/die Bewerber:in. */
export function notifyBewerbungAngenommen(bewerbungId: string): Promise<void> {
  return callFn({ action: "bewerbung_angenommen", bewerbungId });
}
