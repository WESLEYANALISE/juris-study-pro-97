
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface AreaGridProps {
  areas: { name: string; count: number }[];
  onSelectArea: (area: string | null) => void;
}

export function AreaGrid({ areas, onSelectArea }: AreaGridProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  
  // Get total book count
  const totalBooks = areas.reduce((sum, area) => sum + area.count, 0);
  
  // Array of background colors for variety
  const bgColors = [
    'from-blue-500/20 to-blue-600/20',
    'from-purple-500/20 to-purple-600/20',
    'from-green-500/20 to-green-600/20',
    'from-amber-500/20 to-amber-600/20',
    'from-red-500/20 to-red-600/20',
    'from-pink-500/20 to-pink-600/20',
    'from-teal-500/20 to-teal-600/20',
    'from-indigo-500/20 to-indigo-600/20',
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Áreas Jurídicas</h2>
        <span className="text-muted-foreground">{totalBooks} livros disponíveis</span>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* All Books Card */}
        <motion.div variants={itemVariants}>
          <Card 
            className="cursor-pointer hover:border-primary transition-all hover:shadow-lg h-full"
            onClick={() => onSelectArea('all')}
          >
            <CardContent className="p-6 h-full flex flex-col">
              <div className="bg-gradient-to-br from-primary/20 to-primary/30 p-4 rounded-lg mb-4 w-16 h-16 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Todos os Livros</h3>
              <p className="text-muted-foreground mt-2">Ver biblioteca completa</p>
              <div className="mt-auto pt-4">
                <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                  {totalBooks} livros
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Area Cards */}
        {areas.map((area, index) => (
          <motion.div key={area.name} variants={itemVariants}>
            <Card 
              className="cursor-pointer hover:border-primary transition-all hover:shadow-lg h-full"
              onClick={() => onSelectArea(area.name)}
            >
              <CardContent className="p-6 h-full flex flex-col">
                <div className={`bg-gradient-to-br ${bgColors[index % bgColors.length]} p-4 rounded-lg mb-4 w-16 h-16 flex items-center justify-center`}>
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold line-clamp-1">{area.name}</h3>
                <p className="text-muted-foreground mt-2 line-clamp-2">
                  Livros e materiais sobre {area.name.toLowerCase()}
                </p>
                <div className="mt-auto pt-4">
                  <span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                    {area.count} {area.count === 1 ? 'livro' : 'livros'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
