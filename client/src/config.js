// Single source of truth for API endpoints.
// Every service (axios) and the Socket.io client must import from here —
// never read import.meta.env.VITE_API_URL directly anywhere else.
//
// Resolution order:
//   1. VITE_API_URL  — set in client/.env (local) or in the Vercel dashboard
//                      (production build time)
//   2. Fallback      — dev build  -> http://localhost:5000
//                      prod build -> https://odf-dvlh.onrender.com
// The production fallback matters: if the Vercel env var is missing the app
// must still talk to the live backend instead of failing on localhost.
const DEV_API_URL = 'http://localhost:5000';
const PROD_API_URL = 'https://odf-dvlh.onrender.com';

const fromEnv = import.meta.env.VITE_API_URL;
const fallback = import.meta.env.DEV ? DEV_API_URL : PROD_API_URL;

if (!fromEnv && import.meta.env.DEV) {
  console.warn(`[config] VITE_API_URL not set — falling back to ${fallback}`);
}

export const API_URL = String(fromEnv || fallback).replace(/\/+$/, '');

export default API_URL;
