/**
 * API utilities for client-side requests
 * Handles base path configuration for Webflow Cloud
 */

/**
 * Get the base path for API requests
 * In production on Webflow Cloud, this will be the mount path
 */
export function getBasePath(): string {
  // Check if we're in the browser and can access window
  if (typeof window !== 'undefined') {
    // Try to detect base path from current URL
    const pathname = window.location.pathname;
    // If we're at /football-squares-pool/something, extract /football-squares-pool
    const match = pathname.match(/^(\/[^\/]+)/);
    if (match && match[1] !== '/api' && !pathname.startsWith('/api')) {
      // If the first segment isn't /api and we're not directly on /api routes
      // Check if it looks like a base path (common patterns: /app-name, /v1, etc.)
      const firstSegment = match[1];
      if (firstSegment !== '/register' && firstSegment !== '/login' && firstSegment !== '/dashboard' && firstSegment !== '/pool') {
        return firstSegment;
      }
    }
  }

  // Fallback to environment variable
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
}

/**
 * Create a full API URL with base path
 */
export function apiUrl(path: string): string {
  const basePath = getBasePath();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}
