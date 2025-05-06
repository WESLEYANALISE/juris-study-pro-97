
import React from "react";
import { PeticaoFolder } from "./PeticaoFolder";
import { ContentGrid } from "@/components/ui/content-grid";
import { Peticao } from "@/hooks/usePeticoes";

interface PeticaoFolderGridProps {
  peticoes: Peticao[];
  onFolderClick: (peticao: Peticao) => void;
  className?: string;
}

export function PeticaoFolderGrid({ peticoes, onFolderClick, className }: PeticaoFolderGridProps) {
  if (!peticoes || peticoes.length === 0) {
    return (
      <div className="text-center p-8 bg-card/30 backdrop-blur-sm border border-white/5 rounded-lg">
        <h3 className="text-lg font-semibold">Nenhuma pasta encontrada</h3>
        <p className="text-muted-foreground mt-2">
          Não há pastas de petições disponíveis neste momento.
        </p>
      </div>
    );
  }

  return (
    <ContentGrid 
      columns={{ default: 2, sm: 2, md: 3, lg: 4 }} 
      className={className}
    >
      {peticoes.map((peticao) => (
        <PeticaoFolder
          key={peticao.id}
          area={peticao.area}
          total={peticao.total}
          color={peticao.icon_color}
          onClick={() => onFolderClick(peticao)}
        />
      ))}
    </ContentGrid>
  );
}
