import React from 'react';
import { motion } from 'framer-motion';
import { Search, Grid3X3, List as ListIcon, BookOpen, Filter, Clock, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AtheneumTitle } from '@/components/ui/atheneum-theme';

interface BibliotecaStyledHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  isMobile: boolean;
  totalBooks: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BibliotecaStyledHeader = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  isMobile,
  totalBooks,
  activeTab,
  onTabChange
}: BibliotecaStyledHeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col gap-4">
        {/* Title and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <AtheneumTitle>Biblioteca Jurídica</AtheneumTitle>
            <p className="text-muted-foreground mt-1">
              {totalBooks} {totalBooks === 1 ? 'livro disponível' : 'livros disponíveis'} para consulta
            </p>
          </div>
          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por título, autor..."
              className="pl-9 pr-4"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs and View Mode Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-1">
          <Tabs 
            value={activeTab} 
            onValueChange={onTabChange}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="categorias" className="text-xs sm:text-sm">
                <Filter className="h-4 w-4 mr-1.5 hidden sm:inline" /> Categorias
              </TabsTrigger>
              <TabsTrigger value="recentes" className="text-xs sm:text-sm">
                <Clock className="h-4 w-4 mr-1.5 hidden sm:inline" /> Recentes
              </TabsTrigger>
              <TabsTrigger value="favoritos" className="text-xs sm:text-sm">
                <BookMarked className="h-4 w-4 mr-1.5 hidden sm:inline" /> Favoritos
              </TabsTrigger>
              <TabsTrigger value="todos" className="text-xs sm:text-sm">
                <BookOpen className="h-4 w-4 mr-1.5 hidden sm:inline" /> Todos
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onViewModeChange('grid')}
              className="h-8 w-8"
              title="Visualização em grade"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onViewModeChange('list')}
              className="h-8 w-8"
              title="Visualização em lista"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
