
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useVadeMecumDisplay = () => {
  const [fontSize, setFontSize] = useState(16);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const location = useLocation();

  // Handle scroll events for "Back to Top" button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset font size when navigating to a different law
  useEffect(() => {
    setFontSize(16);
  }, [location.pathname]);

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 32));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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
