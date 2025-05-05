
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, BookCopy, BookText, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BibliotecaCategoriesProps {
  categories: string[];
  bookCountByCategory: Record<string, number>;
  onSelectCategory: (category: string) => void;
}

export const BibliotecaCategories: React.FC<BibliotecaCategoriesProps> = ({
  categories,
  bookCountByCategory,
  onSelectCategory,
}) => {
  // Get an icon based on category name
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Doutrinas': <BookOpen className="h-6 w-6" />,
      'Leis': <FileText className="h-6 w-6" />,
      'Codigos': <BookText className="h-6 w-6" />,
      'Artigos': <BookCopy className="h-6 w-6" />,
    };
    
    // Default to BookOpen if no specific icon is found
    return icons[category] || <BookOpen className="h-6 w-6" />;
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold">Categorias</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <motion.div key={category} variants={itemVariants}>
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => onSelectCategory(category)}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  {getCategoryIcon(category)}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{category}</h3>
                  <Badge variant="outline" className="mt-1">
                    {bookCountByCategory[category] || 0} livros
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-center mt-4">
        <Button 
          variant="outline"
          onClick={() => onSelectCategory('todos')}
          className="mx-auto"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Ver Todos os Livros
        </Button>
      </div>
    </motion.div>
  );
};
