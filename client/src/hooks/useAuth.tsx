import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  habboUsername?: string | null;
  avatarUrl?: string | null;
  role: string;
  approved: boolean;
  speedPoints: number;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isDJ: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  habboUsername?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");
    const { token: t, ...userData } = data;
    setToken(t);
    setUser(userData);
  }, []);

  const register = useCallback(async (registerData: RegisterData) => {
    const res = await apiRequest("POST", "/api/auth/register", registerData);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al registrarse");
    const { token: t, ...userData } = data;
    setToken(t);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const isAdmin = user?.role === "admin";
  const isDJ = user?.role === "dj" || user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAdmin, isDJ }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
