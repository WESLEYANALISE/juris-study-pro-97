
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Brain, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface MapaMental {
  id: number;
  area: string;
  mapa: string;
  link: string;
  created_at: string;
}

interface MapaMentalCardProps {
  mapa: MapaMental;
  onView: () => void;
  viewType: "grid" | "list";
}

export function MapaMentalCard({ mapa, onView, viewType }: MapaMentalCardProps) {
  const timeAgo = formatDistanceToNow(new Date(mapa.created_at), { 
    addSuffix: true,
    locale: ptBR
  });

  if (viewType === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden hover:shadow-hover transition-all duration-300 border-2 hover:border-primary/50">
          <div className="flex items-center p-4">
            <div className="bg-primary/10 p-2 rounded-full mr-4">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-grow mr-4">
              <h3 className="font-medium line-clamp-1">{mapa.mapa}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{mapa.area}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </div>
            </div>
            
            <Button onClick={onView} size="sm" className="gap-1 shrink-0">
              <FileText className="h-3.5 w-3.5" />
              Ver
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
        <div className="aspect-[4/3] bg-secondary/10 flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-primary/5 to-primary/20">
              <Brain className="h-20 w-20 text-primary/40" />
            </div>
            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1">
              <span className="text-xs font-medium">{mapa.area}</span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-medium line-clamp-2">{mapa.mapa}</h3>
          <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <Button onClick={onView} className="w-full gap-2 hover:gap-3 transition-all">
            <FileText className="h-4 w-4" />
            Visualizar Mapa
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
