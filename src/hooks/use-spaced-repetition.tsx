
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateNextReview, getNextReviewDate } from '@/utils/spacedRepetition';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface StudyItem {
  id: string;
  content_id: string;
  content_type: 'flashcard' | 'book_section' | 'legal_article';
  interval_days: number;
  consecutive_correct: number;
  next_review_date: string;
  last_reviewed_at?: string;
  created_at: string;
}

interface UseSpacedRepetitionOptions {
  contentType?: 'flashcard' | 'book_section' | 'legal_article';
}

export function useSpacedRepetition(options: UseSpacedRepetitionOptions = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dueItems, setDueItems] = useState<StudyItem[]>([]);

  // Get study items from database
  const { data: studyItems, isLoading, refetch } = useQuery({
    queryKey: ['spaced-repetition', user?.id, options.contentType],
    queryFn: async () => {
      if (!user) return [];
      
      const query = supabase
        .from('estudo_repetido')
        .select('*')
        .eq('user_id', user.id)
        .order('next_review_date', { ascending: true });
      
      if (options.contentType) {
        query.eq('content_type', options.contentType);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching study items:', error);
        toast({
          title: 'Erro ao carregar itens de estudo',
          description: 'Não foi possível buscar seus itens de estudo.',
          variant: 'destructive'
        });
        return [];
      }
      
      return data as StudyItem[];
    },
    enabled: !!user
  });

  // Update study item after review
  const updateStudyItem = useMutation({
    mutationFn: async ({ 
      itemId, 
      knowledgeLevel 
    }: { 
      itemId: string; 
      knowledgeLevel: number;
    }) => {
      if (!user) return null;
      
      // Find the current item
      const currentItem = studyItems?.find(item => item.id === itemId);
      if (!currentItem) throw new Error('Item not found');
      
      // Calculate next interval using spaced repetition algorithm
      const { nextInterval, newConsecutiveCorrect } = calculateNextReview(
        knowledgeLevel,
        currentItem.interval_days,
        currentItem.consecutive_correct
      );
      
      // Calculate the next review date
      const nextReviewDate = getNextReviewDate(nextInterval);
      
      // Update the item in database
      const { error } = await supabase
        .from('estudo_repetido')
        .update({
          interval_days: nextInterval,
          consecutive_correct: newConsecutiveCorrect,
          next_review_date: nextReviewDate.toISOString(),
          last_reviewed_at: new Date().toISOString()
        })
        .eq('id', itemId);
      
      if (error) {
        console.error('Error updating study item:', error);
        throw error;
      }
      
      return {
        itemId,
        nextReviewDate,
        nextInterval,
        newConsecutiveCorrect
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['spaced-repetition', user?.id, options.contentType]
      });
      
      toast({
        title: 'Progresso atualizado',
        description: 'Seu progresso de estudo foi atualizado.',
      });
    },
    onError: (error) => {
      console.error('Error in updateStudyItem mutation:', error);
      toast({
        title: 'Erro ao atualizar progresso',
        description: 'Não foi possível atualizar seu progresso de estudo.',
        variant: 'destructive'
      });
    }
  });

  // Add new item to study
  const addStudyItem = useMutation({
    mutationFn: async ({ 
      contentId, 
      contentType 
    }: { 
      contentId: string; 
      contentType: 'flashcard' | 'book_section' | 'legal_article';
    }) => {
      if (!user) return null;
      
      // Check if item already exists
      const { data: existingItems } = await supabase
        .from('estudo_repetido')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .eq('content_type', contentType);
      
      if (existingItems && existingItems.length > 0) {
        return { id: existingItems[0].id, alreadyExists: true };
      }
      
      // Add new item
      const newItem = {
        user_id: user.id,
        content_id: contentId,
        content_type: contentType,
        interval_days: 1, // Start with 1 day interval
        consecutive_correct: 0,
        next_review_date: new Date().toISOString() // Due today
      };
      
      const { data, error } = await supabase
        .from('estudo_repetido')
        .insert(newItem)
        .select('id')
        .single();
      
      if (error) {
        console.error('Error adding study item:', error);
        throw error;
      }
      
      return { id: data.id, alreadyExists: false };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['spaced-repetition', user?.id, options.contentType]
      });
      
      if (result?.alreadyExists) {
        toast({
          title: 'Item já existe',
          description: 'Este item já está em sua lista de estudo.',
        });
      } else {
        toast({
          title: 'Item adicionado',
          description: 'Item adicionado à sua lista de estudo com sucesso.',
        });
      }
    },
    onError: (error) => {
      console.error('Error in addStudyItem mutation:', error);
      toast({
        title: 'Erro ao adicionar item',
        description: 'Não foi possível adicionar o item à sua lista de estudo.',
        variant: 'destructive'
      });
    }
  });

  // Remove item from study list
  const removeStudyItem = useMutation({
    mutationFn: async (itemId: string) => {
      if (!user) return null;
      
      const { error } = await supabase
        .from('estudo_repetido')
        .delete()
        .eq('id', itemId);
      
      if (error) {
        console.error('Error removing study item:', error);
        throw error;
      }
      
      return itemId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['spaced-repetition', user?.id, options.contentType]
      });
      
      toast({
        title: 'Item removido',
        description: 'Item removido da sua lista de estudo.',
      });
    },
    onError: (error) => {
      console.error('Error in removeStudyItem mutation:', error);
      toast({
        title: 'Erro ao remover item',
        description: 'Não foi possível remover o item da sua lista de estudo.',
        variant: 'destructive'
      });
    }
  });

  // Filter items that are due for review
  useEffect(() => {
    if (studyItems) {
      const now = new Date();
      const due = studyItems.filter(item => {
        const reviewDate = new Date(item.next_review_date);
        return reviewDate <= now;
      });
      setDueItems(due);
    }
  }, [studyItems]);

  return {
    studyItems,
    dueItems,
    isLoading,
    updateStudyItem,
    addStudyItem,
    removeStudyItem,
    refresh: refetch
  };
}
