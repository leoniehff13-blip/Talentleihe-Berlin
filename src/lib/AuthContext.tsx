import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ID, Permission, Query, Role, type Models } from "appwrite";
import {
  account,
  databases,
  DB_LEHRSTELLEN,
  COL_PROFILES,
  type Profile,
} from "./appwrite";

type AuthUser = Models.User<Models.Preferences> | null;

export type ProfileInput = Omit<Profile, keyof Models.Document>;

interface AuthContextValue {
  user: AuthUser;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<Models.User<Models.Preferences>>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  saveProfile: (data: ProfileInput) => Promise<Profile>;
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

  useEffect(() => {
    refresh();
  }, []);

  async function login(email: string, password: string) {
    await account.createEmailPasswordSession(email, password);
    await refresh();
  }

  async function signup(name: string, email: string, password: string) {
    const created = await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    return created;
  }

  async function logout() {
    try {
      await account.deleteSession("current");
    } finally {
      setUser(null);
      setProfile(null);
    }
  }

  async function saveProfile(data: ProfileInput): Promise<Profile> {
    if (!user) throw new Error("Nicht eingeloggt.");
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
      { ...data, user_id: user.$id },

    );
    setProfile(created);
    return created;
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, login, signup, logout, refresh, saveProfile }}
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
