
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Noticia = {
  id: string;
  titulo: string;
  conteudo: string;
  thumbnail_url: string | null;
  data_publicacao: string | null;
  fonte: string | null;
  area_direito: string | null;
};

interface NewsCardProps {
  noticia: Noticia;
  onClick?: () => void;
}

export function NewsCard({ noticia, onClick }: NewsCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Data não disponível";
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  return (
    <Card 
      className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {noticia.thumbnail_url && (
        <div className="h-40 overflow-hidden">
          <img 
            src={noticia.thumbnail_url} 
            alt={noticia.titulo} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardContent className="flex-grow p-4">
        <div className="flex justify-between items-start mb-2">
          {noticia.area_direito && (
            <Badge variant="outline">
              {noticia.area_direito}
            </Badge>
          )}
          
          <span className="text-xs text-muted-foreground">
            {formatDate(noticia.data_publicacao)}
          </span>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {noticia.titulo}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-3">
          {noticia.conteudo}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        {noticia.fonte && (
          <span className="text-xs text-muted-foreground">
            Fonte: {noticia.fonte}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
