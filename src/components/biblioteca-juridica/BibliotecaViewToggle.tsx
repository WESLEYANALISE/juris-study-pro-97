
import React from 'react';
import { Grid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BibliotecaViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  totalBooks?: number;
}

export function BibliotecaViewToggle({ 
  view, 
  onViewChange,
  totalBooks 
}: BibliotecaViewToggleProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm text-muted-foreground">
        {totalBooks !== undefined && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center"
          >
            <span className="font-medium text-primary mr-1">{totalBooks}</span> 
            livros na biblioteca
          </motion.div>
        )}
      </div>
      
      <div className="flex items-center space-x-2 bg-muted/30 p-1 rounded-md shadow-sm">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            view === 'grid' ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onViewChange('grid')}
          aria-label="Visualização em grade"
        >
          <Grid className="h-4 w-4" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            view === 'list' ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onViewChange('list')}
          aria-label="Visualização em lista"
        >
          <List className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}
