'use client';

import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    // Initialize performance monitoring
    const initPerformanceMonitoring = () => {
      // Preload critical resources
      const preloadCriticalResources = () => {
        // Preload critical images
        const criticalImages = [
          '/logos/etiqa-logo.svg',
          '/logos/allianz-logo.svg',
          '/logos/liberty-logo.svg',
        ];
        
        criticalImages.forEach(src => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          document.head.appendChild(link);
        });
      };

      // Monitor memory usage
      const monitorMemoryUsage = () => {
        if (typeof window === 'undefined' || !('memory' in performance)) return;
        
        const memory = (performance as any).memory;
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
        });
      };

      // Start performance observer
      const startPerformanceObserver = () => {
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

      // Initialize all monitoring
      preloadCriticalResources();
      startPerformanceObserver();
      
      // Monitor memory usage every 30 seconds
      const memoryInterval = setInterval(monitorMemoryUsage, 30000);
      
      // Cleanup on unmount
      return () => {
        clearInterval(memoryInterval);
      };
    };

    const cleanup = initPerformanceMonitoring();
    
    return cleanup;
  }, []);

  // This component doesn't render anything
  return null;
}
