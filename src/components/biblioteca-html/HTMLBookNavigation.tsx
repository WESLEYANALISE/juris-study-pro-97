
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HTMLBookNavigationProps {
  secoes: { id: string; titulo: string }[];
  secaoAtual: string;
  onChangeSection: (secaoId: string) => void;
}

export function HTMLBookNavigation({ secoes, secaoAtual, onChangeSection }: HTMLBookNavigationProps) {
  // Encontrar o índice da seção atual
  const secaoAtualIndex = secoes.findIndex(s => s.id === secaoAtual);
  
  // Ir para a próxima seção
  const handleNextSection = () => {
    if (secaoAtualIndex < secoes.length - 1) {
      onChangeSection(secoes[secaoAtualIndex + 1].id);
    }
  };
  
  // Ir para a seção anterior
  const handlePrevSection = () => {
    if (secaoAtualIndex > 0) {
      onChangeSection(secoes[secaoAtualIndex - 1].id);
    }
  };

  return (
    <div className="px-4 py-2 border-b flex items-center justify-between w-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrevSection}
        disabled={secaoAtualIndex <= 0}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Anterior
      </Button>
      
      <div className="text-sm font-medium truncate px-2 max-w-xs">
        {secoes[secaoAtualIndex]?.titulo || 'Carregando...'}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNextSection}
        disabled={secaoAtualIndex >= secoes.length - 1}
      >
        Próximo
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
