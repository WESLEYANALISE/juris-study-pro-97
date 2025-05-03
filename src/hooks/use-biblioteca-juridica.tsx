
import { useState, useEffect, useCallback } from 'react';
import { ProgressoLeitura, Marcador, Anotacao } from '@/types/biblioteca-juridica';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Interface for reading progress
export function useBibliotecaProgresso() {
  const { user } = useAuth();
  const [progressos, setProgressos] = useState<ProgressoLeitura[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favoritos, setFavoritos] = useState<string[]>([]);

  // Load user's reading progress
  const loadProgressos = useCallback(async () => {
    if (!user) {
      setProgressos([]);
      setFavoritos([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('biblioteca_leitura_progresso')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const progressData = data?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        livro_id: item.livro_id,
        pagina_atual: item.pagina_atual || 1,
        ultima_leitura: item.ultima_leitura || new Date().toISOString(),
        favorito: item.favorito || false
      })) || [];

      setProgressos(progressData);
      
      // Set favorites
      const favs = progressData
        .filter(p => p.favorito)
        .map(p => p.livro_id);
      setFavoritos(favs);
    } catch (error) {
      console.error('Error loading reading progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load on component mount and user change
  useEffect(() => {
    loadProgressos();
  }, [user, loadProgressos]);

  // Update reading progress
  const updateProgress = async (livroId: string, paginaAtual: number) => {
    if (!user) {
      console.log('User not authenticated, progress not saved');
      return;
    }

    try {
      // Check if progress already exists
      const existingProgress = progressos.find(p => p.livro_id === livroId);
      
      if (existingProgress) {
        // Update existing progress
        const { error } = await supabase
          .from('biblioteca_leitura_progresso')
          .update({
            pagina_atual: paginaAtual,
            ultima_leitura: new Date().toISOString()
          })
          .eq('id', existingProgress.id);

        if (error) throw error;
        
        // Update local state
        setProgressos(prev => prev.map(p => 
          p.id === existingProgress.id 
            ? { ...p, pagina_atual: paginaAtual, ultima_leitura: new Date().toISOString() }
            : p
        ));
        
      } else {
        // Create new progress
        const newProgress = {
          user_id: user.id,
          livro_id: livroId,
          pagina_atual: paginaAtual,
          ultima_leitura: new Date().toISOString(),
          favorito: false
        };
        
        const { data, error } = await supabase
          .from('biblioteca_leitura_progresso')
          .insert([newProgress])
          .select();

        if (error) throw error;
        
        if (data && data[0]) {
          // Add to local state
          setProgressos(prev => [...prev, { 
            id: data[0].id,
            ...newProgress
          } as ProgressoLeitura]);
        }
      }
      
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Erro ao salvar progresso de leitura');
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (livroId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para favoritar livros');
      return;
    }

    try {
      // Check if progress exists
      const existingProgress = progressos.find(p => p.livro_id === livroId);
      
      if (existingProgress) {
        // Update existing progress
        const newFavoriteStatus = !existingProgress.favorito;
        
        const { error } = await supabase
          .from('biblioteca_leitura_progresso')
          .update({
            favorito: newFavoriteStatus
          })
          .eq('id', existingProgress.id);

        if (error) throw error;
        
        // Update local state
        setProgressos(prev => prev.map(p => 
          p.id === existingProgress.id 
            ? { ...p, favorito: newFavoriteStatus }
            : p
        ));
        
        // Update favorites list
        if (newFavoriteStatus) {
          setFavoritos(prev => [...prev, livroId]);
        } else {
          setFavoritos(prev => prev.filter(id => id !== livroId));
        }
        
      } else {
        // Create new progress with favorite
        const newProgress = {
          user_id: user.id,
          livro_id: livroId,
          pagina_atual: 1,
          ultima_leitura: new Date().toISOString(),
          favorito: true
        };
        
        const { data, error } = await supabase
          .from('biblioteca_leitura_progresso')
          .insert([newProgress])
          .select();

        if (error) throw error;
        
        if (data && data[0]) {
          // Add to local state
          setProgressos(prev => [...prev, { 
            id: data[0].id,
            ...newProgress
          } as ProgressoLeitura]);
          
          // Add to favorites
          setFavoritos(prev => [...prev, livroId]);
        }
      }
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erro ao atualizar favoritos');
    }
  };

  // Check if book is favorite
  const isFavorite = (livroId: string): boolean => {
    return favoritos.includes(livroId);
  };

  // Get reading progress for a book
  const getReadingProgress = (livroId: string): ProgressoLeitura | null => {
    const progress = progressos.find(p => p.livro_id === livroId);
    return progress || null;
  };
  
  // Get favorite books - adding this function to resolve the error
  const getFavoriteBooks = (): string[] => {
    return favoritos;
  };
  
  // For manual refetch
  const refetch = async () => {
    await loadProgressos();
  };

  return {
    isLoading,
    getReadingProgress,
    isFavorite,
    updateProgress,
    toggleFavorite,
    getFavoriteBooks, // Export the new function
    refetch,
  };
}
