
import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Book, BookCopy, LibraryBig } from 'lucide-react';
import { JuridicalCard } from '../ui/juridical-card';
import { Badge } from '../ui/badge';
import { LivroJuridico } from '@/types/biblioteca-juridica';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { cn } from '@/lib/utils';

interface BibliotecaCategoryScrollProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  booksByCategory: Record<string, LivroJuridico[]>;
}

export const BibliotecaCategoryScroll = ({
  categories,
  selectedCategory,
  onSelectCategory,
  booksByCategory
}: BibliotecaCategoryScrollProps) => {
  // Animações
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

  // Mapeia os ícones para cada categoria (ou usa um padrão)
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Constitucional': <LibraryBig className="h-5 w-5" />,
      'Civil': <Book className="h-5 w-5" />,
      'Penal': <Bookmark className="h-5 w-5" />,
      'Administrativo': <BookCopy className="h-5 w-5" />
    };
    
    return iconMap[category] || <Book className="h-5 w-5" />;
  };
  
  // Gera cores baseadas na categoria
  const getCategoryColor = (category: string) => {
    // Mapeia as categorias para cores específicas (ou usa um valor padrão)
    const colorMap: Record<string, string> = {
      'Constitucional': 'gradient-purple',
      'Civil': 'gradient-green',
      'Penal': 'gradient-red',
      'Administrativo': 'gradient-blue',
      'Trabalhista': 'gradient-yellow',
      'Tributário': 'gradient-orange'
    };
    
    return colorMap[category] || '';
  };
  
  return (
    <motion.div
      className="mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Explorar por Categoria</h3>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-sm text-primary hover:underline"
          >
            Limpar filtro
          </button>
        )}
      </div>
      
      <Swiper
        slidesPerView="auto"
        spaceBetween={16}
        className="pb-4"
      >
        {categories.map((category) => (
          <SwiperSlide key={category} style={{ width: 'auto' }}>
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <JuridicalCard
                title={category}
                description={`Categoria de ${category}`}
                icon="book"
                className={cn(
                  "w-[200px] cursor-pointer",
                  selectedCategory === category ? "ring-2 ring-primary" : ""
                )}
                variant={selectedCategory === category ? "primary" : "default"}
                onClick={() => onSelectCategory(selectedCategory === category ? null : category)}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <span className="text-sm font-medium">{category}</span>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {booksByCategory[category]?.length || 0} livros
                  </Badge>
                </div>
              </JuridicalCard>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
};
