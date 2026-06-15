import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken, type ApiUser } from "@/lib/api";

type AuthCtx = {
  user: ApiUser | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => void;
  setSession: (token: string, user: ApiUser) => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const setSession = (token: string, u: ApiUser) => {
    setToken(token);
    setUser(u);
  };

  return (
    <Ctx.Provider
      value={{
        user,
        isAdmin: user?.role === "admin",
        loading,
        signOut: () => {
          setToken(null);
          setUser(null);
        },
        setSession,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
};
