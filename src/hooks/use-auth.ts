"use client";

import { useState } from 'react';

// NOTE: This is a mock authentication hook.
// In a real application, you would integrate this with Firebase Auth.
// For example, you might use onAuthStateChanged to get the current user.

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  isLoggedIn: boolean;
}

export function useAuth() {
  const [user] = useState<User | null>({
    uid: 'dev-user-123',
    email: 'dev@example.com',
    displayName: 'Dev User',
    isLoggedIn: true, // Set to true to simulate a logged-in user for development
  });

  const [loading] = useState(false);

  return { user, loading };
}
