
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Grid2x2, List, Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BibliotecaHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  isMobile?: boolean;
  totalBooks?: number;
  categoriesCount?: number;
}

export function BibliotecaHeader({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  isMobile = false,
  totalBooks = 0,
  categoriesCount = 0
}: BibliotecaHeaderProps) {
  return (
    <div className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <BookOpen className="mr-2 h-7 w-7 text-primary" /> 
          Biblioteca Jurídica
          {totalBooks > 0 && (
            <span className="text-sm font-normal ml-2 text-muted-foreground">
              ({totalBooks} obras em {categoriesCount} categorias)
            </span>
          )}
        </h1>
        <p className="text-muted-foreground mt-1">
          Explore nossa coleção de obras jurídicas
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-[200px] sm:min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar livros..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
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
                <Grid2x2 className="mr-2 h-4 w-4" />
                <span>Visualização em grade</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewModeChange('list')}>
                <List className="mr-2 h-4 w-4" />
                <span>Visualização em lista</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onViewModeChange('grid')}
              className="rounded-none rounded-l-md"
              aria-label="Visualização em grade"
            >
              <Grid2x2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onViewModeChange('list')}
              className="rounded-none rounded-r-md"
              aria-label="Visualização em lista"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
