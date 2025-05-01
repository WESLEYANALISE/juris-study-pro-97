import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FixedVideoPlayer } from '@/components/videoaulas/FixedVideoPlayer';
import { SearchIcon } from "lucide-react";
import { getJuridicPlaylists, getPlaylistVideos, type YouTubePlaylist, type YouTubeVideo } from "@/lib/youtube-service";
import { VideoCard } from "@/components/videoaulas/VideoCard";
import { VideoFilter } from "@/components/videoaulas/VideoFilter";
import { AITools } from "@/components/videoaulas/AITools";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const LEGAL_AREAS = ["Constitucional", "Civil", "Penal", "Administrativo", "Processual Civil", "Processual Penal", "Trabalho", "Tributário", "Empresarial", "Ambiental", "Internacional", "Consumidor"];

const TOPICS_MAP: Record<string, string[]> = {
  "Constitucional": ["Controle de Constitucionalidade", "Direitos Fundamentais", "Organização do Estado", "Poder Judiciário", "Sistema Tributário"],
  "Civil": ["Parte Geral", "Obrigações", "Contratos", "Responsabilidade Civil", "Direito das Coisas", "Família e Sucessões"],
  "Penal": ["Teoria do Delito", "Penas", "Crimes contra a Pessoa", "Crimes contra o Patrimônio", "Execução Penal"],
  "Administrativo": ["Princípios", "Atos Administrativos", "Licitações", "Servidores Públicos", "Bens Públicos"],
  "Processual Civil": ["Jurisdição e Competência", "Partes e Procuradores", "Processo de Conhecimento", "Recursos", "Execução"],
  "Processual Penal": ["Inquérito Policial", "Ação Penal", "Provas", "Prisão e Medidas Cautelares", "Recursos"],
  "Trabalho": ["Contrato de Trabalho", "Jornada de Trabalho", "Rescisão", "Direitos Trabalhistas", "Processo do Trabalho"],
  "Tributário": ["Princípios", "Impostos", "Obrigação Tributária", "Crédito Tributário", "Processo Tributário"],
  "Empresarial": ["Sociedades Empresárias", "Títulos de Crédito", "Falência e Recuperação", "Propriedade Intelectual", "Contratos Empresariais"],
  "Ambiental": ["Princípios", "Licenciamento Ambiental", "Responsabilidade Ambiental", "Áreas Protegidas", "Crimes Ambientais"],
  "Internacional": ["Tratados Internacionais", "Direitos Humanos", "Comércio Internacional", "Nacionalidade", "Organizações Internacionais"],
  "Consumidor": ["Conceitos Básicos", "Responsabilidade", "Práticas Abusivas", "Proteção Contratual", "Defesa do Consumidor em Juízo"]
};

const VideoAulas = () => {
  const [selectedArea, setSelectedArea] = useState<string>("Constitucional");
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(false);
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
        setSelectedTopic(undefined); // Reset topic when area changes
      } catch (error) {
        console.error("Error fetching playlists:", error);
        toast.error("Erro ao carregar playlists. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, [selectedArea]);

  const handlePlaylistClick = async (playlistId: string) => {
    setLoadingVideos(true);
    try {
      const videosData = await getPlaylistVideos(playlistId);
      setVideos(videosData);
      setSelectedVideo(videosData[0] || null);
      setActiveTab("videos");
      
      // Smooth scroll to top on mobile
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Erro ao carregar vídeos. Tente novamente mais tarde.");
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic === selectedTopic ? undefined : topic);
    setSearchTerm(topic === selectedTopic ? "" : topic);
  };

  const filteredPlaylists = playlists.filter(playlist => {
    const matchesSearch = !searchTerm || 
      playlist.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      playlist.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const filteredVideos = videos.filter(video => {
    const matchesSearch = !searchTerm || 
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      video.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold">Vídeo-aulas</h1>
        <p className="text-muted-foreground">
          Assista vídeo-aulas de diversos temas jurídicos
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <VideoFilter 
            areas={LEGAL_AREAS}
            selectedArea={selectedArea}
            onAreaSelect={setSelectedArea}
            topics={topics}
            selectedTopic={selectedTopic}
            onTopicSelect={handleTopicSelect}
          />

          {activeTab === "videos" && selectedVideo && (
            <div className="hidden lg:block">
              <AITools videoTitle={selectedVideo.title} videoId={selectedVideo.id} />
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="mb-4 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              className="pl-10" 
              placeholder="Buscar por título, tema ou professor..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="playlists">Playlists</TabsTrigger>
              <TabsTrigger value="videos" disabled={videos.length === 0}>Vídeos</TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              <TabsContent value="playlists">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array(6).fill(0).map((_, idx) => (
                      <div key={idx} className="rounded-lg overflow-hidden border">
                        <Skeleton className="h-[150px] w-full" />
                        <div className="p-4">
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2 mb-4" />
                          <Skeleton className="h-9 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredPlaylists.length > 0 ? (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {filteredPlaylists.map(playlist => (
                      <motion.div
                        key={playlist.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="cursor-pointer hover:shadow-md transition-shadow rounded-lg overflow-hidden border"
                        onClick={() => handlePlaylistClick(playlist.id)}
                      >
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={playlist.thumbnail || "/placeholder.svg"} 
                            alt={playlist.title} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-1 line-clamp-1">{playlist.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {playlist.channelTitle} • {playlist.videoCount} vídeos
                          </p>
                          <Button className="w-full">
                            Ver Playlist
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Nenhuma playlist encontrada para "{searchTerm}".</p>
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Limpar filtro
                    </Button>
                  </div>
                )}
              </TabsContent>
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
              <TabsContent value="videos">
                {loadingVideos ? (
                  <div className="space-y-4">
                    <Skeleton className="w-full h-[350px] rounded-lg" />
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Array(4).fill(0).map((_, idx) => (
                        <Skeleton key={idx} className="h-8 rounded-md" />
                      ))}
                    </div>
                  </div>
                ) : selectedVideo ? (
                  <div className="space-y-6">
                    <div className="rounded-lg overflow-hidden">
                      <FixedVideoPlayer
                        videoId={selectedVideo.videoId}
                        autoplay={true}
                        onReady={() => console.log('Video ready')}
                        onError={(err) => console.error('Video error:', err)}
                      />
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-bold mb-1">{selectedVideo.title}</h2>
                      <p className="text-muted-foreground">
                        {selectedVideo.channelTitle} • {selectedVideo.publishedAt?.split('T')[0]}
                      </p>
                    </div>
                    
                    {/* Mobile AI Tools */}
                    <div className="lg:hidden">
                      <AITools videoTitle={selectedVideo.title} videoId={selectedVideo.id} />
                    </div>
                    
                    <div>
                      <p className="whitespace-pre-line text-sm">{selectedVideo.description}</p>
                    </div>
                  </div>
                ) : null}
                
                <div className="mt-8">
                  <h3 className="font-semibold mb-3">Mais vídeos desta playlist</h3>
                  
                  {filteredVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredVideos.map(video => (
                        <VideoCard
                          key={video.id}
                          video={video}
                          isSelected={selectedVideo?.id === video.id}
                          onClick={() => setSelectedVideo(video)}
                          searchTerm={searchTerm}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Nenhum vídeo encontrado para "{searchTerm}".</p>
                      <Button variant="outline" onClick={() => setSearchTerm("")}>
                        Limpar filtro
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VideoAulas;
