"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  _id: string;
  email: string;
  displayName: string;
  isLoggedIn: boolean;
  isSuperAdmin: boolean;
  role: string;
  approved: boolean;
  speedPoints: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.getMe()
        .then((userData: any) => {
          setUser({
            _id: userData._id,
            email: userData.email,
            displayName: userData.displayName,
            isLoggedIn: true,
            isSuperAdmin: userData.role === 'Admin',
            role: userData.role,
            approved: userData.approved,
            speedPoints: userData.speedPoints || 0,
          });
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response: any = await authApi.login({ email, password });
    localStorage.setItem('token', response.token);
    setUser({
      _id: response._id,
      email: response.email,
      displayName: response.displayName,
      isLoggedIn: true,
      isSuperAdmin: response.role === 'Admin',
      role: response.role,
      approved: response.approved,
      speedPoints: response.speedPoints || 0,
    });
  };

  const register = async (email: string, password: string, displayName: string) => {
    const response: any = await authApi.register({ email, password, displayName });
    localStorage.setItem('token', response.token);
    setUser({
      _id: response._id,
      email: response.email,
      displayName: response.displayName,
      isLoggedIn: true,
      isSuperAdmin: response.role === 'Admin',
      role: response.role,
      approved: response.approved,
      speedPoints: response.speedPoints || 0,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
