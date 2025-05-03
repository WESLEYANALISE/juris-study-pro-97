
import { useState, useEffect, useCallback } from 'react';

type ReadingProgress = {
  pagina_atual: number;
  ultima_leitura: string;
  favorito: boolean;
};

export function useBibliotecaProgresso() {
  // We'll use localStorage for simplicity
  // In a production app, this should be synced with a backend
  const [progressData, setProgressData] = useState<
    Record<string, ReadingProgress>
  >({});
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load saved progress and favorites from localStorage on init
  useEffect(() => {
    const savedProgress = localStorage.getItem('biblioteca-progresso');
    const savedFavorites = localStorage.getItem('biblioteca-favoritos');
    
    if (savedProgress) {
      try {
        setProgressData(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Failed to parse reading progress:', error);
      }
    }
    
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to parse favorites:', error);
      }
    }
  }, []);

  // Save reading progress
  const saveReadingProgress = useCallback((bookId: string, pageNumber: number) => {
    setProgressData(prev => {
      const updated = {
        ...prev,
        [bookId]: {
          pagina_atual: pageNumber,
          ultima_leitura: new Date().toISOString(),
          favorito: prev[bookId]?.favorito || false
        }
      };
      
      localStorage.setItem('biblioteca-progresso', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Get reading progress for a specific book
  const getReadingProgress = useCallback((bookId: string): ReadingProgress | null => {
    return progressData[bookId] || null;
  }, [progressData]);

  // Check if a book is favorited
  const isFavorite = useCallback((bookId: string): boolean => {
    return favorites.includes(bookId);
  }, [favorites]);

  // Toggle favorite status for a book
  const toggleFavorite = useCallback((bookId: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(bookId);
      const updated = isFav 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId];
      
      localStorage.setItem('biblioteca-favoritos', JSON.stringify(updated));
      return updated;
    });
    
    // Also update in reading progress
    setProgressData(prev => {
      if (!prev[bookId]) return prev;
      
      const updated = {
        ...prev,
        [bookId]: {
          ...prev[bookId],
          favorito: !isFavorite(bookId)
        }
      };
      
      localStorage.setItem('biblioteca-progresso', JSON.stringify(updated));
      return updated;
    });
  }, [favorites, isFavorite]);
  
  // Get all favorite books
  const getFavoriteBooks = useCallback((): string[] => {
    return favorites;
  }, [favorites]);
  
  // Get last page read across all books
  const getLastReadPage = useCallback((): { bookId: string; page: number } | null => {
    let lastRead: { bookId: string; timestamp: string; page: number } | null = null;
    
    Object.entries(progressData).forEach(([bookId, data]) => {
      if (!lastRead || new Date(data.ultima_leitura) > new Date(lastRead.timestamp)) {
        lastRead = {
          bookId,
          timestamp: data.ultima_leitura,
          page: data.pagina_atual
        };
      }
    });
    
    return lastRead ? { bookId: lastRead.bookId, page: lastRead.page } : null;
  }, [progressData]);
  
  // Reset progress for a book
  const resetProgress = useCallback((bookId: string) => {
    setProgressData(prev => {
      const updated = { ...prev };
      delete updated[bookId];
      
      localStorage.setItem('biblioteca-progresso', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    saveReadingProgress,
    getReadingProgress,
    isFavorite,
    toggleFavorite,
    getFavoriteBooks,
    getLastReadPage,
    resetProgress
  };
}
