
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export function useVadeMecumFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load favorites when user changes
  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
      setIsLoading(false);
    }
  }, [user]);
  
  // Load favorites from Supabase
  const loadFavorites = async () => {
    if (!user) return [];
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vademecum_favorites')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setFavorites(data || []);
      return data || [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Erro ao carregar favoritos');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add article to favorites
  const addFavorite = async (article: { 
    law_name: string; 
    article_id: string;
    article_number?: string;
    article_text: string;
  }) => {
    if (!user) {
      toast.error('É necessário estar logado para adicionar favoritos');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('vademecum_favorites')
        .insert({
          user_id: user.id,
          law_name: article.law_name,
          article_id: article.article_id,
          article_number: article.article_number || '',
          article_text: article.article_text
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      setFavorites([...favorites, data]);
      toast.success('Artigo adicionado aos favoritos');
      return data;
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Erro ao adicionar favorito');
      return null;
    }
  };
  
  // Remove article from favorites
  const removeFavorite = async (articleNumber: string, lawName: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('vademecum_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('article_number', articleNumber)
        .eq('law_name', lawName);
      
      if (error) throw error;
      
      // Update favorites state
      setFavorites(favorites.filter(fav => 
        !(fav.article_number === articleNumber && fav.law_name === lawName)
      ));
      
      toast.success('Artigo removido dos favoritos');
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Erro ao remover favorito');
      return false;
    }
  };
  
  // Check if article is favorited
  const isFavorite = (articleNumber: string, lawName: string) => {
    return favorites.some(fav => 
      fav.article_number === articleNumber && fav.law_name === lawName
    );
  };
  
  // Toggle favorite status
  const toggleFavorite = async (article: {
    law_name: string;
    article_id: string;
    article_number?: string;
    article_text: string;
  }) => {
    const isCurrentlyFavorite = article.article_number ? 
      isFavorite(article.article_number, article.law_name) : 
      false;
    
    if (isCurrentlyFavorite) {
      return removeFavorite(article.article_number || '', article.law_name);
    } else {
      return addFavorite(article);
    }
  };
  
  // Load viewing history of articles
  const loadHistory = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('vademecum_history')
        .select('*')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Erro ao carregar histórico');
      return [];
    }
  };
  
  return { 
    favorites, 
    isLoading, 
    loadFavorites, 
    addFavorite, 
    removeFavorite,
    isFavorite,
    toggleFavorite,
    loadHistory
  };
}

export default useVadeMecumFavorites;
