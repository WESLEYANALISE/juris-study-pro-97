
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useVadeMecumPreferences } from './useVadeMecumPreferences';
import { useAuth } from '@/hooks/use-auth';

export const useVadeMecumDisplay = () => {
  const [fontSize, setLocalFontSize] = useState(16);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const location = useLocation();
  const { user } = useAuth();
  const { fontSize: savedFontSize, setFontSize: saveRemoteFontSize, isLoading } = useVadeMecumPreferences();

  // Set font size from user preferences when available
  useEffect(() => {
    if (!isLoading && savedFontSize) {
      setLocalFontSize(savedFontSize);
      
      // Apply font size to article content
      document.documentElement.style.setProperty('--article-font-size', `${savedFontSize}px`);
    }
  }, [savedFontSize, isLoading]);

  // Handle scroll events for "Back to Top" button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset font size when navigating to a different law only if preferences aren't available
  useEffect(() => {
    if (!user && !savedFontSize) {
      setLocalFontSize(16);
      document.documentElement.style.setProperty('--article-font-size', '16px');
    }
  }, [location.pathname, user, savedFontSize]);

  // Increase font size with boundary check
  const increaseFontSize = useCallback(() => {
    setLocalFontSize(prev => {
      const newSize = Math.min(prev + 1, 32);
      document.documentElement.style.setProperty('--article-font-size', `${newSize}px`);
      
      if (user) {
        saveRemoteFontSize(newSize);
      }
      
      return newSize;
    });
  }, [user, saveRemoteFontSize]);

  // Decrease font size with boundary check
  const decreaseFontSize = useCallback(() => {
    setLocalFontSize(prev => {
      const newSize = Math.max(prev - 1, 12);
      document.documentElement.style.setProperty('--article-font-size', `${newSize}px`);
      
      if (user) {
        saveRemoteFontSize(newSize);
      }
      
      return newSize;
    });
  }, [user, saveRemoteFontSize]);

  // Direct font size setter with validation
  const setFontSize = useCallback((newSize: number) => {
    const validSize = Math.max(12, Math.min(32, newSize));
    setLocalFontSize(validSize);
    document.documentElement.style.setProperty('--article-font-size', `${validSize}px`);
    
    if (user) {
      saveRemoteFontSize(validSize);
    }
  }, [user, saveRemoteFontSize]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  return {
    fontSize,
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    showBackToTop,
    scrollToTop,
    showControls,
    setShowControls
  };
};

export default useVadeMecumDisplay;
