
import { useState, useEffect } from 'react';

export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Get from session storage by key
      const item = window.sessionStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });
  
  // Return a wrapped version of useState's setter function that 
  // persists the new value to sessionStorage.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Save state
        window.sessionStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.log(error);
      }
    }
  }, [key, storedValue]);
  
  return [storedValue, setStoredValue];
}
