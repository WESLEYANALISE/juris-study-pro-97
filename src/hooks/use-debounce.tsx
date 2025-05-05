
import { useState, useEffect } from 'react';

/**
 * Custom hook that delays updating a value until a specified delay has passed
 * Useful for search inputs to prevent too many requests
 * 
 * @param value The value to debounce
 * @param delay Delay time in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear the timer if the value changes before the delay expires
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
