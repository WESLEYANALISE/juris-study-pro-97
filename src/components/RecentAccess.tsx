
import { useState, useEffect } from "react";
import { BookOpen, Video, Newspaper, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";

// Types for all possible target tables
type AccessType = "video" | "article" | "document" | "book";

interface RecentItem {
  id: string;
  title: string;
  type: AccessType;
  path: string;
  timestamp: string;
  transcript?: string;
}

const TABLE_TYPE_PATH_MAP: Record<string, {type: AccessType, path: string}> = {
  "video_aulas": { type: "video", path: "/videoaulas" },
  "biblioteca_juridica": { type: "book", path: "/biblioteca" },
  "peticoes": { type: "document", path: "/peticionario" },
  "noticias": { type: "article", path: "/noticias" },
  "resumos": { type: "article", path: "/resumos" },
  "bloger": { type: "article", path: "/bloger" },
};

function getTimestampStr(dateIso: string) {
  const date = new Date(dateIso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "agora";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min atrás`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h atrás`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "ontem";
  if (diffDay < 7) return `${diffDay}d atrás`;
  return date.toLocaleDateString();
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
  const [error, setError] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchRecentAccess = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get accesses from logged-in user, newest first (limit 10 for now)
        const { data: access, error: accessErr } = await supabase
          .from("recent_access")
          .select("*")
          .order("accessed_at", { ascending: false })
          .limit(10);
        if (accessErr) throw accessErr;

        // For each access, fetch title from appropriate table
        const items: RecentItem[] = [];
        for (const record of access || []) {
          const { target_table, target_id, access_type, id, accessed_at } = record;
          let resource: any = null;
          let title = "Conteúdo desconhecido";
          let type: AccessType = "document";
          let path = "/";
          // Map type/path based on table
          if (TABLE_TYPE_PATH_MAP[target_table]) {
            type = TABLE_TYPE_PATH_MAP[target_table].type;
            path = TABLE_TYPE_PATH_MAP[target_table].path;
          }
          // For each table, fetch title/name
          if (target_table === "video_aulas") {
            const { data } = await supabase
              .from("video_aulas")
              .select("title")
              .eq("id", target_id)
              .maybeSingle();
            title = data?.title ? data.title : "Vídeo desconhecido";
          } else if (target_table === "biblioteca_juridica") {
            const { data } = await supabase
              .from("biblioteca_juridica")
              .select("livro")
              .eq("id", target_id)
              .maybeSingle();
            title = data?.livro ? data.livro : "Livro desconhecido";
          } else if (target_table === "peticoes") {
            const { data } = await supabase
              .from("peticoes")
              .select("titulo")
              .eq("id", target_id)
              .maybeSingle();
            title = data?.titulo ? data.titulo : "Peça desconhecida";
          } else if (target_table === "noticias") {
            const { data } = await supabase
              .from("noticias")
              .select("titulo")
              .eq("id", target_id)
              .maybeSingle();
            title = data?.titulo ? data.titulo : "Notícia desconhecida";
          } else if (target_table === "resumos") {
            const { data } = await supabase
              .from("resumos")
              .select("titulo")
              .eq("id", target_id)
              .maybeSingle();
            title = data?.titulo ? data.titulo : "Resumo desconhecido";
          } else if (target_table === "bloger") {
            // Bloger: same, fetch titulo
            const { data } = await supabase
              .from("bloger")
              .select("titulo")
              .eq("id", target_id)
              .maybeSingle();
            title = data?.titulo ? data.titulo : "Artigo desconhecido";
          }
          // Generate transcript
          items.push({
            id: id,
            title,
            type,
            path,
            timestamp: getTimestampStr(accessed_at),
          });
        }

        // Generate transcripts
        const transcriptsObj: {[key: string]: string} = {};
        items.forEach(item => {
          transcriptsObj[item.id] = getRandomTranscript(item.type, item.title);
        });
        setRecentItems(items);
        setTranscripts(transcriptsObj);
      } catch (err: any) {
        setError("Erro ao buscar acessos recentes.");
        setRecentItems([]);
        setTranscripts({});
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAccess();

    // Refresh transcripts, not data, every 10s
    const interval = setInterval(() => {
      const newTranscripts: {[key: string]: string} = {};
      recentItems.forEach(item => {
        newTranscripts[item.id] = getRandomTranscript(item.type, item.title);
      });
      setTranscripts(newTranscripts);
    }, 10000);
    return () => clearInterval(interval);
  }, []); // Note: user id management is handled by RLS

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
  if (error) {
    return (
      <div className="w-full mb-4">
        <div className="text-xs text-red-500">{error}</div>
      </div>
    );
  }
  if (!recentItems.length) return null;

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
