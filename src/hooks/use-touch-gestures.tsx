
import { useState, useEffect, useCallback } from 'react';

interface TouchState {
  touchStart: { x: number; y: number; distance: number } | null;
  scale: number;
  lastTap: number;
  tapCount: number;
  pinching: boolean;
}

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onZoomChange?: (scale: number) => void;
  onDoubleTap?: (position: { x: number; y: number }) => void;
  minScale?: number;
  maxScale?: number;
  usePreventDefault?: boolean;
  swipeThreshold?: number;
  doubleTapThreshold?: number;
}

export function useTouchGestures(options: TouchGestureOptions) {
  const {
    minScale = 0.5,
    maxScale = 3,
    swipeThreshold = 50,
    doubleTapThreshold = 300,
    usePreventDefault = false
  } = options;

  const [touchState, setTouchState] = useState<TouchState>({
    touchStart: null,
    scale: 1,
    lastTap: 0,
    tapCount: 0,
    pinching: false,
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (usePreventDefault) {
      e.preventDefault();
    }
    
    const now = Date.now();
    const timeSinceLastTap = now - touchState.lastTap;
    let newTapCount = touchState.tapCount;
    
    // Handle double tap detection
    if (timeSinceLastTap < doubleTapThreshold) {
      newTapCount += 1;
      if (newTapCount === 2 && options.onDoubleTap && e.touches.length === 1) {
        options.onDoubleTap({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        });
        newTapCount = 0;
      }
    } else {
      newTapCount = 1;
    }
    
    if (e.touches.length === 2) {
      // Handle pinch start
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      setTouchState(prev => ({
        ...prev,
        touchStart: { x: 0, y: 0, distance },
        pinching: true,
        lastTap: now,
        tapCount: newTapCount
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
        pinching: false,
        lastTap: now,
        tapCount: newTapCount
      }));
    }
  }, [touchState.lastTap, touchState.tapCount, options, doubleTapThreshold, usePreventDefault]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (usePreventDefault) {
      e.preventDefault();
    }
    
    if (!touchState.touchStart) return;

    if (e.touches.length === 2 && touchState.touchStart.distance > 0) {
      // Handle pinch
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const scale = (distance / touchState.touchStart.distance) * touchState.scale;
      const boundedScale = Math.min(Math.max(scale, minScale), maxScale);
      
      if (options.onZoomChange) {
        options.onZoomChange(boundedScale);
      }

      // Update scale in state
      setTouchState(prev => ({ ...prev, scale: boundedScale }));
    } else if (e.touches.length === 1 && !touchState.pinching) {
      // Handle swipe
      const deltaX = e.touches[0].clientX - touchState.touchStart.x;
      
      if (Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0) {
          options.onSwipeRight?.();
        } else {
          options.onSwipeLeft?.();
        }
        
        // Reset touch state after swipe
        setTouchState(prev => ({ ...prev, touchStart: null }));
      }
    }
  }, [touchState, options, minScale, maxScale, swipeThreshold, usePreventDefault]);

  const handleTouchEnd = useCallback(() => {
    setTouchState(prev => ({ 
      ...prev, 
      touchStart: null,
      pinching: false
    }));
  }, []);

  useEffect(() => {
    const passiveOptions = usePreventDefault ? { passive: false } : { passive: true };
    document.addEventListener('touchstart', handleTouchStart, passiveOptions);
    document.addEventListener('touchmove', handleTouchMove, passiveOptions);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, usePreventDefault]);

  return {
    scale: touchState.scale,
    onZoomChange: options.onZoomChange,
    reset: () => setTouchState({
      touchStart: null,
      scale: 1,
      lastTap: 0,
      tapCount: 0,
      pinching: false
    })
  };
}
