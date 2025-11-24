// Compatibility layer for Firebase migration
// This file provides empty implementations to prevent build errors
// Components using these should be updated to use the new API

export const db = null;
export const auth = null;
export const messaging = null;
export const firebaseConfig = {};

// Empty functions for compatibility
export const getToken = () => Promise.resolve('');
export const onMessage = () => {};
