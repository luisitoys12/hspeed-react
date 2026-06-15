import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
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
  createdAt?: string;
  mundialStamps?: string[] | null;
  mundialLogros?: string[] | null;
  mundialClan?: string | null;
  mundialPredictions?: Record<string, { t1: string; t2: string }> | null;
  mundialTickets?: number | null;
  mundialPenalties?: { maxScore: number; totalGames: number } | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isDJ: boolean;
  refetchUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  habboUsername?: string;
  verificationCode?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Auto-login on mount if token exists in localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const res = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            setToken(storedToken);
          } else {
            // Invalid/Expired token
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
          }
        } catch (e) {
          console.error("Error verifying credentials:", e);
          // Keep token in memory but let the app load
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");
    const { token: t, ...userData } = data;
    localStorage.setItem("token", t);
    setToken(t);
    setUser(userData);
  }, []);

  const register = useCallback(async (registerData: RegisterData) => {
    const res = await apiRequest("POST", "/api/auth/register", registerData);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al registrarse");
    const { token: t, ...userData } = data;
    localStorage.setItem("token", t);
    setToken(t);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  }, []);

  const refetchUser = useCallback(async () => {
    const storedToken = localStorage.getItem("token") || token;
    if (storedToken) {
      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (e) {
        console.error("Error refetching user data:", e);
      }
    }
  }, [token]);

  const isAdmin = user?.role === "admin";
  const isDJ = user?.role === "dj" || user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin, isDJ, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
