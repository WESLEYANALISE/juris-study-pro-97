
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define interfaces for the hook
interface ReadingProgress {
  pagina_atual: number;
  ultima_leitura: Date;
  favorito: boolean;
}

interface BibliotecaProgresso {
  [livroId: string]: ReadingProgress;
}

// Main hook
export function useBibliotecaProgresso() {
  const [progresso, setProgresso] = useState<BibliotecaProgresso>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load reading progress and favorites from local storage or database
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // First try to load from local storage
        const savedProgress = localStorage.getItem('biblioteca-progresso');
        const savedFavorites = localStorage.getItem('biblioteca-favoritos');
        
        if (savedProgress) {
          setProgresso(JSON.parse(savedProgress));
        }
        
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
        
        // Try to load from Supabase if authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Load from database if user is logged in
          const { data: progressData, error: progressError } = await supabase
            .from('biblioteca_leitura_progresso')
            .select('*')
            .eq('user_id', user.id);
          
          if (progressError) {
            console.error('Error loading reading progress:', progressError);
          } else if (progressData) {
            // Map database format to our local format
            const dbProgress: BibliotecaProgresso = {};
            
            progressData.forEach(item => {
              dbProgress[item.livro_id] = {
                pagina_atual: item.pagina_atual,
                ultima_leitura: new Date(item.ultima_leitura),
                favorito: item.favorito || false
              };
            });
            
            // Merge with local storage data (prioritize database)
            setProgresso(prev => ({ ...prev, ...dbProgress }));
            
            // Update favorites
            const dbFavorites = progressData
              .filter(item => item.favorito)
              .map(item => item.livro_id);
              
            if (dbFavorites.length > 0) {
              setFavorites(dbFavorites);
            }
          }
        }
      } catch (error) {
        console.error('Error loading biblioteca progress:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProgress();
  }, []);
  
  // Save progress to local storage whenever it changes
  useEffect(() => {
    if (Object.keys(progresso).length > 0) {
      localStorage.setItem('biblioteca-progresso', JSON.stringify(progresso));
    }
  }, [progresso]);
  
  // Save favorites to local storage
  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem('biblioteca-favoritos', JSON.stringify(favorites));
    }
  }, [favorites]);
  
  // Save reading progress
  const saveReadingProgress = useCallback(async (livroId: string, paginaAtual: number) => {
    try {
      const novoProgresso = {
        ...progresso,
        [livroId]: {
          pagina_atual: paginaAtual,
          ultima_leitura: new Date(),
          favorito: isFavorite(livroId)
        }
      };
      
      setProgresso(novoProgresso);
      
      // Save to database if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('biblioteca_leitura_progresso')
          .upsert({
            user_id: user.id,
            livro_id: livroId,
            pagina_atual: paginaAtual,
            ultima_leitura: new Date().toISOString(),
            favorito: isFavorite(livroId)
          }, {
            onConflict: 'user_id,livro_id'
          });
          
        if (error) {
          console.error('Error saving reading progress:', error);
        }
      }
    } catch (error) {
      console.error('Error saving reading progress:', error);
    }
  }, [progresso]);
  
  // Check if a book is favorited
  const isFavorite = useCallback((livroId: string) => {
    return favorites.includes(livroId);
  }, [favorites]);
  
  // Toggle favorite status
  const toggleFavorite = useCallback(async (livroId: string) => {
    try {
      let novosFavoritos: string[];
      
      if (favorites.includes(livroId)) {
        // Remove from favorites
        novosFavoritos = favorites.filter(id => id !== livroId);
        toast.success('Livro removido dos favoritos');
      } else {
        // Add to favorites
        novosFavoritos = [...favorites, livroId];
        toast.success('Livro adicionado aos favoritos');
      }
      
      setFavorites(novosFavoritos);
      
      // Update progresso object
      if (progresso[livroId]) {
        setProgresso({
          ...progresso,
          [livroId]: {
            ...progresso[livroId],
            favorito: !favorites.includes(livroId)
          }
        });
      } else {
        setProgresso({
          ...progresso,
          [livroId]: {
            pagina_atual: 1,
            ultima_leitura: new Date(),
            favorito: !favorites.includes(livroId)
          }
        });
      }
      
      // Save to database if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('biblioteca_leitura_progresso')
          .upsert({
            user_id: user.id,
            livro_id: livroId,
            pagina_atual: progresso[livroId]?.pagina_atual || 1,
            ultima_leitura: new Date().toISOString(),
            favorito: !favorites.includes(livroId)
          }, {
            onConflict: 'user_id,livro_id'
          });
          
        if (error) {
          console.error('Error updating favorite status:', error);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
    }
  }, [favorites, progresso]);
  
  // Get reading progress for a book
  const getReadingProgress = useCallback((livroId: string): ReadingProgress | null => {
    return progresso[livroId] || null;
  }, [progresso]);
  
  // Get all favorites
  const getFavorites = useCallback(() => {
    return favorites;
  }, [favorites]);
  
  return {
    progresso,
    isLoading,
    saveReadingProgress,
    getReadingProgress,
    isFavorite,
    toggleFavorite,
    getFavorites
  };
}

// Export the interfaces
export type { ReadingProgress, BibliotecaProgresso };
