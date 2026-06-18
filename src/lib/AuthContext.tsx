import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AppwriteException, ID, Permission, Query, Role, type Models } from "appwrite";
import {
  account,
  databases,
  functions,
  DB_LEHRSTELLEN,
  COL_PROFILES,
  VERBUNDBUERO_ADMIN_EMAIL,
  type Profile,
} from "./appwrite";

/**
 * Function-ID der Appwrite-Function, die das Verbundberatung per E-Mail
 * benachrichtigt. Beim ersten Anlegen hat Appwrite eine zufällige ID
 * generiert; daher hier der konkrete Wert. Falls die Function jemals
 * neu angelegt wird, diese Konstante mit der neuen ID aktualisieren.
 */
const FN_NOTIFY_VERBUNDBUERO_ADMIN = "6a312ffc0009bd7f56b0";

/** Baut eine absolute App-URL für einen Pfad (berücksichtigt Vite-Base). */
function appUrlForApproval(path: string): string {
  const raw = import.meta.env.BASE_URL || "/";
  const base = raw.endsWith("/") ? raw : `${raw}/`;
  return `${window.location.origin}${base}${path}`;
}

async function notifyVerbundbueroAdmin(
  name: string,
  email: string,
  approveUrl: string,
  rejectUrl: string
) {
  // eslint-disable-next-line no-console
  console.log("[Verbundberatung] notify-Function wird aufgerufen für:", name, email);
  try {
    const result = await functions.createExecution(
      FN_NOTIFY_VERBUNDBUERO_ADMIN,
      JSON.stringify({
        applicantName: name,
        applicantEmail: email,
        approveUrl,
        rejectUrl,
      }),
      false,
      "/",
      "POST" as never,
      { "Content-Type": "application/json" } as never
    );
    // eslint-disable-next-line no-console
    console.log("[Verbundberatung] notify-Function fertig:", result);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[Verbundberatung] notify-Function fehlgeschlagen:", err);
  }
}

/** Zufalls-Token erzeugen — als Geheimnis für den Approval-Link. */
function generateApprovalToken(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }
  // Fallback (unwahrscheinlich nötig in modernen Browsern)
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type AuthUser = Models.User<Models.Preferences> | null;

export type ProfileInput = Omit<Profile, keyof Models.Document>;

