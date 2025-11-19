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
