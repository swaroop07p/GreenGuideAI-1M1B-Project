/**
 * GreenGuide AI - API Client Helper
 * 
 * Provides unified endpoint resolution across environments:
 * - Local Dev: VITE_API_BASE_URL is undefined/empty -> calls relative '/api/...' which Vite proxies to http://127.0.0.1:8000
 * - Production (Vercel): VITE_API_BASE_URL is set to the Render backend URL (e.g. 'https://greenguide-backend.onrender.com')
 */

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

/**
 * Returns the fully qualified URL or relative path for a given API endpoint.
 * @param {string} endpoint - Path such as '/api/calculate-footprint'
 * @returns {string}
 */
export function apiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}
