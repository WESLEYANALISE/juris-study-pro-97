
import { useState } from "react";
import { Card, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import type { Livro } from "@/types/biblioteca";

type BookCardProps = {
  livro: Livro;
  onCardClick?: () => void;
  isFavorite?: boolean;
  showFavoriteButton?: boolean;
  onToggleFavorite?: () => void;
};

export function BookCard({
  livro,
  onCardClick = () => {},
  isFavorite = false,
  showFavoriteButton = false,
  onToggleFavorite
}: BookCardProps) {
  const {
    toast
  } = useToast();
  const [isHovering, setIsHovering] = useState(false);
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite();
    } else {
      toast({
        title: "Funcionalidade em breve",
        description: "Você precisará fazer login para favoritar livros."
      });
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card 
        className="group flex flex-col hover:shadow-lg transition-all cursor-pointer h-[300px] overflow-hidden border-[#2a2a2a] bg-[#141414]" 
        onClick={onCardClick} 
        onMouseEnter={() => setIsHovering(true)} 
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative flex-grow overflow-hidden">
          {livro.imagem ? (
            <div className="w-full h-full relative">
              <img 
                src={livro.imagem} 
                alt={livro.livro} 
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end">
                <div className="p-4 w-full">
                  <h3 className="font-semibold text-sm text-white line-clamp-2">
                    {livro.livro}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="outline" className="text-xs text-white/80 bg-white/10">
                      {livro.area}
                    </Badge>
                    
                    {livro.link && (
                      <BookOpen size={16} className="text-white/60" />
                    )}
                  </div>
                </div>
              </div>
              
              {showFavoriteButton && (
                <button 
                  onClick={handleFavoriteClick} 
                  className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-red-600/80 transition-colors"
                >
                  <Bookmark size={16} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
                </button>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-[#2a2a2a] flex items-end">
              <div className="p-4 w-full">
                <h3 className="font-semibold text-sm text-white line-clamp-2">
                  {livro.livro}
                </h3>
                <div className="flex justify-between items-center mt-2">
                  <Badge variant="outline" className="text-xs text-white/80 bg-white/10">
                    {livro.area}
                  </Badge>
                </div>
                
                {showFavoriteButton && (
                  <button 
                    onClick={handleFavoriteClick} 
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-red-600/80 transition-colors"
                  >
                    <Bookmark size={16} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
