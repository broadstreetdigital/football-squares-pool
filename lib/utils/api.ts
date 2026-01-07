/**
 * API utilities for client-side requests
 * Handles base path configuration for Webflow Cloud
 */

/**
 * Get the base path for API requests
 * In production on Webflow Cloud, this will be the mount path
 */
export function getBasePath(): string {
  // Next.js provides the base path at build time
  return process.env.NEXT_PUBLIC_BASE_PATH || process.env.BASE_URL || '';
}

/**
 * Create a full API URL with base path
 */
export function apiUrl(path: string): string {
  const basePath = getBasePath();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}
