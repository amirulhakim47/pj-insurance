import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Prefixes a path with the repository name in production if configured.
 * This is useful for GitHub Pages deployments where the site is served from a subdirectory.
 * 
 * @param path The path to prefix (e.g., '/images/logo.png')
 * @returns The prefixed path (e.g., '/repo-name/images/logo.png')
 */
export function prefixPath(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_REPO_NAME || '';
  
  // If no base path or we're in development, return path as is
  if (!basePath || process.env.NODE_ENV !== 'production') {
    return path;
  }

  // Remove leading slash if both basePath has trailing slash and path has leading slash
  // But usually basePath shouldn't have trailing slash.
  // Let's assume basePath starts with / and doesn't end with /
  
  // Ensure path starts with / if it doesn't
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${basePath}${cleanPath}`;
}

/**
 * Gets the base path for the application based on environment.
 * For GitHub Pages, this returns '/pj-insurance' in production.
 * 
 * @returns The base path string
 */
export function getBasePath(): string {
  // In production on GitHub Pages, we need the base path
  if (typeof window !== 'undefined') {
    // Client-side: use the actual pathname base
    const pathname = window.location.pathname;
    if (pathname.startsWith('/pj-insurance')) {
      return '/pj-insurance';
    }
  }
  // Server-side or local dev
  return process.env.NODE_ENV === 'production' ? '/pj-insurance' : '';
}

/**
 * Gets the full href for Next.js Link components with proper base path.
 * Use this for all internal navigation links.
 * 
 * @param path The path to navigate to (e.g., '/quote')
 * @returns The full href with base path (e.g., '/pj-insurance/quote')
 */
export function getHref(path: string): string {
  const basePath = getBasePath();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return basePath ? `${basePath}${cleanPath}` : cleanPath;
}
