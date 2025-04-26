
import { useState } from "react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Film, Info, Star } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

interface FeaturedContentProps {
  onSelectItem: (item: JurisFlixItem) => void;
}

export const FeaturedContent = ({ onSelectItem }: FeaturedContentProps) => {
  // Featued content uses separate query to allow for different featured items in future
  const { data: featuredItems = [], isLoading } = useQuery({
    queryKey: ["jurisflix-featured"],
    queryFn: async () => {
      try {
        // In a real app, we might have a specific endpoint for featured content
        const { data, error } = await supabase
          .from("Jurisflix")
          .select("*")
          .limit(5);

        if (error) throw error;
        
        if (!data || data.length === 0) {
          return mockFeaturedItems;
        }
        
        return data as JurisFlixItem[];
      } catch (error) {
        console.error("Error fetching featured content:", error);
        toast.error("Erro ao carregar destaques");
        return mockFeaturedItems;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Animation variants for cards
  const animationProps = {
    initial: { scale: 0.96, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.4 }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <h2 className="text-2xl font-bold">Destaques</h2>
        <div className="h-[300px] bg-muted rounded-lg w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-2xl font-bold">Destaques</h2>
      <Carousel className="w-full">
        <CarouselContent>
          {featuredItems.map((item) => (
            <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="overflow-hidden group cursor-pointer hover:ring-2 ring-primary transition-all duration-200">
                  <div 
                    className="relative aspect-[16/9]" 
                    onClick={() => onSelectItem(item)}
                  >
                    <img 
                      src={item.capa}
                      alt={item.nome}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-100">
                      <div className="absolute bottom-0 p-4 text-white">
                        <h3 className="font-bold text-lg">{item.nome}</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <span>{item.ano}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {item.nota}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{item.tipo}</span>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Button 
                            size="sm" 
                            className="text-xs gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item.link, '_blank');
                            }}
                          >
                            <Film className="h-3 w-3" />
                            Assistir
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectItem(item);
                            }}
                          >
                            <Info className="h-3 w-3" />
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex left-2" />
        <CarouselNext className="hidden md:flex right-2" />
      </Carousel>
    </div>
  );
};

// Mock data for featured items when API fails
const mockFeaturedItems: JurisFlixItem[] = [
  {
    id: 1,
    nome: "O Julgamento de Chicago 7",
    ano: "2020",
    sinopse: "O filme retrata o julgamento dos manifestantes que protestaram contra a Guerra do Vietnã durante a Convenção Nacional Democrata de 1968.",
    nota: "8.5",
    plataforma: "Netflix",
    link: "https://www.netflix.com/title/81043755",
    capa: "https://m.media-amazon.com/images/M/MV5BYjYzOGE1MjUtODgyMy00ZDAxLTljYTgtNzk0Njg2YWQwMTZhXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg",
    beneficios: "Excelente para entender conceitos de direito processual e liberdade de expressão.",
    trailer: "https://www.youtube.com/embed/FVb6EdKDBfU",
    tipo: "filme"
  },
  {
    id: 2,
    nome: "Justiça Sem Limites",
    ano: "2019",
    sinopse: "Série que aborda casos jurídicos complexos e dilemas éticos enfrentados por advogados.",
    nota: "7.9",
    plataforma: "Amazon Prime",
    link: "https://www.primevideo.com",
    capa: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB9I1XGPVhUmlnZ6X0Fzy4nyrFNvZIZTAQiq4pKtbYQt2H5XAYMbjPwYpxqhu8axyDBuo&usqp=CAU",
    beneficios: "Apresenta casos de diversas áreas do direito e discute ética profissional.",
    trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    tipo: "serie"
  },
  {
    id: 3,
    nome: "Decisão Suprema",
    ano: "2022",
    sinopse: "Um caso controverso chega à Suprema Corte, levantando questões sobre a interpretação constitucional.",
    nota: "8.2",
    plataforma: "HBO Max",
    link: "https://www.hbomax.com",
    capa: "https://www.justwatch.com/images/backdrop/11412717/s640/uma-questao-de-justica",
    beneficios: "Ajuda a entender o funcionamento do judiciário e interpretação constitucional.",
    trailer: "https://www.youtube.com/embed/GQf5-XBzDhs",
    tipo: "documentário"
  }
];
