
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useVadeMecumFavorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Load favorites from Supabase
  const loadFavorites = useCallback(async () => {
    if (!user) return [];
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vademecum_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching favorites:', error);
        throw error;
      }
      
      setFavorites(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Erro ao carregar favoritos');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // Load favorites on initial render when user is authenticated
  useEffect(() => {
    loadFavorites();
  }, [user, loadFavorites]);
  
  // Load history
  const loadHistory = useCallback(async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('vademecum_history')
        .select('*')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error loading history:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Erro ao carregar histórico');
      return [];
    }
  }, [user]);
  
  // Remove a favorite
  const removeFavorite = useCallback(async (articleNumber: string, lawName: string) => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('vademecum_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('law_name', lawName)
        .eq('article_number', articleNumber);
        
      if (error) {
        console.error('Error removing favorite:', error);
        toast.error('Erro ao remover favorito');
        return false;
      }
      
      // Update local state after removing
      setFavorites(prev => 
        prev.filter(fav => !(fav.article_number === articleNumber && fav.law_name === lawName))
      );
      
      toast.success('Artigo removido dos favoritos');
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Erro ao remover favorito');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Add a favorite
  const addFavorite = useCallback(async (article: {
    law_name: string;
    article_number: string;
    article_text: string;
  }) => {
    if (!user) {
      toast.error('Você precisa estar logado para adicionar favoritos');
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Generate a unique article ID
      const article_id = `${article.law_name}-${article.article_number}`;
      
      const { error } = await supabase
        .from('vademecum_favorites')
        .insert({
          user_id: user.id,
          law_name: article.law_name,
          article_id,
          article_number: article.article_number,
          article_text: article.article_text
        });
        
      if (error) {
        // Check if it's a unique violation (already favorited)
        if (error.code === '23505') {
          toast.info('Este artigo já está em seus favoritos');
          return true;
        }
        
        console.error('Error adding favorite:', error);
        toast.error('Erro ao adicionar favorito');
        return false;
      }
      
      // Refresh favorites
      loadFavorites();
      
      toast.success('Artigo adicionado aos favoritos');
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Erro ao adicionar favorito');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, loadFavorites]);
  
  return {
    favorites,
    isLoading,
    loadFavorites,
    addFavorite,
    removeFavorite,
    loadHistory
  };
};

export default useVadeMecumFavorites;
