
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { LivroJuridico, ProgressoLeitura } from '@/types/biblioteca-juridica';

// Hook for handling reading progress
export function useBibliotecaProgresso() {
  const { user } = useAuth();
  
  const { data: progressData, isLoading, refetch } = useQuery({
    queryKey: ['biblioteca-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('biblioteca_leitura_progresso')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        return data as ProgressoLeitura[];
      } catch (err) {
        console.error('Error fetching reading progress:', err);
        return [];
      }
    },
    enabled: !!user
  });
  
  const getReadingProgress = (livroId: string) => {
    if (!progressData) return null;
    return progressData.find(p => p.livro_id === livroId) || null;
  };
  
  const isFavorite = (livroId: string) => {
    if (!progressData) return false;
    const progress = progressData.find(p => p.livro_id === livroId);
    return progress ? progress.favorito : false;
  };
  
  const updateProgress = async (livroId: string, pageNumber: number) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('biblioteca_leitura_progresso')
        .upsert({
          user_id: user.id,
          livro_id: livroId,
          pagina_atual: pageNumber,
          ultima_leitura: new Date().toISOString()
        });
        
      if (error) throw error;
      refetch();
      return true;
    } catch (err) {
      console.error('Error updating progress:', err);
      return false;
    }
  };
  
  const toggleFavorite = async (livroId: string) => {
    if (!user) return false;
    
    try {
      const currentStatus = isFavorite(livroId);
      
      const { error } = await supabase
        .from('biblioteca_leitura_progresso')
        .upsert({
          user_id: user.id,
          livro_id: livroId,
          favorito: !currentStatus,
          ultima_leitura: new Date().toISOString()
        });
        
      if (error) throw error;
      refetch();
      return true;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      return false;
    }
  };
  
  return {
    isLoading,
    getReadingProgress,
    isFavorite,
    updateProgress,
    toggleFavorite
  };
}

// Hook for personalized book suggestions
export function useSugestoes() {
  const { user } = useAuth();
  const { getReadingProgress } = useBibliotecaProgresso();
  
  // Fetch all books
  const { data: allBooks } = useQuery({
    queryKey: ['biblioteca-all'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('biblioteca_juridica10')
          .select('*');
          
        if (error) throw error;
        return data as LivroJuridico[];
      } catch (err) {
        console.error('Error fetching books:', err);
        return [];
      }
    }
  });
  
  // Fetch user reading history
  const { data: readingHistory } = useQuery({
    queryKey: ['biblioteca-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('biblioteca_leitura_progresso')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        return data as ProgressoLeitura[];
      } catch (err) {
        console.error('Error fetching reading history:', err);
        return [];
      }
    },
    enabled: !!user
  });
  
  // Generate suggestions based on user's reading history
  const sugestoes = useMemo(() => {
    if (!allBooks || !readingHistory || readingHistory.length === 0) {
      // If no history, return some random books
      return allBooks?.slice(0, 5) || [];
    }
    
    // Get categories of books the user has read
    const readCategories = new Set<string>();
    const readBookIds = new Set<string>();
    
    readingHistory.forEach(history => {
      readBookIds.add(history.livro_id);
      
      const book = allBooks?.find(b => b.id === history.livro_id);
      if (book) {
        readCategories.add(book.categoria);
      }
    });
    
    // Filter books that are in the same categories but haven't been read yet
    const suggestions = allBooks
      ?.filter(book => 
        readCategories.has(book.categoria) && 
        !readBookIds.has(book.id)
      )
      .slice(0, 5) || [];
      
    // If we don't have enough suggestions, add other unread books
    if (suggestions.length < 5 && allBooks) {
      const otherBooks = allBooks
        .filter(book => !readBookIds.has(book.id))
        .slice(0, 5 - suggestions.length);
        
      return [...suggestions, ...otherBooks];
    }
    
    return suggestions;
  }, [allBooks, readingHistory]);
  
  return { sugestoes };
}
