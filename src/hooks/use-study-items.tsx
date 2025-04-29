
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { StudyItem } from '@/types/study';

interface UseStudyItemsOptions {
  contentType?: 'flashcard' | 'book_section' | 'legal_article';
}

export function useStudyItems(options: UseStudyItemsOptions = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dueItems, setDueItems] = useState<StudyItem[]>([]);

  // Get study items from database
  const { data: studyItems, isLoading, refetch } = useQuery({
    queryKey: ['spaced-repetition', user?.id, options.contentType],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        let query = supabase
          .from('estudo_repetido')
          .select('*')
          .eq('user_id', user.id)
          .order('next_review_date', { ascending: true });
        
        if (options.contentType) {
          query = query.eq('content_type', options.contentType);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Filter items that are due for review
        const now = new Date();
        const due = (data as StudyItem[]).filter(item => {
          const reviewDate = new Date(item.next_review_date);
          return reviewDate <= now;
        });
        setDueItems(due);
        
        return data as StudyItem[];
      } catch (error) {
        console.error('Error fetching study items:', error);
        toast({
          title: 'Erro ao carregar itens de estudo',
          description: 'Não foi possível buscar seus itens de estudo.',
          variant: 'destructive'
        });
        return [];
      }
    },
    enabled: !!user
  });

  return {
    studyItems,
    dueItems,
    isLoading,
    refresh: refetch
  };
}
