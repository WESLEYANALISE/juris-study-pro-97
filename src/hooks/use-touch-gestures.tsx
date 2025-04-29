
import { useState, useEffect } from 'react';

interface TouchState {
  touchStart: { x: number; y: number; distance: number } | null;
  scale: number;
}

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onZoomChange?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
}

export function useTouchGestures(options: TouchGestureOptions) {
  const [touchState, setTouchState] = useState<TouchState>({
    touchStart: null,
    scale: 1,
  });

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      // Handle pinch start
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      setTouchState(prev => ({
        ...prev,
        touchStart: { x: 0, y: 0, distance },
      }));
    } else if (e.touches.length === 1) {
      // Handle swipe start
      setTouchState(prev => ({
        ...prev,
        touchStart: {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          distance: 0,
        },
      }));
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchState.touchStart) return;

    if (e.touches.length === 2 && touchState.touchStart.distance > 0) {
      // Handle pinch
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const scale = (distance / touchState.touchStart.distance) * touchState.scale;
      const boundedScale = Math.min(Math.max(scale, options.minScale || 0.5), options.maxScale || 3);
      
      options.onZoomChange?.(boundedScale);
    } else if (e.touches.length === 1) {
      // Handle swipe
      const deltaX = e.touches[0].clientX - touchState.touchStart.x;
      
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          options.onSwipeRight?.();
        } else {
          options.onSwipeLeft?.();
        }
        
        // Reset touch state after swipe
        setTouchState(prev => ({ ...prev, touchStart: null }));
      }
    }
  };

  const handleTouchEnd = () => {
    setTouchState(prev => ({ ...prev, touchStart: null }));
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchState.touchStart, touchState.scale]);

  return {
    scale: touchState.scale,
    onZoomChange: options.onZoomChange, // Expose onZoomChange from options
  };
}
