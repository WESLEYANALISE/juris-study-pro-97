
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoCard } from "@/components/videoaulas/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaSelector } from "@/components/videoaulas/AreaSelector";
import { supabase } from "@/integrations/supabase/client";

// Canal específico IDs
const CHANNELS = {
  "Redação Jurídica": "UC3RRgAmE5tLWN3QBgM8BUfQ", // ID do canal Redação Jurídica
  "Tipografia Jurídica": "UCcRZD6NsGUQJQAM9LmEYjpw" // ID do canal Tipografia Jurídica
};

const AREAS = [
  "Fundamentos",
  "Petição Inicial", 
  "Contestação", 
  "Recursos", 
  "Peças Criminais",
  "Peças Cíveis",
  "Dicas Gerais",
  "Formatação"
];

export const VideoAulasRedacao = () => {
  const [selectedArea, setSelectedArea] = useState("Fundamentos");
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState("Redação Jurídica");

  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        // Tenta buscar do banco de dados primeiro
        const { data: storedPlaylists } = await supabase
          .from('video_playlists_juridicas')
          .select('*')
          .eq('area', 'Redação Jurídica - ' + selectedArea);

        if (storedPlaylists && storedPlaylists.length > 0) {
          setPlaylists(storedPlaylists.map(item => ({
            id: item.playlist_id,
            title: item.playlist_title,
            thumbnail: item.thumbnail_url,
            videoCount: item.video_count,
            channelTitle: item.channel_title
          })));
        } else {
          // Se não encontrou no banco, busca da API do YouTube
          const { getJuridicPlaylists } = await import("@/lib/youtube-service");
          const fetchedPlaylists = await getJuridicPlaylists(selectedArea);
          setPlaylists(fetchedPlaylists);
        }
      } catch (error) {
        console.error("Erro ao buscar playlists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [selectedArea, selectedChannel]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Videoaulas de Redação Jurídica</h2>
          <p className="text-muted-foreground">
            Assista aulas sobre técnicas de redação jurídica com professores especializados
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <AreaSelector
            areas={AREAS}
            selectedArea={selectedArea}
            onAreaSelect={setSelectedArea}
            className="w-[180px]"
          />
        </div>
      </div>

      <Tabs defaultValue="Redação Jurídica" className="space-y-4">
        <TabsList>
          <TabsTrigger value="Redação Jurídica" onClick={() => setSelectedChannel("Redação Jurídica")}>
            Canal Redação Jurídica
          </TabsTrigger>
          <TabsTrigger value="Tipografia Jurídica" onClick={() => setSelectedChannel("Tipografia Jurídica")}>
            Canal Tipografia Jurídica
          </TabsTrigger>
        </TabsList>

        {Object.keys(CHANNELS).map(channel => (
          <TabsContent key={channel} value={channel} className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-[180px] w-full" />
                    <CardHeader>
                      <Skeleton className="h-5 w-4/5" />
                      <Skeleton className="h-4 w-3/5" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {playlists.length > 0 ? (
                  playlists.map((playlist) => (
                    <VideoCard
                      key={playlist.id}
                      title={playlist.title}
                      thumbnail={playlist.thumbnail}
                      channelTitle={playlist.channelTitle}
                      videoCount={playlist.videoCount}
                      playlistId={playlist.id}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p>Nenhuma playlist encontrada para esta área. Tente outra categoria ou verifique sua conexão.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
