
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FavoriteArticle {
  id: string;
  tableName: string;
  title?: string;
}

export const useVadeMecumFavorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Load favorites from Supabase on initial render when user is authenticated
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      
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
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.error('Erro ao carregar favoritos');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFavorites();
  }, [user]);
  
  // Add a favorite
  const addFavorite = async (article: {
    id: string;
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
      
      // Generate a unique article ID if not provided
      const article_id = `${article.law_name}-${article.article_number}`;
      
      const { data, error } = await supabase
        .from('vademecum_favorites')
        .insert({
          user_id: user.id,
          law_name: article.law_name,
          article_id,
          article_number: article.article_number,
          article_text: article.article_text
        });
        
      if (error) {
        console.error('Error adding favorite:', error);
        toast.error('Erro ao adicionar favorito');
        return false;
      }
      
      // Reload favorites after adding
      const { data: updatedFavorites, error: fetchError } = await supabase
        .from('vademecum_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (fetchError) {
        console.error('Error fetching updated favorites:', fetchError);
      } else {
        setFavorites(updatedFavorites || []);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Erro ao adicionar favorito');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remove a favorite
  const removeFavorite = async (articleId: string, lawName: string) => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('vademecum_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('law_name', lawName)
        .eq('article_id', `${lawName}-${articleId}`);
        
      if (error) {
        console.error('Error removing favorite:', error);
        toast.error('Erro ao remover favorito');
        return false;
      }
      
      // Update local state after removing
      setFavorites(prev => 
        prev.filter(fav => !(fav.article_id === `${lawName}-${articleId}`))
      );
      
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Erro ao remover favorito');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if an article is in favorites
  const isFavorite = (articleNumber: string, lawName: string) => {
    return favorites.some(fav => 
      fav.article_number === articleNumber && 
      fav.law_name === lawName
    );
  };
  
  // Toggle favorite status
  const toggleFavorite = async (article: {
    id: string;
    law_name: string;
    article_number: string;
    article_text: string;
  }) => {
    if (isFavorite(article.article_number, article.law_name)) {
      return await removeFavorite(article.article_number, article.law_name);
    } else {
      return await addFavorite(article);
    }
  };
  
  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    isLoading
  };
};
