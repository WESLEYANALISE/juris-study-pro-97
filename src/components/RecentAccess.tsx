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
  const transcripts = [`Último acesso ao ${title}, continue de onde parou.`, `${title} foi visualizado recentemente.`, `Continue estudando ${title} para melhor fixação.`, `Você progrediu 45% em ${title}.`, `Revisão recomendada para ${title}.`, `O conteúdo de ${title} foi atualizado.`, `Este ${type} está relacionado aos seus interesses.`, `Retome seus estudos em ${title}.`, `Material complementar disponível para ${title}.`, `${title} faz parte da sua trilha de aprendizado.`];
  return transcripts[Math.floor(Math.random() * transcripts.length)];
};
const RecentAccess = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [transcripts, setTranscripts] = useState<{
    [key: string]: string;
  }>({});
  useEffect(() => {
    const fetchRecentAccess = async () => {
      try {
        // Since there's no recent_access table yet, we'll use static sample data
        // This avoids the error with attempting to query a non-existent table

        // In the future, you might want to create a recent_access table with:
        // CREATE TABLE public.recent_access (
        //   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        //   user_id uuid REFERENCES auth.users NOT NULL,
        //   content_id text NOT NULL,
        //   content_type text NOT NULL,
        //   content_title text NOT NULL,
        //   content_path text NOT NULL,
        //   accessed_at timestamp with time zone DEFAULT now()
        // );

        // Mock data for now
        const items = [{
          id: "1",
          title: "Direito Constitucional - Aula 3",
          type: "video" as const,
          path: "/videoaulas",
          timestamp: "2h atrás"
        }, {
          id: "2",
          title: "Reforma tributária 2025",
          type: "article" as const,
          path: "/bloger",
          timestamp: "ontem"
        }, {
          id: "3",
          title: "Manual de Direito Civil",
          type: "book" as const,
          path: "/biblioteca",
          timestamp: "3d atrás"
        }, {
          id: "4",
          title: "Recurso Extraordinário",
          type: "document" as const,
          path: "/peticionario",
          timestamp: "5d atrás"
        }, {
          id: "5",
          title: "Direito Administrativo - Concursos",
          type: "video" as const,
          path: "/videoaulas",
          timestamp: "1 semana"
        }, {
          id: "6",
          title: "Lei Geral de Proteção de Dados",
          type: "article" as const,
          path: "/bloger",
          timestamp: "2 semanas"
        }];

        // Generate random transcripts for each item
        const newTranscripts: {
          [key: string]: string;
        } = {};
        items.forEach(item => {
          newTranscripts[item.id] = getRandomTranscript(item.type, item.title);
        });
        setTranscripts(newTranscripts);
        setRecentItems(items);
      } catch (error) {
        console.error("Error fetching recent access:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentAccess();

    // Refresh transcripts every 10 seconds
    const interval = setInterval(() => {
      const newTranscripts: {
        [key: string]: string;
      } = {};
      recentItems.forEach(item => {
        newTranscripts[item.id] = getRandomTranscript(item.type, item.title);
      });
      setTranscripts(newTranscripts);
    }, 10000);
    return () => clearInterval(interval);
  }, []);
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

  // Ensure recentItems is an array before using array methods
  const itemsArray = Array.isArray(recentItems) ? recentItems : [];
  if (itemsArray.length === 0 && !loading) {
    return null;
  }
  if (loading) {
    return <div className="w-full mb-4 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded mb-4"></div>
        <div className="flex gap-2">
          <div className="h-20 flex-1 bg-muted rounded"></div>
          <div className="h-20 flex-1 bg-muted rounded"></div>
          <div className="h-20 flex-1 bg-muted rounded"></div>
        </div>
      </div>;
  }
  return;
};
export default RecentAccess;