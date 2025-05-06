
import React from 'react';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Search, BookOpen, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VadeMecumHeaderProps {
  title: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onReload: () => void;
}

export const VadeMecumHeader = ({
  title,
  searchQuery,
  setSearchQuery,
  onReload
}: VadeMecumHeaderProps) => {
  const [focused, setFocused] = React.useState(false);
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReload} 
          className="flex items-center gap-2 hover:bg-primary/10"
        >
          <ReloadIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Atualizar</span>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className={cn(
          "relative w-full flex-1 transition-all duration-200",
          focused ? "ring-2 ring-primary/50 shadow-sm" : ""
        )}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className={cn("h-4 w-4", focused ? "text-primary" : "text-muted-foreground")} />
          </div>
          <input 
            type="search" 
            placeholder="Buscar artigos..."
            className={cn(
              "pl-10 pr-10 py-2 h-10 rounded-lg w-full",
              "bg-background/50 border border-primary/20",
              "focus-visible:ring-1 focus-visible:outline-none"
            )}
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {searchQuery && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={handleClearSearch}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
        
        {searchQuery && (
          <div className="ml-0 sm:ml-2 flex items-center justify-end">
            <Badge variant="outline" className="px-2 py-1.5 bg-card/50 border border-primary/20">
              <span className="text-xs text-muted-foreground mr-1">Pesquisando:</span>
              <span className="text-xs font-medium">{searchQuery}</span>
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default VadeMecumHeader;
