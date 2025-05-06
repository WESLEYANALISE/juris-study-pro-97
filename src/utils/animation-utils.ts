
import { useEffect, useState } from 'react';

// Performance optimization function to detect low-end devices
export function useReducedMotion(): boolean {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);
    
    // Check for low memory devices or low-end hardware
    const isLowMemoryDevice = 
      // @ts-ignore - deviceMemory is not in the standard TypeScript DOM lib
      navigator.deviceMemory !== undefined && navigator.deviceMemory <= 2 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
    if (isLowMemoryDevice) {
      setShouldReduceMotion(true);
    }
    
    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return shouldReduceMotion;
}

// Optimized animation variants that respect reduced motion
export const createAnimationVariants = (shouldReduceMotion: boolean) => {
  const defaultDuration = shouldReduceMotion ? 0 : 0.3;
  
  return {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1, 
        transition: { duration: defaultDuration } 
      }
    },
    fadeUp: {
      hidden: { 
        opacity: 0, 
        y: shouldReduceMotion ? 0 : 20 
      },
      visible: { 
        opacity: 1, 
        y: 0, 
        transition: { 
          duration: defaultDuration,
          type: "spring",
          stiffness: shouldReduceMotion ? 100 : 400,
          damping: shouldReduceMotion ? 10 : 17 
        } 
      }
    },
    scale: {
      hidden: { 
        opacity: 0, 
        scale: shouldReduceMotion ? 1 : 0.95 
      },
      visible: { 
        opacity: 1, 
        scale: 1, 
        transition: { duration: defaultDuration } 
      }
    },
    // List item stagger animation, optimized
    list: {
      hidden: { opacity: 0 },
      visible: (i: number = 0) => ({
        opacity: 1,
        transition: {
          delay: shouldReduceMotion ? 0 : i * 0.05,
          duration: defaultDuration
        }
      })
    }
  };
};

// Optimized hook to prevent animations from running on page load
export function useDelayedAnimation(delay = 300): boolean {
  const [canAnimate, setCanAnimate] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanAnimate(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return canAnimate;
}

// Debounce function to limit execution frequency (for scroll events, resizing, etc.)
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
