
import React from 'react';
import { FileX, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  filter: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ filter }) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {filter ? (
        <>
          <Search className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum artigo encontrado</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Não foi possível encontrar artigos que correspondam à sua busca.
            Tente usar termos diferentes ou mais amplos.
          </p>
        </>
      ) : (
        <>
          <FileX className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum artigo disponível</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Não há artigos disponíveis para esta lei.
          </p>
        </>
      )}
    </motion.div>
  );
};

