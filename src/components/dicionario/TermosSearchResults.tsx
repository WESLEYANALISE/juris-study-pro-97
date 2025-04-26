
import React from 'react';
import { TermoCard } from './TermoCard';
import { Skeleton } from '@/components/ui/skeleton';

interface DicionarioTermo {
  id: string;
  termo: string;
  definicao: string;
  exemplo_uso: string | null;
  area_direito: string | null;
}

interface TermosSearchResultsProps {
  termos: DicionarioTermo[];
  isLoading: boolean;
  searchTerm: string;
  onTermoView?: (termoId: string) => void;
}

export const TermosSearchResults: React.FC<TermosSearchResultsProps> = ({
  termos,
  isLoading,
  searchTerm,
  onTermoView
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-4">
            <Skeleton className="h-7 w-48 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-4/6 mb-4" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (termos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        {searchTerm ? (
          <>
            <h3 className="text-xl font-medium mb-2">Nenhum termo encontrado</h3>
            <p className="text-muted-foreground">
              Não encontramos resultados para "<span className="font-medium text-foreground">{searchTerm}</span>"
            </p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-medium mb-2">Pesquise termos jurídicos</h3>
            <p className="text-muted-foreground">
              Digite um termo ou área para começar a pesquisar
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {termos.map((termo) => (
        <TermoCard 
          key={termo.id} 
          termo={termo} 
          onView={onTermoView}
        />
      ))}
    </div>
  );
};

import { Search } from 'lucide-react';
