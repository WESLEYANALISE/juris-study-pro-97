
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
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <Badge variant="outline">{peticao.area}</Badge>
            <h3 className="text-lg font-semibold">{peticao.tipo}</h3>
            {peticao.sub_area && (
              <Badge variant="secondary" className="w-fit">
                {peticao.sub_area}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1">
          <p className="text-muted-foreground">{peticao.descricao}</p>
          
          {peticao.tags && peticao.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {peticao.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => onView(peticao.link)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Visualizar Petição
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
