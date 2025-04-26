
import { useState } from "react";
import { Card, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      className="group flex flex-col hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-[300px] overflow-hidden" 
      onClick={onCardClick} 
      onMouseEnter={() => setIsHovering(true)} 
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative flex-grow overflow-hidden">
        {livro.imagem ? (
          <div className="w-full h-full relative">
            <img src={livro.imagem} alt={livro.livro} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/70 flex items-end">
              <div className="p-3 w-full">
                <h3 className="font-semibold text-sm text-white line-clamp-3">{livro.livro}</h3>
                <p className="text-xs text-white/80 mt-1 line-clamp-1">{livro.area}</p>
              </div>
            </div>
            
            {showFavoriteButton && (
              <button 
                onClick={handleFavoriteClick} 
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <Bookmark size={16} className={isFavorite ? "fill-yellow-400 text-yellow-400" : ""} />
              </button>
            )}
            
            {livro.sobre && isHovering && (
              <div className="absolute inset-0 bg-black/90 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-white mb-1">{livro.livro}</h3>
                  <p className="text-xs text-white/80 line-clamp-5">{livro.sobre}</p>
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {livro.area}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-end">
            <div className="p-3 w-full">
              <h3 className="font-semibold text-sm text-white line-clamp-3">{livro.livro}</h3>
              <p className="text-xs text-white/80 mt-1 line-clamp-1">{livro.area}</p>
              
              {showFavoriteButton && (
                <button 
                  onClick={handleFavoriteClick} 
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <Bookmark size={16} className={isFavorite ? "fill-yellow-400 text-yellow-400" : ""} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
