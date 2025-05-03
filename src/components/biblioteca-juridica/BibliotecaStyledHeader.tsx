
import React from 'react';
import { Book, BookOpen, Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

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
  activeTab = 'all',
  onTabChange = () => {}
}: BibliotecaStyledHeaderProps) {
  return (
    <div className="bg-background/70 backdrop-blur-xl sticky top-0 z-10 pb-4 pt-2">
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
          
          <div className="flex items-center mt-2 sm:mt-0 gap-2">
            <div className="relative w-full sm:w-auto sm:min-w-[200px] md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar livros..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {isMobile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewModeChange('grid')}>
                    Visualização em grade
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewModeChange('list')}>
                    Visualização em lista
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full overflow-auto">
          <TabsList className="bg-background/50 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-amber-400">
              Todas as áreas
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-amber-400">
              Recentes
            </TabsTrigger>
            <TabsTrigger value="favorite" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-amber-400">
              Favoritos
            </TabsTrigger>
            <TabsTrigger value="elite" className="data-[state=active]:bg-amber-400/10 data-[state=active]:text-amber-400">
              Advogado de Elite
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
