
import React from 'react';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Search } from 'lucide-react';

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
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-3">{title}</h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input 
            type="search" 
            placeholder="Buscar artigos..." 
            className="pl-10 pr-4 py-2 border rounded-md w-full bg-background border-input"
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onReload}
          className="sm:self-end"
          title="Recarregar artigos"
        >
          <ReloadIcon className="mr-1 h-3 w-3" />
          Recarregar
        </Button>
      </div>
    </div>
  );
};

export default VadeMecumHeader;
