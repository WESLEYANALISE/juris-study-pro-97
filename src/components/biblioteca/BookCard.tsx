
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Livro = {
  id: string;
  livro: string;
  area: string;
  link: string | null;
  download: string | null;
  imagem: string | null;
  sobre: string | null;
};

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
  const { toast } = useToast();
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
    <Card 
      className={cn(
        "group flex flex-col hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-[300px] overflow-hidden",
        "border border-purple-500/30 hover:border-purple-500/80 relative",
        "bg-gradient-to-br from-background/95 to-purple-950/20 backdrop-blur-sm"
      )} 
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
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent">
              <div className="absolute bottom-0 p-3 w-full">
                <h3 className="font-semibold text-sm text-white line-clamp-3 group-hover:text-purple-200 transition-colors">{livro.livro}</h3>
                <p className="text-xs text-white/80 mt-1 line-clamp-1">{livro.area}</p>
              </div>
            </div>
            
            {showFavoriteButton && (
              <button 
                onClick={handleFavoriteClick} 
                className={cn(
                  "absolute top-2 right-2 p-1.5 rounded-full text-white transition-colors",
                  "bg-black/60 hover:bg-black/80",
                  "shadow-lg backdrop-blur-sm"
                )}
              >
                <Bookmark 
                  size={16} 
                  className={cn(
                    "transition-all", 
                    isFavorite ? "fill-yellow-400 text-yellow-400" : "",
                    "group-hover:scale-110"
                  )} 
                />
              </button>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800/90 to-gray-900/90 flex items-end">
            <div className="p-3 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent" />
              <BookOpen className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-white/20" />
              <div className="relative">
                <h3 className="font-semibold text-sm text-white line-clamp-3 group-hover:text-purple-200 transition-colors">{livro.livro}</h3>
                <p className="text-xs text-white/80 mt-1 line-clamp-1">{livro.area}</p>
              </div>
              
              {showFavoriteButton && (
                <button 
                  onClick={handleFavoriteClick} 
                  className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                >
                  <Bookmark 
                    size={16} 
                    className={isFavorite ? "fill-yellow-400 text-yellow-400" : ""} 
                  />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none"></div>
    </Card>
  );
}
