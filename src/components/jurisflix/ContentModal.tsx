
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, Info, Calendar, Monitor, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface ContentModalProps {
  item: {
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
    categoria?: string;
  } | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContentModal({ item, isOpen, onOpenChange }: ContentModalProps) {
  const isMobile = useIsMobile();
  
  if (!item) return null;
  
  // Extract YouTube video ID if it's a YouTube URL
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7]?.length === 11) ? match[7] : null;
  };
  
  const youtubeId = getYoutubeId(item.trailer);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'w-[95vw]' : 'sm:max-w-[800px]'} p-0 overflow-hidden max-h-[90vh] overflow-y-auto bg-card`}>
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {item.capa ? (
            <div className="relative h-[200px] md:h-[300px] w-full">
              <img 
                src={item.capa} 
                alt={item.nome}
                className="w-full h-full object-cover"
                loading="eager"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://via.placeholder.com/800x400?text=Imagem+não+encontrada';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent">
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{item.nome}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      {item.nota}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {item.ano}
                    </span>
                    <span className="flex items-center gap-1">
                      <Monitor className="h-3 w-3" />
                      {item.plataforma}
                    </span>
                    <Badge variant="outline" className="text-white border-white/30">
                      {item.tipo === 'filme' ? 'Filme' : item.tipo === 'serie' ? 'Série' : 'Documentário'}
                    </Badge>
                    {item.categoria && (
                      <Badge variant="outline" className="text-white border-white/30">
                        {item.categoria}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-40 bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Sem imagem de capa</span>
            </div>
          )}
        </div>
        
        <div className={`${isMobile ? 'px-4' : 'px-6'} py-4 space-y-6`}>
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Sinopse
            </h4>
            <p className="text-sm text-muted-foreground">{item.sinopse}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Relevância Jurídica
            </h4>
            <p className="text-sm text-muted-foreground">{item.beneficios}</p>
          </div>
          
          {youtubeId && (
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-primary" />
                Trailer
              </h4>
              <div className="rounded-lg overflow-hidden border border-border">
                <AspectRatio ratio={16/9}>
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={`${item.nome} - Trailer`}
                    className="w-full h-full"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </AspectRatio>
              </div>
            </div>
          )}
          
          <div className={`${isMobile ? 'pt-2 pb-4' : 'pt-4'}`}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button asChild className="w-full">
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  Assistir na {item.plataforma}
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
