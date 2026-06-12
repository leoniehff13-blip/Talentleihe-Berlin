import { ExecutionMethod } from "appwrite";
import { functions } from "./appwrite";

/**
 * Ruft die serverseitige Appwrite-Funktion "account-deletion" auf.
 *
 * Die Funktion-ID kommt aus der Umgebungsvariable
 * VITE_APPWRITE_FN_ACCOUNT_DELETION (nach dem Anlegen der Funktion eintragen).
 */
const FN_ID = import.meta.env.VITE_APPWRITE_FN_ACCOUNT_DELETION as string | undefined;

interface FnResult {
  ok: boolean;
  error?: string;
}

async function callFn(payload: Record<string, unknown>): Promise<void> {
  if (!FN_ID) {
    throw new Error(
      "Konto-Löschung ist nicht konfiguriert (VITE_APPWRITE_FN_ACCOUNT_DELETION fehlt)."
    );
  }
  const exec = await functions.createExecution(
    FN_ID,
    JSON.stringify(payload),
    false, // synchron – wir wollen die Antwort direkt auswerten
    "/",
    ExecutionMethod.POST
  );

  let result: FnResult;
  try {
    result = JSON.parse(exec.responseBody || "{}");
  } catch {
    throw new Error("Unerwartete Antwort der Löschfunktion.");
  }
  if (!result.ok) {
    throw new Error(result.error || "Die Aktion ist fehlgeschlagen.");
  }
}

/**
 * Schritt 1: Löschung anfordern (vom eingeloggten Nutzer).
 * Die Funktion verschickt eine Bestätigungsmail mit Lösch-Link.
 */
export function requestAccountDeletion(): Promise<void> {
  return callFn({ action: "request" });
}

/**
 * Schritt 2: Löschung bestätigen (über den Link aus der Mail).
 * Löscht Konto + alle zugehörigen Daten endgültig.
 */
export function confirmAccountDeletion(userId: string, secret: string): Promise<void> {
  return callFn({ action: "confirm", userId, secret });
}
