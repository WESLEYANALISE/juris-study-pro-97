
import React from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, BookMarked } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface BibliotecaHeroSectionProps {
  totalBooks: number;
  inProgressCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function BibliotecaHeroSection({
  totalBooks,
  inProgressCount,
  searchQuery,
  onSearchChange
}: BibliotecaHeroSectionProps) {
  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl -z-10" />
      
      <div className="px-6 py-8 md:py-12 rounded-xl overflow-hidden relative">
        {/* Animated patterns */}
        <div className="absolute top-0 right-0 opacity-10">
          <BookOpen className="h-64 w-64 text-primary" />
        </div>
        
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Biblioteca Jurídica Digital
            </h1>
            <p className="text-lg text-muted-foreground mb-4 md:mb-6">
              Explore nossa coleção completa de obras jurídicas selecionadas para auxiliar em seus estudos
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="outline" className="px-3 py-1 text-sm">
                <BookOpen className="h-4 w-4 mr-2" />
                {totalBooks} {totalBooks === 1 ? 'Livro disponível' : 'Livros disponíveis'}
              </Badge>
              
              {inProgressCount > 0 && (
                <Badge variant="outline" className="px-3 py-1 text-sm">
                  <BookMarked className="h-4 w-4 mr-2" />
                  {inProgressCount} em progresso
                </Badge>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            className="relative mt-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            <Input 
              placeholder="Buscar por título, autor ou categoria..." 
              className="pl-9 w-full md:max-w-md bg-background/90 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
