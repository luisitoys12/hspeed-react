
"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  isLoggedIn: boolean;
  isSuperAdmin: boolean;
  role: string;
  approved: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

// UID del Super Administrador principal
const SUPER_ADMIN_UID = "o7VbNn8yGXYjmm3cINgBqjA1Yx12";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const isSuperAdmin = firebaseUser.uid === SUPER_ADMIN_UID;
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        
        onValue(userRef, (snapshot) => {
            const dbUser = snapshot.val();

            if (isSuperAdmin) {
                // Si es el super admin, siempre tiene acceso total
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    isLoggedIn: true,
                    isSuperAdmin: true,
                    role: 'Admin',
                    approved: true,
                });
            } else if (dbUser && dbUser.approved) {
                // Para usuarios normales, verificar si están aprobados
                 setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    isLoggedIn: true,
                    isSuperAdmin: dbUser.role === 'Admin',
                    role: dbUser.role,
                    approved: dbUser.approved,
                });
            } else {
                // Usuario no aprobado o sin registro en la DB
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    isLoggedIn: true,
                    isSuperAdmin: false,
                    role: dbUser?.role || 'pending',
                    approved: dbUser?.approved || false,
                });
            }
             setLoading(false);
        }, { onlyOnce: true }); // Usamos onlyOnce para evitar re-renders innecesarios en cambios de DB

      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
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
