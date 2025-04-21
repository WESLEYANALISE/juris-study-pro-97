
import { useState, useEffect } from "react";
import { BookOpen, Video, Newspaper, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [transcripts, setTranscripts] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchRecentAccess = async () => {
      try {
        // Fetch recent access from Supabase
        const { data, error } = await supabase
          .from('recent_access')
          .select('*')
          .order('accessed_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        // Fallback data if no data from Supabase
        const items = data && data.length > 0 ? data : [
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
        
        // Generate random transcripts for each item
        const newTranscripts: {[key: string]: string} = {};
        items.forEach(item => {
          newTranscripts[item.id] = getRandomTranscript(item.type, item.title);
        });
        
        setTranscripts(newTranscripts);
        setRecentItems(items);
      } catch (error) {
        console.error("Error fetching recent access:", error);
        // Set default items on error
        setRecentItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAccess();
    
    // Refresh transcripts every 10 seconds
    const interval = setInterval(() => {
      if (recentItems && recentItems.length > 0) {
        const newTranscripts: {[key: string]: string} = {};
        recentItems.forEach(item => {
          newTranscripts[item.id] = getRandomTranscript(item.type, item.title);
        });
        setTranscripts(newTranscripts);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4 text-blue-500" />;
      case "article": return <Newspaper className="h-4 w-4 text-teal-500" />;
      case "document": return <FileText className="h-4 w-4 text-rose-500" />;
      case "book": return <BookOpen className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
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

  // If there are no items, don't render anything
  if (!recentItems || recentItems.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium">Acessos Recentes</h2>
      </div>

      <Carousel
        opts={{
          align: "start",
          containScroll: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {recentItems.map((item) => (
            <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-[70%] sm:basis-1/2 md:basis-1/3">
              <Card 
                className="flex-1 min-w-0 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(item.path)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    {getIcon(item.type)}
                    <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                  </div>
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2 h-8">
                    "{transcripts[item.id] || getRandomTranscript(item.type, item.title)}"
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </div>
      </Carousel>
    </div>
  );
};

export default RecentAccess;
