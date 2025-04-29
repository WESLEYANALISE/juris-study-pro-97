
import { useEffect, useRef, useState } from "react";

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onZoomChange?: (scale: number) => void;
  swipeThreshold?: number;
  elementSelector?: string;
  disabled?: boolean;
}

export function useTouchGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onZoomChange,
  swipeThreshold = 75,
  elementSelector,
  disabled = false
}: TouchGestureOptions) {
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const preventClickRef = useRef<boolean>(false);
  const [scale, setScale] = useState<number>(1);
  
  // Track pinch gesture
  const initialDistanceRef = useRef<number | null>(null);

  useEffect(() => {
    if (disabled) return;

    const targetElement = elementSelector
      ? document.querySelector(elementSelector) || document
      : document;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.changedTouches[0].screenX;
      touchStartYRef.current = e.changedTouches[0].screenY;
      
      // Reset initial distance for zoom
      if (e.touches.length === 2 && onZoomChange) {
        initialDistanceRef.current = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Handle pinch zoom
      if (e.touches.length === 2 && initialDistanceRef.current && onZoomChange) {
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        
        const pinchRatio = currentDistance / initialDistanceRef.current;
        const newScale = Math.max(0.5, Math.min(3, scale * pinchRatio));
        
        if (Math.abs(newScale - scale) > 0.05) {
          setScale(newScale);
          onZoomChange(newScale);
          initialDistanceRef.current = currentDistance; // Update reference point
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartXRef.current === null || touchStartYRef.current === null) {
        return;
      }

      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const xDiff = touchStartXRef.current - touchEndX;
      const yDiff = touchStartYRef.current - touchEndY;

      // Only trigger if the swipe distance is greater than the threshold
      const absXDiff = Math.abs(xDiff);
      const absYDiff = Math.abs(yDiff);

      // Determine if it's a horizontal or vertical swipe
      if (absXDiff > absYDiff) {
        // Horizontal swipe detection
        if (absXDiff > swipeThreshold) {
          preventClickRef.current = true;

          if (xDiff > 0 && onSwipeLeft) {
            // Left swipe
            onSwipeLeft();
          } else if (xDiff < 0 && onSwipeRight) {
            // Right swipe
            onSwipeRight();
          }
        }
      } else {
        // Vertical swipe detection
        if (absYDiff > swipeThreshold) {
          preventClickRef.current = true;

          if (yDiff > 0 && onSwipeUp) {
            // Up swipe
            onSwipeUp();
          } else if (yDiff < 0 && onSwipeDown) {
            // Down swipe
            onSwipeDown();
          }
        }
      }

      // Reset touch coordinates and initial distance
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      initialDistanceRef.current = null;

      // Reset the preventClick flag after a short delay
      setTimeout(() => {
        preventClickRef.current = false;
      }, 300);
    };

    const handleClick = (e: MouseEvent) => {
      if (preventClickRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Add event listeners
    targetElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    targetElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    targetElement.addEventListener('touchend', handleTouchEnd);
    targetElement.addEventListener('click', handleClick, { capture: true });

    // Clean up
    return () => {
      targetElement.removeEventListener('touchstart', handleTouchStart);
      targetElement.removeEventListener('touchmove', handleTouchMove);
      targetElement.removeEventListener('touchend', handleTouchEnd);
      targetElement.removeEventListener('click', handleClick, { capture: true });
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onZoomChange, swipeThreshold, elementSelector, disabled, scale]);

  return { preventClickRef, scale };
}
