// API Configuration
// Determines whether to use Railway backend or local API routes

export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'roshni-ecommerce.vercel.app'
    ? 'https://roshni-ecommerce-production.up.railway.app'
    : '');

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - API endpoint path (e.g., '/api/products')
 * @returns Full URL or relative path
 */
export function getApiUrl(endpoint: string): string {
  // If API_BASE_URL is set, use it
  if (API_BASE_URL) {
    return `${API_BASE_URL}${endpoint}`;
  }
  
  // Otherwise, use relative path (for local development)
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
