import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ID, type Models } from "appwrite";
import { account } from "./appwrite";

type AuthUser = Models.User<Models.Preferences> | null;

interface AuthContextValue {
  user: AuthUser;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const u = await account.get();
      setUser(u);
    } catch {
      setUser(null);
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
    await account.create(ID.unique(), email, password, name);
    await login(email, password);
  }

  async function logout() {
    try {
      await account.deleteSession("current");
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth muss innerhalb von <AuthProvider> verwendet werden.");
  return ctx;
}
