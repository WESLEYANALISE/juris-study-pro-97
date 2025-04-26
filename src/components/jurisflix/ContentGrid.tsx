
import React, { useState, useMemo } from "react";
import { Film, Info, Star, TvIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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

export const ContentGrid = ({ 
  items, 
  search, 
  selectedType, 
  onSelectItem,
  isLoading 
}: ContentGridProps) => {
  // Memoize filtered items to avoid unnecessary re-filtering
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.nome.toLowerCase().includes(search.toLowerCase());
      const matchesType = !selectedType || item.tipo === selectedType;
      return matchesSearch && matchesType;
    });
  }, [items, search, selectedType]);

  const getIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "filme":
        return <Film className="h-5 w-5" />;
      case "serie":
        return <TvIcon className="h-5 w-5" />;
      case "documentário":
        return <Video className="h-5 w-5" />;
      default:
        return <Film className="h-5 w-5" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted rounded-lg aspect-[2/3]" />
            <div className="space-y-2 mt-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Info className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Nenhum conteúdo encontrado</h3>
        <p className="text-muted-foreground max-w-md">
          Não encontramos nenhum conteúdo com os filtros atuais. Tente ajustar sua busca ou remover filtros.
        </p>
        {selectedType && (
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              // This is just a placeholder since the parent component controls the state
              // We'll use the onSelectItem function to communicate up
              const resetTypeEvent = { id: -1, tipo: "reset" } as unknown as JurisFlixItem;
              onSelectItem(resetTypeEvent);
            }}
          >
            Limpar filtro de tipo
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="group relative rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all duration-200"
          onClick={() => onSelectItem(item)}
        >
          <img
            src={item.capa}
            alt={item.nome}
            className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute bottom-0 p-4 text-white">
              <h3 className="font-bold">{item.nome}</h3>
              <div className="flex items-center gap-2 text-sm">
                <span>{item.ano}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {item.nota}
                </span>
              </div>
              <span className="inline-block mt-1 text-xs bg-primary/20 backdrop-blur-sm px-2 py-1 rounded-full">
                {item.plataforma}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
