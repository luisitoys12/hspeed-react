/**
 * Jam SDK integration for hspeed-react
 * Captures bugs with video, console logs, and network requests
 * Recording link: https://recorder.jam.dev/th2ntbe
 */

declare global {
  interface Window {
    jam?: {
      metadata: (data: Record<string, string | number | boolean>) => void;
      identify: (userId: string, traits?: Record<string, string>) => void;
    };
  }
}

/**
 * Initialize Jam SDK — called once on app load
 * API key goes in VITE_JAM_API_KEY env variable
 */
export function initJam(): void {
  const apiKey = import.meta.env.VITE_JAM_API_KEY;

  if (!apiKey) {
    if (import.meta.env.DEV) {
      console.warn('[Jam] VITE_JAM_API_KEY not set — Jam SDK not loaded');
    }
    return;
  }

  // Inject Jam script dynamically
  const script = document.createElement('script');
  script.src = 'https://cdn.jam.dev/jam.js';
  script.setAttribute('data-api-key', apiKey);
  script.async = true;
  document.head.appendChild(script);
}

/**
 * Set user context so every Jam report includes who was logged in
 */
export function identifyJamUser(user: {
  id: number | string;
  username: string;
  email?: string;
  role?: string;
}): void {
  if (!window.jam) return;

  window.jam.identify(String(user.id), {
    username: user.username,
    email: user.email ?? '',
    role: user.role ?? 'user',
  });

  window.jam.metadata({
    userId: String(user.id),
    username: user.username,
    role: user.role ?? 'user',
    app: 'hspeed-react',
    build: import.meta.env.VITE_BUILD_VERSION ?? 'dev',
    env: import.meta.env.MODE,
  });
}

/**
 * Clear user context on logout
 */
export function resetJamUser(): void {
  if (!window.jam) return;
  window.jam.metadata({
    userId: 'anonymous',
    username: 'anonymous',
    role: 'guest',
    app: 'hspeed-react',
    build: import.meta.env.VITE_BUILD_VERSION ?? 'dev',
    env: import.meta.env.MODE,
  });
}
