
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

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
}

export function PeticaoCard({ peticao }: PeticaoCardProps) {
  return (
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
        <Button asChild className="w-full">
          <a href={peticao.link} target="_blank" rel="noopener noreferrer">
            <FileText className="w-4 h-4 mr-2" />
            Visualizar Petição
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
