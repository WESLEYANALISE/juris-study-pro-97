
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, DownloadCloud } from "lucide-react";
import { memo } from "react";

interface PeticaoCardProps {
  peticao: {
    id: string;
    area: string;
    sub_area?: string;
    tipo: string;
    link: string;
    descricao: string;
    tags?: string[];
  };
  onView: (url: string) => void;
}

// Using memo to prevent unnecessary re-renders
export const PeticaoCard = memo(function PeticaoCard({ peticao, onView }: PeticaoCardProps) {
  const isDocx = peticao.link.toLowerCase().endsWith('.docx') || 
                peticao.link.toLowerCase().includes('doc') || 
                peticao.link.includes('document/d/');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card 
        variant="glass" 
        className="flex flex-col h-full overflow-hidden border border-white/5 shadow-lg"
      >
        <div className="p-5 pb-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="w-fit bg-purple-900/20">{peticao.area}</Badge>
              {isDocx && (
                <Badge variant="outline" className="w-fit bg-blue-900/20 text-xs">
                  DOCX
                </Badge>
              )}
            </div>
            
            <h3 className="text-lg font-semibold line-clamp-1 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {peticao.tipo}
            </h3>
            
            {peticao.sub_area && (
              <Badge variant="secondary" className="w-fit">
                {peticao.sub_area}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="px-5 py-2 flex-1">
          <p className="text-muted-foreground text-sm line-clamp-2">{peticao.descricao}</p>
          
          {peticao.tags && peticao.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {peticao.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-white/5 bg-card/30 mt-auto">
          <div className="flex gap-2 w-full">
            <Button 
              className="flex-1 gap-2" 
              onClick={() => onView(peticao.link)}
              variant="gradient"
              glow
            >
              <Eye className="w-4 h-4" />
              Visualizar
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(peticao.link, "_blank")}
              size="icon"
              className="aspect-square"
            >
              <DownloadCloud className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});
