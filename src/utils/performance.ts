// Performance monitoring and optimization utilities
import React from 'react';

export const measurePerformance = (name: string, fn: () => void) => {
  if (typeof window === 'undefined') return fn();
  
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

export const measureAsyncPerformance = async (name: string, fn: () => Promise<any>) => {
  if (typeof window === 'undefined') return fn();
  
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

// Web Vitals monitoring
export const reportWebVitals = (metric: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
  
  // In production, you might want to send this to an analytics service
  // Example: analytics.track('Web Vital', metric);
};

// Lazy loading utility for components
export const createLazyComponent = (importFn: () => Promise<any>) => {
  if (typeof window === 'undefined') {
    // Server-side: return a placeholder or the actual component
    return () => null;
  }
  
  return React.lazy(importFn);
};

// Image preloading utility
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Preload multiple images
export const preloadImages = async (srcs: string[]): Promise<void> => {
  try {
    await Promise.all(srcs.map(preloadImage));
  } catch (error) {
    console.warn('Failed to preload some images:', error);
  }
};

// Resource hints utility
export const addResourceHint = (href: string, rel: 'preload' | 'prefetch' | 'preconnect', as?: string) => {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (as) link.as = as;
  
  document.head.appendChild(link);
};

// Critical resource preloading
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return;
  
  // Preload critical fonts
  addResourceHint('/fonts/inter.woff2', 'preload', 'font');
  
  // Preload critical images
  const criticalImages = [
    '/logos/etiqa-logo.svg',
    '/logos/allianz-logo.svg',
    '/logos/liberty-logo.svg',
  ];
  
  preloadImages(criticalImages);
};

// Bundle size monitoring
export const logBundleSize = () => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
  
  // This would require additional setup to get actual bundle sizes
  console.log('Bundle analysis available with: npm run analyze');
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (typeof window === 'undefined' || !('memory' in performance)) return;
  
  const memory = (performance as any).memory;
  console.log('Memory usage:', {
    used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
    total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
    limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
  });
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
};

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Check connection quality
export const getConnectionQuality = (): 'slow' | 'fast' | 'unknown' => {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return 'unknown';
  }
  
  const connection = (navigator as any).connection;
  
  if (connection.effectiveType === '4g' && connection.downlink > 1.5) {
    return 'fast';
  }
  
  return 'slow';
};

// Adaptive loading based on connection
export const shouldLoadHighQuality = (): boolean => {
  const connectionQuality = getConnectionQuality();
  const prefersReduced = prefersReducedMotion();
  
  return connectionQuality === 'fast' && !prefersReduced;
};

// Performance observer for monitoring
export const startPerformanceObserver = () => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;
  
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          console.log('Navigation timing:', entry);
        } else if (entry.entryType === 'paint') {
          console.log('Paint timing:', entry);
        }
      }
    });
    
    observer.observe({ entryTypes: ['navigation', 'paint'] });
  } catch (error) {
    console.warn('Performance observer not supported:', error);
  }
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  if (process.env.NODE_ENV === 'development') {
    preloadCriticalResources();
    startPerformanceObserver();
    
    // Monitor memory usage every 30 seconds
    setInterval(monitorMemoryUsage, 30000);
  }
};
