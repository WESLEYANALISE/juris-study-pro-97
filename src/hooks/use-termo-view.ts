
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/use-auth';

export function useTermoView() {
  const [isTracking, setIsTracking] = useState(false);
  const { user } = useAuth();

  const trackView = useCallback(async (termoId: string) => {
    if (isTracking) return;
    
    try {
      setIsTracking(true);
      
      // Record view in database
      await supabase
        .from('dicionario_termo_views')
        .insert({
          termo_id: termoId,
          user_id: user?.id
        });
    } catch (error) {
      console.error('Error tracking view:', error);
    } finally {
      setIsTracking(false);
    }
  }, [isTracking, user?.id]);

  return { trackView };
}
