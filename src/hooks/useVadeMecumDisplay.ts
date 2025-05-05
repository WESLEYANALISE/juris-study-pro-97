
import { useState, useEffect } from 'react';
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
    }
  }, [location.pathname, user, savedFontSize]);

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 32);
    setLocalFontSize(newSize);
    if (user) {
      saveRemoteFontSize(newSize);
    }
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 12);
    setLocalFontSize(newSize);
    if (user) {
      saveRemoteFontSize(newSize);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return {
    fontSize,
    setFontSize: setLocalFontSize,
    increaseFontSize,
    decreaseFontSize,
    showBackToTop,
    scrollToTop,
    showControls,
    setShowControls
  };
};

export default useVadeMecumDisplay;
