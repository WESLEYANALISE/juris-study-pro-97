
import React from 'react';
import { motion } from 'framer-motion';
import { Book, BookOpen, FileText, Scale, Gavel, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BibliotecaCategoryGridProps {
  categories: string[];
  bookCounts: Record<string, number>;
  onSelectCategory: (category: string) => void;
}

export function BibliotecaCategoryGrid({
  categories,
  bookCounts,
  onSelectCategory
}: BibliotecaCategoryGridProps) {
  // Map categories to icons
  const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    
    if (lowerCategory.includes('leis') || lowerCategory.includes('legislação')) {
      return <FileText className="h-6 w-6" />;
    } else if (lowerCategory.includes('doutrinas')) {
      return <Book className="h-6 w-6" />;
    } else if (lowerCategory.includes('processo')) {
      return <Gavel className="h-6 w-6" />;
    } else if (lowerCategory.includes('const')) {
      return <Scale className="h-6 w-6" />;
    } else {
      return <Library className="h-6 w-6" />;
    }
  };
  
  // Get category background class
  const getCategoryBackground = (index: number) => {
    const backgroundClasses = [
      'from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30',
      'from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30',
      'from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30',
      'from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30',
      'from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30',
      'from-pink-500/20 to-pink-600/20 hover:from-pink-500/30 hover:to-pink-600/30',
    ];
    
    return backgroundClasses[index % backgroundClasses.length];
  };
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {categories.map((category, index) => (
        <motion.div 
          key={category} 
          variants={item}
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 300 }}
          onClick={() => onSelectCategory(category)}
        >
          <div className={cn(
            "h-40 rounded-xl p-6 cursor-pointer bg-gradient-to-br transition-all",
            getCategoryBackground(index)
          )}>
            <div className="flex flex-col h-full">
              <div className="bg-background/80 backdrop-blur-sm h-12 w-12 rounded-lg flex items-center justify-center mb-4">
                {getCategoryIcon(category)}
              </div>
              
              <h3 className="text-lg font-semibold mb-1">{category}</h3>
              <p className="text-sm text-muted-foreground">
                {bookCounts[category] || 0} {bookCounts[category] === 1 ? 'livro' : 'livros'}
              </p>
              
              <div className="mt-auto">
                <Button
                  variant="secondary" 
                  size="sm" 
                  className="mt-2 bg-background/80 hover:bg-background/100 backdrop-blur-sm"
                >
                  Explorar
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
