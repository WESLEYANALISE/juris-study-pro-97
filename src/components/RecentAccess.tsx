
import { useState, useEffect } from "react";
import { BookOpen, Video, Newspaper, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface RecentItem {
  id: string;
  title: string;
  type: "video" | "article" | "document" | "book";
  path: string;
  timestamp: string;
  transcript?: string;
}

// Random audio transcript generator
const getRandomTranscript = (type: string, title: string) => {
  const transcripts = [
    `Último acesso ao ${title}, continue de onde parou.`, 
    `${title} foi visualizado recentemente.`, 
    `Continue estudando ${title} para melhor fixação.`, 
    `Você progrediu 45% em ${title}.`, 
    `Revisão recomendada para ${title}.`, 
    `O conteúdo de ${title} foi atualizado.`, 
    `Este ${type} está relacionado aos seus interesses.`, 
    `Retome seus estudos em ${title}.`, 
    `Material complementar disponível para ${title}.`, 
    `${title} faz parte da sua trilha de aprendizado.`
  ];
  return transcripts[Math.floor(Math.random() * transcripts.length)];
};

const RecentAccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [transcripts, setTranscripts] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchRecentAccess = async () => {
      try {
        // Dados mockados para evitar problemas com tabelas inexistentes
        const mockItems = [
          {
            id: "1",
            title: "Direito Constitucional - Aula 3",
            type: "video" as const,
            path: "/videoaulas",
            timestamp: "2h atrás"
          },
          {
            id: "2",
            title: "Reforma tributária 2025",
            type: "article" as const,
            path: "/bloger",
            timestamp: "ontem"
          },
          {
            id: "3",
            title: "Manual de Direito Civil",
            type: "book" as const,
            path: "/biblioteca",
            timestamp: "3d atrás"
          },
          {
            id: "4",
            title: "Recurso Extraordinário",
            type: "document" as const,
            path: "/peticionario",
            timestamp: "5d atrás"
          },
          {
            id: "5",
            title: "Direito Administrativo - Concursos",
            type: "video" as const,
            path: "/videoaulas",
            timestamp: "1 semana"
          },
          {
            id: "6",
            title: "Lei Geral de Proteção de Dados",
            type: "article" as const,
            path: "/bloger",
            timestamp: "2 semanas"
          }
        ];

        // Inicializar as transcrições para cada item
        const initialTranscripts: { [key: string]: string } = {};
        mockItems.forEach(item => {
          initialTranscripts[item.id] = getRandomTranscript(item.type, item.title);
        });
        
        setTranscripts(initialTranscripts);
        setRecentItems(mockItems);
      } catch (error) {
        console.error("Error fetching recent access:", error);
        // Garantir que recentItems é sempre um array vazio em caso de erro
        setRecentItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentAccess();
  }, []);

  // Separamos o efeito de atualização das transcrições em um useEffect próprio
  useEffect(() => {
    // Só configuramos o intervalo se tivermos itens para mostrar
    if (recentItems.length === 0) return;

    // Função para atualizar todas as transcrições
    const updateAllTranscripts = () => {
      const newTranscripts: { [key: string]: string } = {};
      
      // Garante que só atualizamos as transcrições se recentItems existe e tem itens
      recentItems.forEach(item => {
        if (item && item.id) {
          newTranscripts[item.id] = getRandomTranscript(item.type, item.title);
        }
      });
      
      setTranscripts(prevTranscripts => ({
        ...prevTranscripts,
        ...newTranscripts
      }));
    };

    // Configurar o intervalo para atualizar transcrições
    const interval = setInterval(updateAllTranscripts, 10000);
    
    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(interval);
  }, [recentItems]); // Dependência direta no array de itens, não no length

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "article":
        return <Newspaper className="h-4 w-4 text-teal-500" />;
      case "document":
        return <FileText className="h-4 w-4 text-rose-500" />;
      case "book":
        return <BookOpen className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };
  
  if (loading) {
    return (
      <div className="w-full mb-4 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded mb-4"></div>
        <div className="flex gap-2">
          <div className="h-20 flex-1 bg-muted rounded"></div>
          <div className="h-20 flex-1 bg-muted rounded"></div>
          <div className="h-20 flex-1 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  // Se não temos itens, não mostramos nada
  if (!recentItems || recentItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-3">Acessos recentes</h2>
      <Carousel>
        <CarouselContent>
          {recentItems.map((item) => (
            <CarouselItem key={item.id} className="basis-1/1 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <Card 
                className="cursor-pointer hover:bg-accent/50 transition-colors" 
                onClick={() => navigate(item.path)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 p-1.5 bg-background border rounded-md">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.timestamp}</div>
                      <div className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
                        "{transcripts[item.id] || getRandomTranscript(item.type, item.title)}"
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

export default RecentAccess;
