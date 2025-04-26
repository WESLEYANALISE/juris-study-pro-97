
import { Youtube, Star } from "lucide-react";
import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

interface ContentModalProps {
  item: JurisFlixItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContentModal = ({ item, isOpen, onOpenChange }: ContentModalProps) => {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <div className="space-y-4">
          <div className="aspect-video relative overflow-hidden rounded-lg">
            {item.trailer ? (
              <iframe
                src={item.trailer.replace('watch?v=', 'embed/')}
                title={`Trailer de ${item.nome}`}
                className="w-full h-full rounded-lg"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                <Youtube className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">{item.nome}</h2>
              <span className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4" />
                {item.nota}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm bg-muted px-2 py-1 rounded-full">
                {item.ano}
              </span>
              <span className="text-sm bg-muted px-2 py-1 rounded-full capitalize">
                {item.tipo}
              </span>
              <span className="text-sm bg-muted px-2 py-1 rounded-full">
                {item.plataforma}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Sinopse</h3>
                <p className="text-muted-foreground">{item.sinopse}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Benefícios Educacionais</h3>
                <p className="text-muted-foreground">{item.beneficios}</p>
              </div>

              {item.link && (
                <Button 
                  className="w-full"
                  onClick={() => window.open(item.link, '_blank')}
                >
                  Assistir na {item.plataforma}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
