
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Search, BookOpen, X, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [focused, setFocused] = useState(false);
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 space-y-4"
    >
      <div className="flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            {title}
          </h1>
        </motion.div>
        
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Button 
            variant="glass" 
            size="sm" 
            onClick={onReload} 
            className="flex items-center gap-2 hover:bg-primary/10"
          >
            <ReloadIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </motion.div>
      </div>
      
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center gap-3"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className={cn(
          "relative w-full flex-1 transition-all duration-300 rounded-lg",
          focused ? "ring-2 ring-primary/50 shadow-lg shadow-primary/20" : ""
        )}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className={cn("h-4 w-4", focused ? "text-primary" : "text-muted-foreground")} />
          </div>
          <input 
            type="search" 
            placeholder="Buscar artigos..."
            className={cn(
              "pl-10 pr-10 py-2.5 h-11 rounded-lg w-full",
              "bg-background/50 backdrop-blur-sm border border-primary/20",
              "focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none transition-all"
            )}
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
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
              <Badge variant="outline" className="px-2 py-1.5 bg-card/50 backdrop-blur-sm border border-primary/20">
                <span className="text-xs text-muted-foreground mr-1">Pesquisando:</span>
                <span className="text-xs font-medium">{searchQuery}</span>
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default VadeMecumHeader;
