
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, DownloadCloud } from "lucide-react";
import { motion } from "framer-motion";
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

export const PeticaoCard = memo(function PeticaoCard({ peticao, onView }: PeticaoCardProps) {
  const isDocx = peticao.link.toLowerCase().endsWith('.docx') || 
                peticao.link.toLowerCase().includes('doc') || 
                peticao.link.includes('document/d/');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full overflow-hidden border border-white/5 bg-gradient-to-br from-background/60 to-background/90 shadow-lg hover:shadow-xl hover:shadow-purple-900/10 transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit animate-fade-in text-xs bg-purple-900/20">{peticao.area}</Badge>
            <h3 className="text-lg font-semibold line-clamp-1 text-gradient">{peticao.tipo}</h3>
            {peticao.sub_area && (
              <Badge variant="secondary" className="w-fit">
                {peticao.sub_area}
              </Badge>
            )}
            {isDocx && (
              <Badge variant="outline" className="w-fit bg-blue-900/20 text-xs">
                DOCX
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 pt-0">
          <p className="text-muted-foreground text-sm line-clamp-3">{peticao.descricao}</p>
          
          {peticao.tags && peticao.tags.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-1 mt-3"
            >
              {peticao.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </motion.div>
          )}
        </CardContent>
        
        <CardFooter className="pt-2 border-t border-white/5 bg-card/30">
          <div className="flex gap-2 w-full">
            <Button 
              className="flex-1 gap-2 hover:gap-3 transition-all" 
              onClick={() => onView(peticao.link)}
              variant="gradient"
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
        </CardFooter>
      </Card>
    </motion.div>
  );
});
