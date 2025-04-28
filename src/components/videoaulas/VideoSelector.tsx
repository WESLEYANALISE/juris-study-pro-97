import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { YouTubePlaylist, YouTubeVideo, getJuridicPlaylists, getPlaylistVideos } from "@/lib/youtube-service";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { VideoCard } from "@/components/videoaulas/VideoCard";
import { SearchIcon } from "lucide-react";

interface VideoSelectorProps {
  onVideoSelect: (videoId: string) => void;
  isProcessing: boolean;
}

export function VideoSelector({ onVideoSelect, isProcessing }: VideoSelectorProps) {
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [activeTab, setActiveTab] = useState<string>("input");
  const [selectedArea, setSelectedArea] = useState<string>("Constitucional");

  const LEGAL_AREAS = [
    "Constitucional", 
    "Civil", 
    "Penal", 
    "Administrativo", 
    "Processual Civil", 
    "Processual Penal"
  ];

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const handleUrlSubmit = () => {
    const videoId = extractYouTubeId(inputUrl);
    if (videoId) {
      onVideoSelect(videoId);
    } else {
      toast.error("URL do YouTube inválida. Por favor, insira um link válido de vídeo do YouTube.");
    }
  };

  const loadPlaylists = async (area: string) => {
    setLoading(true);
    try {
      const data = await getJuridicPlaylists(area);
      setPlaylists(data);
      setVideos([]);
      setActiveTab("browse");
    } catch (error) {
      console.error("Error loading playlists:", error);
      toast.error("Erro ao carregar playlists. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistClick = async (playlistId: string) => {
    setLoading(true);
    try {
      const videosData = await getPlaylistVideos(playlistId);
      setVideos(videosData);
    } catch (error) {
      console.error("Error loading videos:", error);
      toast.error("Erro ao carregar vídeos. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    loadPlaylists(area);
  };

  const filteredVideos = videos.filter(video => 
    !searchTerm || video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="input" className="flex-1">Inserir URL</TabsTrigger>
          <TabsTrigger value="browse" className="flex-1">Explorar Vídeos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="input">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Cole o link do vídeo do YouTube aqui"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="flex-grow"
              />
              <Button 
                onClick={handleUrlSubmit} 
                disabled={isProcessing || !inputUrl}
              >
                {isProcessing ? <LoadingSpinner /> : null}
                Carregar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Exemplo: https://www.youtube.com/watch?v=dQw4w9WgXcQ
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="browse">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Selecione uma área:</h3>
              <div className="flex flex-wrap gap-2">
                {LEGAL_AREAS.map((area) => (
                  <Button
                    key={area}
                    size="sm"
                    variant={selectedArea === area ? "default" : "outline"}
                    onClick={() => handleAreaSelect(area)}
                  >
                    {area}
                  </Button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : playlists.length > 0 && videos.length === 0 ? (
              <>
                <h3 className="text-lg font-medium">Playlists disponíveis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {playlists.map((playlist) => (
                    <Card
                      key={playlist.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handlePlaylistClick(playlist.id)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-16 h-16 overflow-hidden rounded">
                          <img
                            src={playlist.thumbnail || "/placeholder.svg"}
                            alt={playlist.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold line-clamp-1">{playlist.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {playlist.channelTitle} • {playlist.videoCount} vídeos
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : videos.length > 0 ? (
              <>
                <div className="relative mb-4">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    className="pl-10"
                    placeholder="Buscar vídeos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      isSelected={false}
                      onClick={() => onVideoSelect(video.id)}
                      searchTerm={searchTerm}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Selecione uma área do direito para ver as playlists disponíveis
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
