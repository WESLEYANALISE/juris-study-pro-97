
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";

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

export function PeticaoCard({ peticao, onView }: PeticaoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="flex flex-col h-full overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit animate-fade-in">{peticao.area}</Badge>
            <h3 className="text-lg font-semibold line-clamp-1">{peticao.tipo}</h3>
            {peticao.sub_area && (
              <Badge variant="secondary" className="w-fit">
                {peticao.sub_area}
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
        
        <CardFooter className="pt-2">
          <Button 
            className="w-full gap-2 hover:gap-3 transition-all" 
            onClick={() => onView(peticao.link)}
          >
            <FileText className="w-4 h-4" />
            Visualizar Petição
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
