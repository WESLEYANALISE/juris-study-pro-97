
import { useCallback, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { calculateNextReview, getNextReviewDate } from "@/utils/spacedRepetition";
import { useToast } from "@/hooks/use-toast";

type FlashcardProgress = {
  id: string;
  flashcard_id: string | number;
  user_id?: string;
  conhecimento: number;
  revisoes: number;
  ultima_revisao: string | null;
  proxima_revisao: string | null;
};

export function useFlashcardProgress() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const getUserProgress = useCallback(async (flashcardId: string | number) => {
    try {
      setIsLoading(true);
      
      // First check if the user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User is not logged in, return default progress
        return {
          conhecimento: 0,
          revisoes: 0,
          ultima_revisao: null,
          proxima_revisao: null
        };
      }
      
      // Fetch user's progress for this flashcard
      const { data, error } = await supabase
        .from('user_flashcards')
        .select('*')
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw error;
      }
      
      return data || {
        conhecimento: 0,
        revisoes: 0,
        ultima_revisao: null,
        proxima_revisao: null
      };
    } catch (error) {
      console.error('Error fetching flashcard progress:', error);
      return {
        conhecimento: 0,
        revisoes: 0,
        ultima_revisao: null,
        proxima_revisao: null
      };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const updateProgress = useCallback(async (flashcardId: string | number, knowledgeLevel: number) => {
    try {
      setIsLoading(true);
      
      // First check if the user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Não foi possível salvar seu progresso",
          description: "Você precisa estar conectado para salvar seu progresso.",
          variant: "destructive"
        });
        return null;
      }
      
      // Fetch current progress
      const { data: existingProgress, error: fetchError } = await supabase
        .from('user_flashcards')
        .select('*')
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId)
        .single();
      
      // Calculate new intervals
      const previousInterval = existingProgress ? 
        ((new Date(existingProgress.proxima_revisao || new Date()) - new Date(existingProgress.ultima_revisao || new Date())) / (1000 * 60 * 60 * 24)) : 0;
      
      const { nextInterval, newConsecutiveCorrect } = calculateNextReview(
        knowledgeLevel,
        Math.floor(previousInterval),
        existingProgress ? existingProgress.revisoes : 0
      );
      
      const nextReviewDate = getNextReviewDate(nextInterval);
      
      if (existingProgress) {
        // Update existing progress
        const { data, error } = await supabase
          .from('user_flashcards')
          .update({
            conhecimento: knowledgeLevel,
            revisoes: newConsecutiveCorrect,
            ultima_revisao: new Date().toISOString(),
            proxima_revisao: nextReviewDate.toISOString()
          })
          .eq('id', existingProgress.id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } else {
        // Create new progress record
        const { data, error } = await supabase
          .from('user_flashcards')
          .insert({
            user_id: user.id,
            flashcard_id: flashcardId,
            conhecimento: knowledgeLevel,
            revisoes: newConsecutiveCorrect,
            ultima_revisao: new Date().toISOString(),
            proxima_revisao: nextReviewDate.toISOString()
          })
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error updating flashcard progress:', error);
      toast({
        title: "Erro ao salvar progresso",
        description: "Ocorreu um erro ao salvar seu progresso.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  return {
    getUserProgress,
    updateProgress,
    isLoading
  };
}
