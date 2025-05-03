import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { LivroJuridico, ProgressoLeitura, Marcador, Anotacao } from '@/types/biblioteca-juridica';
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

// Interface for annotations and bookmarks
export function useBibliotecaAnotacoes() {
  const { user } = useAuth();
  const [marcadores, setMarcadores] = useState<Marcador[]>([]);
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Load user's bookmarks and annotations
  const loadAnotacoes = useCallback(async (livroId?: string) => {
    if (!user) {
      setMarcadores([]);
      setAnotacoes([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Load bookmarks
      const bookmarksQuery = supabase
        .from('biblioteca_marcadores')
        .select('*')
        .eq('user_id', user.id);
        
      if (livroId) {
        bookmarksQuery.eq('livro_id', livroId);
      }
      
      const { data: bookmarksData, error: bookmarksError } = await bookmarksQuery;
      
      if (bookmarksError) throw bookmarksError;
      
      // Load annotations
      const annotationsQuery = supabase
        .from('biblioteca_anotacoes')
        .select('*')
        .eq('user_id', user.id);
      
      if (livroId) {
        annotationsQuery.eq('livro_id', livroId);
      }
      
      const { data: annotationsData, error: annotationsError } = await annotationsQuery;
      
      if (annotationsError) throw annotationsError;

      // Handle marcadores
      setMarcadores(bookmarksData || []);
      
      // Handle anotacoes with type conversion for posicao
      if (annotationsData) {
        const typedAnotacoes: Anotacao[] = annotationsData.map(item => {
          // Convert posicao from Json to the expected type structure
          let posicaoObj = item.posicao ? 
            (typeof item.posicao === 'string' ? 
              JSON.parse(item.posicao) : 
              item.posicao) : 
            { x: 0, y: 0 };
              
          // Ensure the object has the required properties
          if (!posicaoObj.x) posicaoObj.x = 0;
          if (!posicaoObj.y) posicaoObj.y = 0;
            
          return {
            id: item.id,
            user_id: item.user_id,
            livro_id: item.livro_id,
            pagina: item.pagina,
            texto: item.texto,
            posicao: posicaoObj,
            cor: item.cor
          };
        });
        
        setAnotacoes(typedAnotacoes);
      } else {
        setAnotacoes([]);
      }
    } catch (error) {
      console.error('Error loading annotations and bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load on component mount and user change
  useEffect(() => {
    loadAnotacoes();
  }, [user, loadAnotacoes]);

  // Add a bookmark
  const addMarcador = async (livroId: string, pagina: number, titulo?: string, cor: string = '#FFEB3B') => {
    if (!user) {
      toast({
        title: "Ação não permitida",
        description: "Faça login para adicionar marcadores.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const newMarcador = {
        user_id: user.id,
        livro_id: livroId,
        pagina,
        titulo: titulo || `Marcador na página ${pagina}`,
        cor
      };
      
      const { data, error } = await supabase
        .from('biblioteca_marcadores')
        .insert(newMarcador)
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        const addedMarcador = data[0] as Marcador;
        setMarcadores(prev => [...prev, addedMarcador]);
        
        toast({
          title: "Marcador adicionado",
          description: `Página ${pagina} marcada com sucesso.`
        });
        
        return addedMarcador;
      }
      return null;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast({
        title: "Erro ao adicionar marcador",
        description: "Não foi possível salvar o marcador.",
        variant: "destructive"
      });
      return null;
    }
  };

  // Remove a bookmark
  const removeMarcador = async (marcadorId: string) => {
    try {
      const { error } = await supabase
        .from('biblioteca_marcadores')
        .delete()
        .eq('id', marcadorId);

      if (error) throw error;
      
      setMarcadores(prev => prev.filter(m => m.id !== marcadorId));
      
      toast({
        title: "Marcador removido"
      });
      
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: "Erro ao remover marcador",
        variant: "destructive"
      });
      return false;
    }
  };

  // Add an annotation
  const addAnotacao = async (
    livroId: string, 
    pagina: number, 
    texto: string,
    posicao?: { x: number; y: number; width?: number; height?: number },
    cor: string = '#E0F7FA'
  ) => {
    if (!user) {
      toast({
        title: "Ação não permitida",
        description: "Faça login para adicionar anotações.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const newAnotacao = {
        user_id: user.id,
        livro_id: livroId,
        pagina,
        texto,
        posicao: posicao || { x: 0, y: 0 },
        cor
      };
      
      const { data, error } = await supabase
        .from('biblioteca_anotacoes')
        .insert(newAnotacao)
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        // Convert the returned data to match our Anotacao type
        const addedAnotacao: Anotacao = {
          id: data[0].id,
          user_id: data[0].user_id,
          livro_id: data[0].livro_id,
          pagina: data[0].pagina,
          texto: data[0].texto,
          posicao: posicao || { x: 0, y: 0 },
          cor: data[0].cor
        };
        
        setAnotacoes(prev => [...prev, addedAnotacao]);
        
        toast({
          title: "Anotação adicionada",
          description: `Anotação adicionada na página ${pagina}.`
        });
        
        return addedAnotacao;
      }
      return null;
    } catch (error) {
      console.error('Error adding annotation:', error);
      toast({
        title: "Erro ao adicionar anotação",
        description: "Não foi possível salvar a anotação.",
        variant: "destructive"
      });
      return null;
    }
  };

  // Update an annotation
  const updateAnotacao = async (anotacaoId: string, texto: string, cor?: string) => {
    try {
      const updateData: {texto: string, cor?: string} = { texto };
      if (cor) updateData.cor = cor;
      
      const { error } = await supabase
        .from('biblioteca_anotacoes')
        .update(updateData)
        .eq('id', anotacaoId);

      if (error) throw error;
      
      setAnotacoes(prev => prev.map(a => {
        if (a.id === anotacaoId) {
          return { ...a, texto, ...(cor ? { cor } : {}) };
        }
        return a;
      }));
      
      toast({
        title: "Anotação atualizada"
      });
      
      return true;
    } catch (error) {
      console.error('Error updating annotation:', error);
      toast({
        title: "Erro ao atualizar anotação",
        variant: "destructive"
      });
      return false;
    }
  };

  // Remove an annotation
  const removeAnotacao = async (anotacaoId: string) => {
    try {
      const { error } = await supabase
        .from('biblioteca_anotacoes')
        .delete()
        .eq('id', anotacaoId);

      if (error) throw error;
      
      setAnotacoes(prev => prev.filter(a => a.id !== anotacaoId));
      
      toast({
        title: "Anotação removida"
      });
      
      return true;
    } catch (error) {
      console.error('Error removing annotation:', error);
      toast({
        title: "Erro ao remover anotação",
        variant: "destructive"
      });
      return false;
    }
  };

  // Get bookmarks for a specific book
  const getMarcadores = (livroId: string) => {
    return marcadores.filter(m => m.livro_id === livroId);
  };

  // Get annotations for a specific book
  const getAnotacoes = (livroId: string) => {
    return anotacoes.filter(a => a.livro_id === livroId);
  };

  // Get bookmarks for a specific page
  const getMarcadoresByPagina = (livroId: string, pagina: number) => {
    return marcadores.filter(m => m.livro_id === livroId && m.pagina === pagina);
  };

  // Get annotations for a specific page
  const getAnotacoesByPagina = (livroId: string, pagina: number) => {
    return anotacoes.filter(a => a.livro_id === livroId && a.pagina === pagina);
  };

  return {
    marcadores,
    anotacoes,
    isLoading,
    addMarcador,
    removeMarcador,
    addAnotacao,
    updateAnotacao,
    removeAnotacao,
    getMarcadores,
    getAnotacoes,
    getMarcadoresByPagina,
    getAnotacoesByPagina,
    refresh: loadAnotacoes
  };
}
