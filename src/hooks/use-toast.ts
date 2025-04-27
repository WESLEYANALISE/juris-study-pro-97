
import { useState, useEffect, useCallback } from "react";

export type ToastVariant = "default" | "destructive" | "success";

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

export type Toast = ToastProps & {
  id: string;
  visible: boolean;
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    ({ title, description, variant = "default", duration = 5000 }: ToastProps) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { id, title, description, variant, visible: true, duration };
      
      setToasts((prev) => [...prev, newToast]);
      
      if (duration !== Infinity) {
        setTimeout(() => {
          setToasts((prevToasts) =>
            prevToasts.map((t) => (t.id === id ? { ...t, visible: false } : t))
          );
          
          setTimeout(() => {
            setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
          }, 300); // Animation duration
        }, duration);
      }
      
      return id;
    },
    []
  );
  
  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) =>
      prevToasts.map((t) => (t.id === id ? { ...t, visible: false } : t))
    );
    
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 300); // Animation duration
  }, []);

  return {
    toast,
    dismiss,
    toasts,
  };
};

export const toast = (props: ToastProps) => {
  // This is a helper function for use outside of components
  console.log("Toast called:", props);
  // In a real implementation, this would use a global state store 
  // or context to add toasts from outside React components
};
