
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { LivroJuridico, ProgressoLeitura } from '@/types/biblioteca-juridica';
import { useToast } from '@/hooks/use-toast';

// Hook for handling reading progress
export function useBibliotecaProgresso() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { 
    data: progressData, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['biblioteca-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('biblioteca_leitura_progresso')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        return data as unknown as ProgressoLeitura[];
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
      toast({
        title: "Erro ao salvar progresso",
        description: "Não foi possível atualizar seu progresso de leitura.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const toggleFavorite = async (livroId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para favoritar livros.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const currentProgress = getReadingProgress(livroId);
      const currentStatus = currentProgress?.favorito || false;
      
      const { error } = await supabase
        .from('biblioteca_leitura_progresso')
        .upsert({
          user_id: user.id,
          livro_id: livroId,
          favorito: !currentStatus,
          pagina_atual: currentProgress?.pagina_atual || 1,
          ultima_leitura: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast({
        title: currentStatus ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: currentStatus 
          ? "O livro foi removido dos seus favoritos." 
          : "O livro foi adicionado aos seus favoritos.",
      });
      
      refetch();
      return true;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast({
        title: "Erro ao atualizar favoritos",
        description: "Não foi possível atualizar seu status de favorito.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  return {
    isLoading,
    getReadingProgress,
    isFavorite,
    updateProgress,
    toggleFavorite,
    refetch
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
        return data as unknown as LivroJuridico[];
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
        return data as unknown as ProgressoLeitura[];
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

// Hook for AI-powered book assistance
export function useBookAssistant() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const searchBooks = async (query: string) => {
    if (!query.trim()) return [];
    
    setIsLoading(true);
    try {
      // In a full implementation, this would call an edge function for AI assistance
      // For now, we'll simulate it with a basic search
      const { data, error } = await supabase
        .from('bibliotecatop')
        .select('*');
        
      if (error) throw error;
      
      const results = data.filter(book => 
        book.titulo?.toLowerCase().includes(query.toLowerCase()) ||
        book.descricao?.toLowerCase().includes(query.toLowerCase()) ||
        book.categoria?.toLowerCase().includes(query.toLowerCase())
      );
      
      return results.map(book => ({
        id: book.id.toString(),
        titulo: book.titulo || 'Sem título',
        categoria: book.categoria || 'Geral',
        pdf_url: book.pdf_url || '',
        capa_url: book.capa_url || null,
        descricao: book.descricao || null,
        total_paginas: book.total_paginas ? parseInt(book.total_paginas) : null
      }));
    } catch (err) {
      console.error('Error searching books:', err);
      toast({
        title: "Erro na busca",
        description: "Não foi possível realizar a pesquisa nos livros.",
        variant: "destructive" 
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Future implementation could include more AI features:
  // - getSimilarBooks(bookId: string)
  // - getRecommendationsByConcept(concept: string)
  // - summarizeBook(bookId: string)
  
  return {
    searchBooks,
    isLoading
  };
}
