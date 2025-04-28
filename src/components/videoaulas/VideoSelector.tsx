
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { YouTubePlaylist, YouTubeVideo, getJuridicPlaylists, getPlaylistVideos, getStoredPlaylists } from "@/lib/youtube-service";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { VideoCard } from "@/components/videoaulas/VideoCard";
import { SearchIcon, RefreshCw } from "lucide-react";
import { AreaSelector } from "./AreaSelector";

interface VideoSelectorProps {
  onVideoSelect: (videoId: string) => void;
  isProcessing: boolean;
}

// Lista expandida de áreas jurídicas
const LEGAL_AREAS = [
  "Direito Constitucional", "Direito Administrativo", "Direito Civil",
  "Direito Penal", "Direito Processual Civil", "Direito Processual Penal",
  "Direito Trabalhista", "Direito Previdenciário", "Direito Tributário",
  "Direito Empresarial", "Direito Ambiental", "Direito do Consumidor",
  "Direito Internacional", "Direito Digital", "Direito Eleitoral"
];

export function VideoSelector({ onVideoSelect, isProcessing }: VideoSelectorProps) {
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [storedPlaylists, setStoredPlaylists] = useState<YouTubePlaylist[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [activeTab, setActiveTab] = useState<string>("input");
  const [selectedArea, setSelectedArea] = useState<string>("Direito Constitucional");
  const [fetchingStored, setFetchingStored] = useState(false);

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

  // Load playlists from YouTube API
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

  // Load playlists from our database
  const loadStoredPlaylists = async (area: string) => {
    setFetchingStored(true);
    try {
      const data = await getStoredPlaylists(area);
      setStoredPlaylists(data);
      setActiveTab("stored");
    } catch (error) {
      console.error("Error loading stored playlists:", error);
      toast.error("Erro ao carregar playlists armazenadas. Por favor, tente novamente.");
    } finally {
      setFetchingStored(false);
    }
  };

  // Load initial stored playlists when component mounts
  useEffect(() => {
    loadStoredPlaylists(selectedArea);
  }, []);

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
    loadStoredPlaylists(area);
  };

  const filteredVideos = videos.filter(video => 
    !searchTerm || video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStoredPlaylists = storedPlaylists.filter(playlist =>
    !searchTerm || playlist.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    playlist.channelTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="input" className="flex-1">Inserir URL</TabsTrigger>
          <TabsTrigger value="stored" className="flex-1">Playlists Jurídicas</TabsTrigger>
          <TabsTrigger value="browse" className="flex-1">Buscar no YouTube</TabsTrigger>
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
        
        <TabsContent value="stored">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <AreaSelector 
                areas={LEGAL_AREAS} 
                selectedArea={selectedArea} 
                onAreaSelect={handleAreaSelect}
                className="w-full sm:w-auto" 
              />
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => loadStoredPlaylists(selectedArea)}
                disabled={fetchingStored}
              >
                {fetchingStored ? (
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Atualizar
              </Button>
            </div>

            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Buscar playlists por título ou canal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {fetchingStored ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : filteredStoredPlaylists.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredStoredPlaylists.map((playlist) => (
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
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma playlist encontrada para esta área.
                </p>
              </div>
            )}
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
                    onClick={() => {
                      setSelectedArea(area);
                      loadPlaylists(area);
                    }}
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
