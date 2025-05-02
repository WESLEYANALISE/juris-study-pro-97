
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Grid2x2, List, Search } from 'lucide-react';

interface BibliotecaHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
}

export function BibliotecaHeader({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange
}: BibliotecaHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Biblioteca Jurídica</h1>
        <p className="text-muted-foreground mt-1">
          Explore nossa coleção de obras jurídicas
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1 md:min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar livros..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
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
      </div>
    </div>
  );
}
