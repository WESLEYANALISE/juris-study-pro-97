
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X, BookOpen, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface LibraryHeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function LibraryHeader({ onSearch, searchQuery, setSearchQuery }: LibraryHeaderProps) {
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);
  };
  
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b w-full">
      <div className="p-4 flex items-center justify-between">
        {/* Library Title */}
        {!isSearchActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Biblioteca Jurídica</h1>
          </motion.div>
        )}
        
        {/* Search input (expanded on mobile) */}
        <motion.form 
          className={`flex-1 ${isSearchActive ? 'flex' : 'hidden md:flex'} items-center ml-4`}
          onSubmit={handleSearch}
          layout
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Buscar livros por título, área, ou conteúdo..." 
              className="pl-9 pr-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" className="ml-2">Buscar</Button>
        </motion.form>
        
        {/* Mobile search toggle */}
        <div className="md:hidden flex">
          {!isSearchActive ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSearchActive(true)}
              className="ml-auto"
            >
              <Search className="h-5 w-5" />
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSearchActive(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
