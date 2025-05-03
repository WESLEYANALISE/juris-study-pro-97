
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
        setProgressos(prev => prev.map(p => {
          if (p.livro_id === livroId) {
            return {
              ...p, 
              pagina_atual: paginaAtual,
              ultima_leitura: new Date().toISOString()
            };
          }
          return p;
        }));
      } else {
        // Create new progress entry
        const newProgress = {
          user_id: user.id,
          livro_id: livroId,
          pagina_atual: paginaAtual,
          ultima_leitura: new Date().toISOString(),
          favorito: false
        };
        
        const { data, error } = await supabase
          .from('biblioteca_leitura_progresso')
          .insert(newProgress)
          .select();

        if (error) throw error;
        
        if (data && data[0]) {
          setProgressos(prev => [...prev, {
            id: data[0].id,
            ...newProgress
          }]);
        }
      }
    } catch (error) {
      console.error('Error updating reading progress:', error);
      toast({
        title: "Erro ao atualizar progresso",
        description: "Não foi possível salvar seu progresso de leitura."
      });
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (livroId: string) => {
    if (!user) {
      toast({
        title: "Ação não permitida",
        description: "Faça login para favoritar livros.",
        variant: "destructive"
      });
      return;
    }

    try {
      const existingProgress = progressos.find(p => p.livro_id === livroId);
      const isFav = existingProgress?.favorito || false;
      
      if (existingProgress) {
        // Update existing record
        const { error } = await supabase
          .from('biblioteca_leitura_progresso')
          .update({
            favorito: !isFav,
            ultima_leitura: new Date().toISOString()
          })
          .eq('id', existingProgress.id);

        if (error) throw error;

        // Update local state
        setProgressos(prev => prev.map(p => {
          if (p.livro_id === livroId) {
            return { ...p, favorito: !isFav };
          }
          return p;
        }));

        // Update favorites list
        if (isFav) {
          setFavoritos(prev => prev.filter(id => id !== livroId));
        } else {
          setFavoritos(prev => [...prev, livroId]);
        }

        toast({
          title: !isFav ? "Livro adicionado aos favoritos" : "Livro removido dos favoritos"
        });
      } else {
        // Create new record with favorite
        const newProgress = {
          user_id: user.id,
          livro_id: livroId,
          pagina_atual: 1,
          ultima_leitura: new Date().toISOString(),
          favorito: true
        };
        
        const { data, error } = await supabase
          .from('biblioteca_leitura_progresso')
          .insert(newProgress)
          .select();

        if (error) throw error;
        
        if (data && data[0]) {
          const newEntry = {
            id: data[0].id,
            ...newProgress
          };
          
          setProgressos(prev => [...prev, newEntry]);
          setFavoritos(prev => [...prev, livroId]);
          
          toast({
            title: "Livro adicionado aos favoritos"
          });
        }
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      toast({
        title: "Erro ao atualizar favoritos",
        description: "Não foi possível atualizar o status do favorito.",
        variant: "destructive"
      });
    }
  };

  // Get reading progress for a book
  const getReadingProgress = (livroId: string) => {
    return progressos.find(p => p.livro_id === livroId) || null;
  };

  // Check if a book is favorited
  const isFavorite = (livroId: string) => {
    return favoritos.includes(livroId);
  };

  // Get all favorite books
  const getFavoritos = () => {
    return progressos.filter(p => p.favorito);
  };

  return {
    progressos,
    isLoading,
    favoritos,
    updateProgress,
    toggleFavorite,
    getReadingProgress,
    isFavorite,
    getFavoritos,
    refresh: loadProgressos
  };
}

// Interface for annotations and bookmarks
export function useBibliotecaAnotacoes() {
  const { user } = useAuth();
  const [marcadores, setMarcadores] = useState<Marcador[]>([]);
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

      setMarcadores(bookmarksData || []);
      setAnotacoes(annotationsData || []);
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
        posicao,
        cor
      };
      
      const { data, error } = await supabase
        .from('biblioteca_anotacoes')
        .insert(newAnotacao)
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        const addedAnotacao = data[0] as Anotacao;
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
