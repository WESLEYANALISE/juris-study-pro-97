
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export const useVadeMecumPreferences = () => {
  const { user } = useAuth();
  const [fontSize, setFontSize] = useState(16);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPreferences();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const { data } = await supabase
        .from('user_vademecum_preferences')
        .select('font_size')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setFontSize(data.font_size);
      } else if (user) {
        // Create default preferences for new users
        await supabase
          .from('user_vademecum_preferences')
          .insert({ user_id: user.id, font_size: fontSize });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Erro ao carregar preferências');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFontSize = async (newSize: number) => {
    if (!user) return;

    setFontSize(newSize);
    try {
      await supabase
        .from('user_vademecum_preferences')
        .upsert({
          user_id: user.id,
          font_size: newSize
        });
    } catch (error) {
      console.error('Error updating font size:', error);
      toast.error('Erro ao atualizar tamanho da fonte');
    }
  };

  return {
    fontSize,
    setFontSize: updateFontSize,
    isLoading
  };
};
