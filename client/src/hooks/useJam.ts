import { useEffect } from 'react';
import { identifyJamUser, resetJamUser } from '@/lib/jam';

interface JamUser {
  id: number | string;
  username: string;
  email?: string;
  role?: string;
}

/**
 * Hook que sincroniza el usuario autenticado con Jam.
 * Colócalo en AppContent (ya tiene acceso a useAuth).
 *
 * @example
 * const { user } = useAuth();
 * useJam(user);
 */
export function useJam(user: JamUser | null | undefined): void {
  useEffect(() => {
    if (user) {
      identifyJamUser(user);
    } else {
      resetJamUser();
    }
  }, [user?.id]);
}
