import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/VideoPlayer";
import { SearchIcon, BookOpen, Brain, FileText, MessageSquare } from "lucide-react";
import { getJuridicPlaylists, getPlaylistVideos, type YouTubePlaylist, type YouTubeVideo } from "@/lib/youtube-service";
import { AreaSelector } from "@/components/videoaulas/AreaSelector";

const LEGAL_AREAS = [
  "Constitucional",
  "Civil",
  "Penal",
  "Administrativo",
  "Processual Civil",
  "Processual Penal",
  "Trabalho",
  "Tributário",
  "Empresarial",
  "Ambiental",
  "Internacional",
  "Consumidor"
];

const TOPICS_MAP: Record<string, string[]> = {
  "Constitucional": [
    "Controle de Constitucionalidade",
    "Direitos Fundamentais",
    "Organização do Estado",
    "Poder Judiciário",
    "Sistema Tributário"
  ],
  "Civil": [
    "Parte Geral",
    "Obrigações",
    "Contratos",
    "Responsabilidade Civil",
    "Direito das Coisas",
    "Família e Sucessões"
  ],
  "Penal": [
    "Teoria do Delito",
    "Penas",
    "Crimes contra a Pessoa",
    "Crimes contra o Patrimônio",
    "Execução Penal"
  ]
};

const VideoAulas = () => {
  const [selectedArea, setSelectedArea] = useState<string>("Constitucional");
  const [searchTerm, setSearchTerm] = useState("");
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("playlists");
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      try {
        const searchTerm = selectedArea;
        const data = await getJuridicPlaylists(searchTerm);
        setPlaylists(data);
        setTopics(TOPICS_MAP[selectedArea] || []);
      } catch (error) {
        console.error("Error fetching playlists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [selectedArea]);

  const handlePlaylistClick = async (playlistId: string) => {
    try {
      const videosData = await getPlaylistVideos(playlistId);
      setVideos(videosData);
      setSelectedVideo(videosData[0] || null);
      setActiveTab("videos");
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const generateAIResponse = (type: string) => {
    if (!selectedVideo) return;
    
    // This would be implemented with a real AI service
    alert(`Gerando ${type} para o vídeo: ${selectedVideo.title}`);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Vídeo-aulas</h1>
        <p className="text-muted-foreground">
          Assista vídeo-aulas de diversos temas jurídicos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Área do Direito</h3>
            <AreaSelector
              areas={LEGAL_AREAS}
              selectedArea={selectedArea}
              onAreaSelect={setSelectedArea}
            />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tópicos de {selectedArea}</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto">
              <div className="space-y-1">
                {topics.map((topic) => (
                  <Button
                    key={topic}
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => setSearchTerm(topic)}
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Mais recentes
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Mais assistidos
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Por professor
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="mb-4 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              className="pl-10" 
              placeholder="Buscar por título, tema ou professor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="playlists">Playlists</TabsTrigger>
              <TabsTrigger value="videos" disabled={videos.length === 0}>Vídeos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="playlists">
              {loading ? (
                <div className="text-center py-12">
                  <p>Carregando playlists...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {playlists
                    .filter(playlist => 
                      playlist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      playlist.description.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((playlist) => (
                      <Card key={playlist.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => handlePlaylistClick(playlist.id)}>
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={playlist.thumbnail || "/placeholder.svg"} 
                            alt={playlist.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardHeader>
                          <CardTitle className="text-base">{playlist.title}</CardTitle>
                          <CardDescription>
                            {playlist.channelTitle} • {playlist.videoCount} vídeos
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <Button variant="outline" className="w-full">
                            Ver Playlist
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              )}
              
              {!loading && playlists.filter(p => 
                p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhuma playlist encontrada para "{searchTerm}"</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                  >
                    Limpar filtro
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="videos">
              {selectedVideo && (
                <div className="space-y-4 mb-6">
                  <VideoPlayer videoId={selectedVideo.id} />
                  
                  <div>
                    <h2 className="text-xl font-bold">{selectedVideo.title}</h2>
                    <p className="text-muted-foreground">
                      {selectedVideo.channelTitle} • {selectedVideo.publishedAt?.split('T')[0]}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button variant="outline" size="sm" onClick={() => generateAIResponse("resumo")}>
                      <FileText className="mr-2 h-4 w-4" />
                      Gerar Resumo
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => generateAIResponse("mapa")}>
                      <Brain className="mr-2 h-4 w-4" />
                      Mapa Mental
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => generateAIResponse("anotações")}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Anotações
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => generateAIResponse("dúvidas")}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Tirar Dúvidas
                    </Button>
                  </div>
                  
                  <div>
                    <p className="whitespace-pre-line">{selectedVideo.description}</p>
                  </div>
                </div>
              )}
              
              <h3 className="font-semibold mb-3">Mais vídeos desta playlist</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos
                  .filter(video => 
                    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    video.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((video) => (
                    <Card key={video.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedVideo(video)}>
                      <div className="relative">
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={video.thumbnail || "/placeholder.svg"} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs">
                          {video.duration}
                        </div>
                      </div>
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm line-clamp-2">{video.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {video.channelTitle}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
              </div>
              
              {videos.filter(v => 
                v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.description.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum vídeo encontrado para "{searchTerm}"</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                  >
                    Limpar filtro
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VideoAulas;
