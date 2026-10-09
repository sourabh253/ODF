// Single source of truth for API endpoints.
// Every service (axios) and the Socket.io client must import from here —
// never read import.meta.env.VITE_API_URL directly anywhere else.
//
// VITE_API_URL is set in:
//   - client/.env        (local dev: http://localhost:5000)
//   - Vercel dashboard   (production: https://odf-dvlh.onrender.com)
const fromEnv = import.meta.env.VITE_API_URL;

export const API_URL = String(fromEnv || 'http://localhost:5000').replace(/\/+$/, '');

export default API_URL;
