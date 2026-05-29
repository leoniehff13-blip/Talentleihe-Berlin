import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AppwriteException, ID, Permission, Query, Role, type Models } from "appwrite";
import {
  account,
  databases,
  DB_LEHRSTELLEN,
  COL_PROFILES,
  type Profile,
} from "./appwrite";

type AuthUser = Models.User<Models.Preferences> | null;

export type ProfileInput = Omit<Profile, keyof Models.Document>;

const DEV_USER = {
  $id: "dev", $createdAt: "", $updatedAt: "",
  name: "Dev User", registration: "", status: true, labels: [],
  passwordUpdate: "", email: "dev@winwin-berlin.de", phone: "",
  emailVerification: false, phoneVerification: false, mfa: false,
  prefs: {}, targets: [], accessedAt: "",
} as unknown as Models.User<Models.Preferences>;

const DEV_PROFILE = {
  $id: "dev-profile", $collectionId: COL_PROFILES,
  $databaseId: DB_LEHRSTELLEN, $createdAt: "", $updatedAt: "", $permissions: [],
  type: "betrieb" as const, user_id: "dev", name: "Win/Win Berlin (Dev)",
  vorname: null, anrede: null, ort: null, adresse: "Musterstraße 1\n10115 Berlin",
  gewerk: "Mehrere Gewerke", handwerkskammer: "HWK Berlin", lehrjahr: null,
  unternehmen: null, berufsschule: null, faehigkeiten: [],
  ansprechpartner: "Entwickler:in", ansprechpartner_email: "dev@winwin-berlin.de",
  spezialisierung: [],
} as Profile;

interface AuthContextValue {
  user: AuthUser;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  devLogin: () => void;
  signup: (name: string, email: string, password: string) => Promise<Models.User<Models.Preferences>>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  saveProfile: (data: ProfileInput) => Promise<Profile>;
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

  async function refresh() {
    if (sessionStorage.getItem("devMode")) {
      setUser(DEV_USER);
      setProfile(DEV_PROFILE);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const u = await account.get();
      setUser(u);
      try {
        const p = await fetchProfileFor(u.$id);
        setProfile(p);
      } catch {
        setProfile(null);
      }
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  function devLogin() {
    sessionStorage.setItem("devMode", "1");
    setUser(DEV_USER);
    setProfile(DEV_PROFILE);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function login(email: string, password: string) {
    try {
      await account.createEmailPasswordSession(email, password);
    } catch (err) {
      // Falls bereits eine aktive Session existiert (z. B. beim Wechsel zwischen
      // Dev-Zugängen), alle Sessions löschen und einen neuen Login starten.
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
    await account.updateVerification(userId, secret);
    await refresh();
  }

  async function requestPasswordReset(email: string) {
    await account.createRecovery(email, appUrl("passwort-neu"));
  }

  async function confirmPasswordReset(userId: string, secret: string, password: string) {
    await account.updateRecovery(userId, secret, password);
  }

  async function logout() {
    const wasDevMode = sessionStorage.getItem("devMode");
    sessionStorage.removeItem("devMode");
    if (wasDevMode) {
      setUser(null);
      setProfile(null);
      return;
    }
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
    // React-State kann nach signup() noch veraltet sein → Appwrite direkt befragen
    let userId = user?.$id;
    if (!userId) {
      const currentUser = await account.get();
      userId = currentUser.$id;
    }
    if (profile) {
      const updated = await databases.updateDocument<Profile>(
        DB_LEHRSTELLEN,
        COL_PROFILES,
        profile.$id,
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
    );
    setProfile(created);
    return created;
  }

  return (
    <AuthContext.Provider
      value={{
        user, profile, loading, login, devLogin, signup, logout, refresh, saveProfile,
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
