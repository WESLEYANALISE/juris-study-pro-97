
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Film, Tv } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface JurisFlixItem {
  id: number;
  nome: string;
  ano: string;
  sinopse: string;
  nota: string;
  plataforma: string;
  link: string;
  capa: string;
  beneficios: string;
  trailer: string;
  tipo: string;
}

interface ContentGridProps {
  items: JurisFlixItem[];
  search: string;
  selectedType: string | null;
  onSelectItem: (item: JurisFlixItem) => void;
  isLoading: boolean;
}

export function ContentGrid({ items, search, selectedType, onSelectItem, isLoading }: ContentGridProps) {
  const isMobile = useIsMobile();
  
  // Filter items based on search text and selected type
  const filteredItems = items.filter((item) => {
    const matchesSearch = search.trim() === "" || 
      item.nome.toLowerCase().includes(search.toLowerCase()) ||
      item.plataforma.toLowerCase().includes(search.toLowerCase());
      
    const matchesType = !selectedType || item.tipo === selectedType;
    
    return matchesSearch && matchesType;
  });
  
  // If no items match filters, show message
  if (filteredItems.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <h3 className="text-lg font-medium mb-2">Nenhum conteúdo encontrado</h3>
        <p className="text-muted-foreground">Tente ajustar os filtros ou buscar por outro termo</p>
        
        {selectedType && (
          <button
            className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
            onClick={() => onSelectItem({ id: -1, tipo: "reset" } as any)}
          >
            Limpar filtros
          </button>
        )}
      </motion.div>
    );
  }
  
  // If loading, show skeleton cards
  if (isLoading) {
    const skeletonCount = isMobile ? 4 : 10;
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {Array(skeletonCount).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden border-0 shadow-md h-full">
            <CardContent className="p-0 aspect-[2/3] relative">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // Grid of content cards
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
      {filteredItems.map((item) => (
        <motion.div 
          key={item.id}
          whileHover={{ scale: isMobile ? 1.01 : 1.03 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="will-change-transform"
        >
          <Card
            onClick={() => onSelectItem(item)}
            className="cursor-pointer overflow-hidden hover:ring-1 hover:ring-primary/50 shadow-lg bg-black h-full border-0"
          >
            <CardContent className="p-0 aspect-[2/3] relative">
              {item.capa ? (
                <img 
                  src={item.capa} 
                  alt={item.nome}
                  className="object-cover h-full w-full"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://via.placeholder.com/400x600?text=Imagem+não+encontrada';
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted">
                  Sem imagem
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-2 sm:p-3">
                <div className="flex items-center gap-1 mb-1">
                  {item.tipo === "filme" ? (
                    <Film size={14} className="text-primary" />
                  ) : (
                    <Tv size={14} className="text-primary" />
                  )}
                  <span className="text-[10px] sm:text-xs text-white/80">{item.ano}</span>
                  
                  {item.nota && (
                    <Badge className="ml-auto flex items-center gap-1 h-5 bg-amber-600/90 hover:bg-amber-600 text-white">
                      <Star size={10} className="fill-white" />
                      <span className="text-[10px]">{item.nota}</span>
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-medium text-white text-xs sm:text-sm line-clamp-2">
                  {item.nome}
                </h3>
                
                <div className="mt-1">
                  <Badge variant="outline" className="h-5 text-white border-white/40 text-[10px]">
                    {item.plataforma}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
