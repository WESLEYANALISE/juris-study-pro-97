
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Search, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

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
  const [focused, setFocused] = useState(false);
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReload} 
          className="flex items-center gap-2 hover:bg-primary/10"
        >
          <ReloadIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Recarregar</span>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className={`relative w-full flex-1 transition-all duration-300 ${focused ? 'ring-1 ring-primary' : ''}`}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className={`h-4 w-4 ${focused ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <input 
            type="search" 
            placeholder="Buscar artigos..." 
            className="pl-10 pr-10 py-2.5 h-10 border rounded-md w-full bg-background/50 backdrop-blur-sm border-input focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none transition-all"
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={handleClearSearch}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="ml-0 sm:ml-2 flex items-center justify-end"
            >
              <Badge variant="outline" className="px-2 py-1 bg-card">
                <span className="text-xs text-muted-foreground mr-1">Pesquisando:</span>
                <span className="text-xs font-medium">{searchQuery}</span>
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VadeMecumHeader;
