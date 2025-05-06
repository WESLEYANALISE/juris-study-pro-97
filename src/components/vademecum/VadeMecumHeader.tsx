import React from 'react';
import { Search, Heart, BookOpen, Volume } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fixed by replacing VolumeMedium with Volume which is available in lucide-react

interface VadeMecumHeaderProps {
  title: string;
  onSearchClick?: () => void;
  onFavoritesClick?: () => void;
  showBackButton?: boolean;
  showSearch?: boolean;
  showFavorites?: boolean;
  showVoice?: boolean;
}

export function VadeMecumHeader({
  title,
  onSearchClick,
  onFavoritesClick,
  showBackButton = false,
  showSearch = true,
  showFavorites = true,
  showVoice = false
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
