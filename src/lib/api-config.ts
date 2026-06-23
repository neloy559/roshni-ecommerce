// API Configuration
// API routes are part of the same Next.js app (src/app/api/*)
// No separate backend needed - everything runs on Vercel

export const API_BASE_URL = '';

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - API endpoint path (e.g., '/api/products')
 * @returns Relative path (API routes are on the same domain)
 */
export function getApiUrl(endpoint: string): string {
  // Use relative paths - API routes are part of the same Next.js app
  return endpoint;
}

/**
 * Fetch wrapper that automatically uses the correct API URL
 * @param endpoint - API endpoint path
 * @param options - Fetch options
 */
export async function apiFetch(endpoint: string, options?: RequestInit) {
  const url = getApiUrl(endpoint);
  const response = await fetch(url, options);
  return response;
}
