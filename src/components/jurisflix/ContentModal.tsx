
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
import { Star, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  } | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContentModal({ item, isOpen, onOpenChange }: ContentModalProps) {
  if (!item) return null;
  
  // Extract YouTube video ID if it's a YouTube URL
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };
  
  const youtubeId = getYoutubeId(item.trailer);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img 
            src={item.capa} 
            alt={item.nome}
            className="w-full h-auto object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              {item.nota}
            </Badge>
          </div>
        </div>
        
        <DialogHeader className="px-6 pt-6">
          <div className="flex justify-between items-start">
            <DialogTitle className="text-xl font-bold">{item.nome}</DialogTitle>
            <Badge variant="outline">
              {item.tipo === 'filme' ? 'Filme' : 'Série'}
            </Badge>
          </div>
          <DialogDescription className="flex items-center gap-2">
            <span>{item.ano}</span>
            <span>•</span>
            <span>{item.plataforma}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 py-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Sinopse</h4>
            <p className="text-sm text-muted-foreground">{item.sinopse}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Relevância Jurídica</h4>
            <p className="text-sm text-muted-foreground">{item.beneficios}</p>
          </div>
          
          {youtubeId && (
            <div>
              <h4 className="text-sm font-medium mb-2">Trailer</h4>
              <AspectRatio ratio={16/9}>
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={`${item.nome} - Trailer`}
                  className="rounded-md w-full h-full"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </AspectRatio>
            </div>
          )}
          
          <div className="pt-2">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
