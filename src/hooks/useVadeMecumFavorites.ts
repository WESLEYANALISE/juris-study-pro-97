
import { useState, useEffect } from 'react';

interface FavoriteArticle {
  id: string;
  tableName: string;
  title?: string;
}

export const useVadeMecumFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteArticle[]>([]);
  
  // Load favorites from localStorage on initial render
  useEffect(() => {
    const storedFavorites = localStorage.getItem('vademecum-favorites');
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (error) {
        console.error('Error parsing favorites from localStorage:', error);
        setFavorites([]);
      }
    }
  }, []);
  
  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('vademecum-favorites', JSON.stringify(favorites));
  }, [favorites]);
  
  // Add a favorite
  const addFavorite = (article: FavoriteArticle) => {
    setFavorites(prev => {
      // Check if already in favorites
      const exists = prev.some(fav => fav.id === article.id && fav.tableName === article.tableName);
      if (exists) return prev;
      return [...prev, article];
    });
  };
  
  // Remove a favorite
  const removeFavorite = (articleId: string, tableName: string) => {
    setFavorites(prev => 
      prev.filter(fav => !(fav.id === articleId && fav.tableName === tableName))
    );
  };
  
  // Check if an article is in favorites
  const isFavorite = (articleId: string, tableName: string) => {
    return favorites.some(fav => fav.id === articleId && fav.tableName === tableName);
  };
  
  // Toggle favorite status
  const toggleFavorite = (article: FavoriteArticle) => {
    if (isFavorite(article.id, article.tableName)) {
      removeFavorite(article.id, article.tableName);
      return false;
    } else {
      addFavorite(article);
      return true;
    }
  };
  
  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite
  };
};
