
import React from 'react';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';

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
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="relative w-full sm:max-w-md">
          <input 
            type="search" 
            placeholder="Buscar artigos..." 
            className="px-4 py-2 border rounded-md w-full bg-background border-input" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
        </div>
        <Button 
          onClick={onReload} 
          variant="outline" 
          className="gap-2"
        >
          <ReloadIcon className="h-4 w-4" />
          Recarregar
        </Button>
      </div>
    </div>
  );
};

export default VadeMecumHeader;
