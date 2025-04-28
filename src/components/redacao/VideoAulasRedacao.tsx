
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SearchIcon } from "lucide-react";
import { getPlaylistVideos, StoredPlaylist } from "@/lib/youtube-service";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useNavigate } from "react-router-dom";

interface EnhancedStoredPlaylist extends StoredPlaylist {
  is_single_video: boolean;
  video_id?: string;
}

export function VideoAulasRedacao() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [storedPlaylists, setStoredPlaylists] = useState<EnhancedStoredPlaylist[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [areaFilter, setAreaFilter] = useState<string | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadStoredPlaylists();
  }, []);

  const loadStoredPlaylists = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('video_playlists_juridicas')
        .select('*')
        .ilike('area', 'Redação Jurídica%')
        .order('channel_title', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      const typedPlaylists = (data || []).map(playlist => ({
        ...playlist,
        is_single_video: Boolean((playlist as any).is_single_video),
        video_id: (playlist as any).video_id || undefined
      })) as EnhancedStoredPlaylist[];
      
      setStoredPlaylists(typedPlaylists);
      
      if (data) {
        const uniqueAreas = Array.from(
          new Set(
            data.map(playlist => {
              const area = playlist.area || '';
              return area.replace('Redação Jurídica - ', '').trim();
            })
          )
        ).filter(Boolean) as string[];
        
        setAreas(uniqueAreas);
      }
    } catch (error) {
      console.error("Error loading stored playlists:", error);
      toast.error("Erro ao carregar playlists armazenadas. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistClick = async (playlist: EnhancedStoredPlaylist) => {
    try {
      if (playlist.is_single_video && playlist.video_id) {
        setSelectedVideoId(playlist.video_id);
      } else {
        const { data: articles, error } = await supabase
          .from('redacao_artigos')
          .select('*')
          .filter('playlist_ids', 'cs', `{"${playlist.playlist_id}"}`)
          .limit(1);
        
        if (error) {
          throw error;
        }
        
        if (articles && articles.length > 0) {
          navigate(`/redacao-conteudo/${articles[0].id}`);
          return;
        }
        
        const videos = await getPlaylistVideos(playlist.playlist_id);
        
        if (videos && videos.length > 0) {
          setSelectedVideoId(videos[0].id);
        }
      }
    } catch (error) {
      console.error("Error handling playlist click:", error);
      toast.error("Erro ao carregar vídeos. Por favor, tente novamente.");
    }
  };

  const filteredPlaylists = storedPlaylists.filter(playlist => {
    const matchesSearch = !searchTerm || 
      playlist.playlist_title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      playlist.channel_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArea = !areaFilter || 
      playlist.area.includes(`Redação Jurídica - ${areaFilter}`);
    
    return matchesSearch && matchesArea;
  });

  const handleAreaFilter = (area: string | null) => {
    setAreaFilter(area === areaFilter ? null : area);
  };

  const navigateToArticles = () => {
    navigate('/redacao-juridica');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Buscar por título ou canal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {areas.map(area => (
            <Button
              key={area}
              variant={areaFilter === area ? "default" : "outline"}
              size="sm"
              onClick={() => handleAreaFilter(area)}
            >
              {area}
            </Button>
          ))}
        </div>
      </div>
      
      {selectedVideoId ? (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="aspect-video w-full">
              <VideoPlayer videoId={selectedVideoId} />
            </div>
            <Button variant="outline" onClick={() => setSelectedVideoId(null)}>
              Voltar para lista
            </Button>
          </CardContent>
        </Card>
      ) : filteredPlaylists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaylists.map(playlist => (
            <Card 
              key={playlist.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handlePlaylistClick(playlist)}
            >
              <div className="aspect-video w-full">
                <img 
                  src={playlist.thumbnail_url || "/placeholder.svg"}
                  alt={playlist.playlist_title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-2 text-base mb-1">{playlist.playlist_title}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {playlist.channel_title}
                  </p>
                  {!playlist.is_single_video && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {playlist.video_count} vídeos
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {playlist.area.replace('Redação Jurídica - ', '')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            {searchTerm || areaFilter 
              ? "Nenhum resultado encontrado para sua busca." 
              : "Nenhuma playlist disponível no momento."}
          </p>
          {(searchTerm || areaFilter) && (
            <Button variant="outline" onClick={() => { setSearchTerm(""); setAreaFilter(null); }}>
              Limpar filtros
            </Button>
          )}
        </div>
      )}
      
      <div className="text-center mt-6">
        <Button onClick={() => navigate("/redacao-conteudo")}>
          Ver Todos os Artigos de Redação Jurídica
        </Button>
      </div>
    </div>
  );
}
