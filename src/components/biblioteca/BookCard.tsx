
import { useState } from "react";
import { Card, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Livro = {
  id: string;
  titulo: string;
  autor: string | null;
  editora: string | null;
  area: string;
  ano_publicacao: number | null;
  capa_url: string | null;
  sinopse: string | null;
  link_leitura: string | null;
  link_download: string | null;
  tags: string[] | null;
};

type BookCardProps = {
  livro: Livro;
  onCardClick?: () => void;  // Make this prop optional
  isFavorite?: boolean;
  showFavoriteButton?: boolean;
  onToggleFavorite?: () => void;
};

export function BookCard({ 
  livro, 
  onCardClick = () => {}, // Provide a default empty function 
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
        description: "Você precisará fazer login para favoritar livros.",
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
        {livro.capa_url ? (
          <div className="w-full h-full relative">
            <img
              src={livro.capa_url}
              alt={livro.titulo}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/70 flex items-end">
              <div className="p-3 w-full">
                <h3 className="font-semibold text-sm text-white line-clamp-3">{livro.titulo}</h3>
                {livro.autor && (
                  <p className="text-xs text-white/80 mt-1 line-clamp-1">{livro.autor}</p>
                )}
                
                {isHovering && livro.tags && livro.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {livro.tags.slice(0, 2).map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                    {livro.tags.length > 2 && (
                      <Badge variant="secondary" className="text-[10px]">
                        +{livro.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {showFavoriteButton && (
              <button 
                onClick={handleFavoriteClick}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <Bookmark 
                  size={16} 
                  className={isFavorite ? "fill-yellow-400 text-yellow-400" : ""} 
                />
              </button>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-end">
            <div className="p-3 w-full">
              <h3 className="font-semibold text-sm text-white line-clamp-3">{livro.titulo}</h3>
              {livro.autor && (
                <p className="text-xs text-white/80 mt-1 line-clamp-1">{livro.autor}</p>
              )}
              
              {showFavoriteButton && (
                <button 
                  onClick={handleFavoriteClick}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
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
      <CardDescription className="p-2 text-xs text-center border-t">
        {livro.area}
      </CardDescription>
    </Card>
  );
}
