// Firebase has been replaced with MongoDB + Express API
// This file is kept for backward compatibility during migration
// All new code should use the API from @/lib/api

console.warn('Firebase is deprecated. Please use the new API from @/lib/api');

export const firebaseConfig = {};
export const app = null;
export const auth = null;
export const db = null;
export const messaging = null;
export const getToken = () => Promise.resolve('');
export const onMessage = () => {};
