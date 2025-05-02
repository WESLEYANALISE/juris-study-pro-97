
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BookmarkIcon, SearchIcon, XCircleIcon, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface FavoriteItem {
  id: string;
  law_name: string;
  article_number: string;
  article_text: string;
}

interface VadeMecumFavoritesProps {
  favorites: FavoriteItem[];
  onRemove?: (lawName: string, articleNumber: string) => Promise<boolean>;
}

export const VadeMecumFavorites = ({ favorites, onRemove }: VadeMecumFavoritesProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Group favorites by law
  const groupedFavorites = React.useMemo(() => {
    return favorites.reduce((acc, favorite) => {
      const lawName = favorite.law_name;
      if (!acc[lawName]) {
        acc[lawName] = [];
      }
      acc[lawName].push(favorite);
      return acc;
    }, {} as Record<string, FavoriteItem[]>);
  }, [favorites]);

  // Filter favorites based on search query
  const filteredGroupedFavorites = React.useMemo(() => {
    if (!searchQuery.trim()) return groupedFavorites;

    const result: Record<string, FavoriteItem[]> = {};
    
    Object.entries(groupedFavorites).forEach(([lawName, articles]) => {
      const filteredArticles = articles.filter(
        article => 
          article.article_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
          article.article_text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (filteredArticles.length > 0) {
        result[lawName] = filteredArticles;
      }
    });
    
    return result;
  }, [groupedFavorites, searchQuery]);

  const handleNavigateToLaw = (lawName: string) => {
    navigate(`/vademecum/${lawName}`);
  };

  const handleRemoveFavorite = async (lawName: string, articleNumber: string) => {
    if (onRemove) {
      await onRemove(lawName, articleNumber);
    }
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-3">
        <div className="flex items-center gap-3 mb-4">
          <BookmarkIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Meus Favoritos</h2>
        </div>
        
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar favoritos..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {Object.entries(filteredGroupedFavorites).length === 0 ? (
        searchQuery ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Nenhum favorito encontrado com essa busca.</p>
          </div>
        ) : (
          <div className="text-center py-10">
            <BookmarkIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Você ainda não tem favoritos.</p>
            <p className="text-muted-foreground text-sm mt-2">
              Adicione artigos aos favoritos para acesso rápido.
            </p>
          </div>
        )
      ) : (
        <div className="space-y-8">
          {Object.entries(filteredGroupedFavorites).map(([lawName, items]) => (
            <motion.div 
              key={lawName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <div 
                className="flex items-center gap-2 cursor-pointer hover:text-primary" 
                onClick={() => handleNavigateToLaw(lawName)}
              >
                <BookOpen className="h-4 w-4" />
                <h3 className="font-medium">{lawName.replace(/_/g, ' ')}</h3>
              </div>
              
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={`${item.law_name}-${item.article_number}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-3 hover:bg-muted/30">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">Art. {item.article_number}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {item.article_text}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={() => handleNavigateToLaw(lawName)}
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                          
                          {onRemove && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-destructive hover:text-destructive" 
                              onClick={() => handleRemoveFavorite(item.law_name, item.article_number)}
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VadeMecumFavorites;
