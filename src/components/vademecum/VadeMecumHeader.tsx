
import React from 'react';
import { Search, Heart, BookOpen, Volume } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VadeMecumHeaderProps {
  title: string;
  onSearchClick?: () => void;
  onFavoritesClick?: () => void;
  showBackButton?: boolean;
  showSearch?: boolean;
  showFavorites?: boolean;
  showVoice?: boolean;
  searchQuery?: string; // Add searchQuery prop
  setSearchQuery?: React.Dispatch<React.SetStateAction<string>>; // Add setSearchQuery prop
  onReload?: () => Promise<void> | void; // Add onReload prop
}

export function VadeMecumHeader({
  title,
  onSearchClick,
  onFavoritesClick,
  showBackButton = false,
  showSearch = true,
  showFavorites = true,
  showVoice = false,
  searchQuery, // Add to function parameters
  setSearchQuery, // Add to function parameters 
  onReload // Add to function parameters
}: VadeMecumHeaderProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border">
      <div className="flex items-center space-x-2">
        {showBackButton && (
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <BookOpen className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        )}
        <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        {showVoice && (
          <Button variant="ghost" size="icon">
            <Volume className="h-5 w-5" />
          </Button>
        )}
        
        {showSearch && (
          <Button variant="ghost" size="icon" onClick={onSearchClick}>
            <Search className="h-5 w-5" />
          </Button>
        )}
        
        {showFavorites && (
          <Button variant="ghost" size="icon" onClick={onFavoritesClick}>
            <Heart className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