interface AuthContextValue {
  user: AuthUser;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<Models.User<Models.Preferences>>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  saveProfile: (data: ProfileInput) => Promise<Profile>;
  /**
   * Legt ein Verbundberatung-Profil an. Wird beim Registrierungs-Flow für die
   * Verbundberatung-Rolle aufgerufen. Bei der Admin-Mailadresse direkt freigegeben,
   * sonst muss die Person manuell freigeschaltet werden.
   */
  saveVerbundbueroProfile: (name: string, email: string) => Promise<Profile>;
  sendVerification: () => Promise<void>;
  confirmVerification: (userId: string, secret: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (userId: string, secret: string, password: string) => Promise<void>;
}

// Baut eine absolute URL auf eine App-Route – berücksichtigt das Vite-Base
// (wichtig für GitHub Pages), damit die Mail-Klick-Links korrekt zurückführen.
function appUrl(path: string): string {
  const raw = import.meta.env.BASE_URL || "/";
  const base = raw.endsWith("/") ? raw : `${raw}/`;
  return `${window.location.origin}${base}${path}`;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfileFor(userId: string): Promise<Profile | null> {
  const result = await databases.listDocuments<Profile>(
    DB_LEHRSTELLEN,
    COL_PROFILES,
    [Query.equal("user_id", userId), Query.limit(1)]
  );
  return result.documents[0] ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setProfileLoading(true);
    try {
      const u = await account.get();
      setUser(u);
      try {
        const p = await fetchProfileFor(u.$id);
        setProfile(p);
      } catch {
        // Bei Fetch-Fehler bestehendes Profil NICHT löschen –
        // sonst erscheint nach dem Login kurz der „kein Profil"-Screen.
        // Nur logout() setzt das Profil bewusst auf null.
      }
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
      setProfileLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function login(email: string, password: string) {
    try {
      await account.createEmailPasswordSession(email, password);
    } catch (err) {
      // Falls bereits eine aktive Session existiert, alle Sessions löschen
      // und einen neuen Login starten.
      if (
        err instanceof AppwriteException &&
        (err.type === "user_session_already_exists" || err.code === 401)
      ) {
        try { await account.deleteSessions(); } catch { /* ignorieren */ }
        await account.createEmailPasswordSession(email, password);
      } else {
        throw err;
      }
    }
    await refresh();
  }

  async function signup(name: string, email: string, password: string) {
    const created = await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    // Bestätigungsmail anstoßen – Fehler hier dürfen die Registrierung nicht
    // abbrechen (z. B. wenn der Mailversand temporär klemmt).
    try {
      await account.createVerification(appUrl("verifizieren"));
    } catch { /* Verifizierung kann später über das Konto erneut gesendet werden */ }
    await refresh();
    return created;
  }

  async function sendVerification() {
    await account.createVerification(appUrl("verifizieren"));
  }

  async function confirmVerification(userId: string, secret: string) {
    try {
      await account.updateVerification(userId, secret);
    } catch (err: unknown) {
      const code = (err as { code?: number })?.code;
      if (code !== 401) throw err;
    }
    try { await refresh(); } catch { /* ignore */ }
    // Hinweis: Die Verbundberatung-Benachrichtigung wird bei der Registrierung
    // verschickt (saveVerbundbueroProfile), NICHT hier. Grund: der
    // Verifizierungs-Link kann in einem Tab ohne Session geklickt werden,
    // dann fehlen die Berechtigungen für den Function-Aufruf.
  }

  async function requestPasswordReset(email: string) {
    await account.createRecovery(email, appUrl("passwort-neu"));
  }

  async function confirmPasswordReset(userId: string, secret: string, password: string) {
    await account.updateRecovery(userId, secret, password);
  }

  async function logout() {
    // Alle aktiven Sessions löschen (nicht nur die aktuelle), damit
    // keine "Mehrere Sessions aktiv"-Fehler beim erneuten Login entstehen.
    try {
      await account.deleteSessions();
    } catch {
      // Session evtl. bereits abgelaufen – kein Fehler nötig
    } finally {
      setUser(null);
      setProfile(null);
    }
  }

  async function saveProfile(data: ProfileInput): Promise<Profile> {
    // Immer direkt von Appwrite holen – State kann nach signup() veraltet sein
    const currentUser = await account.get();
    const userId = currentUser.$id;

    const existingProfile = await fetchProfileFor(userId);

    if (existingProfile) {
      const updated = await databases.updateDocument<Profile>(
        DB_LEHRSTELLEN,
        COL_PROFILES,
        existingProfile.$id,
        data
      );
      setProfile(updated);
      return updated;
    }

    const created = await databases.createDocument<Profile>(
      DB_LEHRSTELLEN,
      COL_PROFILES,
      ID.unique(),
      { ...data, user_id: userId },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    setProfile(created);
    return created;
  }

  async function saveVerbundbueroProfile(
    name: string,
    email: string
  ): Promise<Profile> {
    const currentUser = await account.get();
    const userId = currentUser.$id;
    const isAdmin = email.trim().toLowerCase() === VERBUNDBUERO_ADMIN_EMAIL;
    // type ist im Schema required → wir setzen einen Platzhalter (betrieb).
    // role und approved sind die eigentlich relevanten Felder.
    // Achtung: talent_name ist im Profile-Interface, aber NICHT in der DB.
    // Es darf hier nicht mitgesendet werden, sonst lehnt Appwrite das Dokument
    // mit "document_invalid_structure" ab. Wir umgehen den TS-Cast mit einem
    // Record-Typ – die Liste hier muss zur tatsächlichen DB-Schema-Spaltenliste passen.
    // Token für die Approval-Links (nur bei Nicht-Admin nötig).
    const approvalToken = isAdmin ? null : generateApprovalToken();

    const data = {
      type: "verbundberatung" as const,
      user_id: userId,
      name: name.trim(),
      vorname: null,
      anrede: null,
      ort: null,
      adresse: null,
      gewerk: null,
      handwerkskammer: null,
      lehrjahr: null,
      unternehmen: null,
      berufsschule: null,
      faehigkeiten: [],
      ansprechpartner: null,
      ansprechpartner_email: null,
      spezialisierung: [],
      role: "verbundbuero" as const,
      approved: isAdmin,
      approval_token: approvalToken,
    } as unknown as ProfileInput;
    const created = await databases.createDocument<Profile>(
      DB_LEHRSTELLEN,
      COL_PROFILES,
      ID.unique(),
      data,
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    setProfile(created);

    // Wenn nicht der Admin selbst → Verbundberatung per Mail benachrichtigen.
    // Wir machen das hier (statt nach E-Mail-Verifizierung), weil die
    // Verifizierung in einem anderen Tab/Browser ohne Session geklickt werden
    // kann und der Function-Call dann fehlschlägt. Hier ist die Session
    // garantiert frisch (signup hat sie gerade angelegt).
    if (!isAdmin && approvalToken) {
      const baseUrl = appUrlForApproval(`verbundberatung-freigabe`);
      const params = `profile=${encodeURIComponent(created.$id)}&token=${encodeURIComponent(approvalToken)}`;
      const approveUrl = `${baseUrl}?${params}&action=approve`;
      const rejectUrl = `${baseUrl}?${params}&action=reject`;
      await notifyVerbundbueroAdmin(name.trim(), email.trim(), approveUrl, rejectUrl);
    }

    return created;
  }

  return (
    <AuthContext.Provider
      value={{
        user, profile, loading, profileLoading, login, signup, logout, refresh, saveProfile,
        saveVerbundbueroProfile,
        sendVerification, confirmVerification, requestPasswordReset, confirmPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth muss innerhalb von <AuthProvider> verwendet werden.");
  return ctx;
}
