
import React from 'react';
import { Book, BookOpen, Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

interface BibliotecaStyledHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  isMobile?: boolean;
  totalBooks?: number;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export function BibliotecaStyledHeader({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  isMobile = false,
  totalBooks = 0,
  activeTab = 'categorias',
  onTabChange = () => {}
}: BibliotecaStyledHeaderProps) {
  return (
    <motion.div 
      className="bg-background/70 backdrop-blur-xl sticky top-0 z-10 pb-4 pt-2 rounded-lg shadow-sm"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center">
            <div className="bg-amber-400/20 rounded-full p-2 mr-3">
              <BookOpen className="h-6 w-6 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              Biblioteca Jurídica
              {totalBooks > 0 && (
                <span className="text-sm font-normal ml-2 text-muted-foreground hidden sm:inline-block">
                  ({totalBooks} obras)
                </span>
              )}
            </h1>
          </div>
          
          <div className="flex items-center mt-2 sm:mt-0 gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto sm:min-w-[200px] md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar livros..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-background/80 border-white/10 focus:border-amber-400/50 focus:ring-amber-400/20"
              />
            </div>
            
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onViewModeChange('grid')}
                className="rounded-none rounded-l-md"
                aria-label="Visualização em grade"
              >
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                </div>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onViewModeChange('list')}
                className="rounded-none rounded-r-md"
                aria-label="Visualização em lista"
              >
                <div className="flex flex-col gap-0.5 items-start">
                  <div className="w-3.5 h-1 bg-current rounded-sm"></div>
                  <div className="w-3.5 h-1 bg-current rounded-sm"></div>
                  <div className="w-3.5 h-1 bg-current rounded-sm"></div>
                </div>
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full overflow-auto">
          <TabsList className="bg-background/50 p-1">
            <TabsTrigger value="categorias" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-amber-400">
              <Book className="mr-1 h-4 w-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="recentes" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-amber-400">
              Recentes
            </TabsTrigger>
            <TabsTrigger value="favoritos" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-amber-400">
              Favoritos
            </TabsTrigger>
            <TabsTrigger value="todos" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-amber-400">
              Todos
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </motion.div>
  );
}
