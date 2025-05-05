
import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      // Set the initial value
      checkIfMobile();

      // Add event listener
      window.addEventListener('resize', checkIfMobile);

      // Remove event listener on cleanup
      return () => window.removeEventListener('resize', checkIfMobile);
    }
  }, []);

  return isMobile;
}
