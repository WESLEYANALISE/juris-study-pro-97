
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
    if (user) {
      loadFavorites();
    }
  }, [user, loadFavorites]);
  
  // Check if an article is favorited
  const isFavorite = useCallback((lawName: string, articleId: string, articleNumber: string, articleText: string) => {
    return favorites.some(fav => 
      (fav.article_id === articleId && fav.law_name === lawName) || 
      (fav.article_number === articleNumber && fav.law_name === lawName && fav.article_text === articleText)
    );
  }, [favorites]);

  // Add article to favorites
  const addFavorite = useCallback(async (article: {
    law_name: string;
    article_id: string;
    article_number: string;
    article_text: string;
  }) => {
    if (!user) {
      toast.error('Você precisa estar logado para adicionar favoritos');
      return false;
    }

    try {
      const { error } = await supabase
        .from('vademecum_favorites')
        .insert({
          user_id: user.id,
          law_name: article.law_name,
          article_id: article.article_id,
          article_number: article.article_number,
          article_text: article.article_text
        });

      if (error) throw error;
      
      await loadFavorites();
      toast.success('Artigo adicionado aos favoritos');
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Erro ao adicionar favorito');
      return false;
    }
  }, [user, loadFavorites]);

  // Remove article from favorites
  const removeFavorite = useCallback(async (articleNumber: string, lawName: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('vademecum_favorites')
        .delete()
        .match({ 
          user_id: user.id,
          article_number: articleNumber,
          law_name: lawName
        });

      if (error) throw error;
      
      await loadFavorites();
      toast.success('Artigo removido dos favoritos');
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Erro ao remover favorito');
      return false;
    }
  }, [user, loadFavorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback((lawName: string, articleId: string, articleNumber: string, articleText: string) => {
    const isFav = isFavorite(lawName, articleId, articleNumber, articleText);
    
    if (isFav) {
      removeFavorite(articleNumber, lawName);
    } else {
      addFavorite({
        law_name: lawName,
        article_id: articleId,
        article_number: articleNumber,
        article_text: articleText
      });
    }
  }, [isFavorite, removeFavorite, addFavorite]);
  
  // Load history
  const loadHistory = useCallback(async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('vademecum_history')
        .select('*')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  }, [user]);

  return {
    favorites,
    isLoading,
    loadFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    loadHistory
  };
};

export default useVadeMecumFavorites;
