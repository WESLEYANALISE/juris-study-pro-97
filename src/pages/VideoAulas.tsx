
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { AnimatedTabs, AnimatedTabsList, AnimatedTabsTrigger, AnimatedTabsContent } from "@/components/ui/animated-tabs";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { MotionCard } from "@/components/ui/motion-card";
import { VideoPlayer } from "@/components/VideoPlayer";
import { SearchIcon, BookOpen, Brain, FileText, MessageSquare } from "lucide-react";
import { getJuridicPlaylists, getPlaylistVideos, type YouTubePlaylist, type YouTubeVideo } from "@/lib/youtube-service";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Legal areas without prefixing "Direito"
const LEGAL_AREAS = ["Constitucional", "Civil", "Penal", "Administrativo", "Processual Civil", "Processual Penal", "Trabalho", "Tributário", "Empresarial", "Ambiental", "Internacional", "Consumidor"];

// Topics within each area
const TOPICS_MAP: Record<string, string[]> = {
  "Constitucional": ["Controle de Constitucionalidade", "Direitos Fundamentais", "Organização do Estado", "Poder Judiciário", "Sistema Tributário"],
  "Civil": ["Parte Geral", "Obrigações", "Contratos", "Responsabilidade Civil", "Direito das Coisas", "Família e Sucessões"],
  "Penal": ["Teoria do Delito", "Penas", "Crimes contra a Pessoa", "Crimes contra o Patrimônio", "Execução Penal"]
  // Add more topics for other areas
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
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

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
        toast.error("Erro ao carregar playlists. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, [selectedArea]);

  useEffect(() => {
    // Generate search suggestions based on searchTerm
    if (searchTerm.length > 2) {
      const allTopics = Object.values(TOPICS_MAP).flat();
      const matchingSuggestions = allTopics
        .filter(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 5);
      setSearchSuggestions(matchingSuggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchTerm]);

  const handlePlaylistClick = async (playlistId: string) => {
    try {
      toast.loading("Carregando vídeos...");
      const videosData = await getPlaylistVideos(playlistId);
      setVideos(videosData);
      setSelectedVideo(videosData[0] || null);
      setActiveTab("videos");
      
      // Scroll to top when changing tabs
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      toast.dismiss();
      toast.success("Vídeos carregados com sucesso!");
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Erro ao carregar vídeos. Tente novamente.");
    }
  };

  const handleVideoSelect = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    // Scroll to top to show the selected video
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateAIResponse = (type: string) => {
    if (!selectedVideo) return;

    // This would be implemented with a real AI service
    toast.success(`Gerando ${type} para o vídeo: ${selectedVideo.title}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    toast(`Buscando por: ${searchTerm}`);
  };

  const handleAreaChange = (area: string) => {
    setSelectedArea(area);
    // Add a subtle animation to highlight the change
    const areaElement = document.getElementById(`area-${area}`);
    if (areaElement) {
      areaElement.classList.add('animate-pulse-subtle');
      setTimeout(() => {
        areaElement.classList.remove('animate-pulse-subtle');
      }, 1000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const filteredPlaylists = playlists.filter(playlist => 
    playlist.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    playlist.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    video.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-0 pb-14 md:pb-6" ref={contentRef}>
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold">Vídeo-aulas</h1>
        <p className="text-muted-foreground">
          Assista vídeo-aulas de diversos temas jurídicos
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-0">
        <motion.div 
          className="lg:col-span-1 space-y-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Áreas</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <div className="space-y-1">
                {LEGAL_AREAS.map(area => (
                  <motion.div key={area} whileTap={{ scale: 0.97 }}>
                    <Button 
                      id={`area-${area}`}
                      variant={selectedArea === area ? "default" : "ghost"} 
                      className={`w-full justify-start ${selectedArea === area ? 'shadow-[0_0_10px_rgba(155,135,245,0.5)]' : ''}`}
                      onClick={() => handleAreaChange(area)}
                    >
                      {area}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tópicos de {selectedArea}</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto">
              <div className="space-y-1">
                {topics.map((topic, index) => (
                  <motion.div 
                    key={topic}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-sm" 
                      onClick={() => setSearchTerm(topic)}
                    >
                      {topic}
                    </Button>
                  </motion.div>
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
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Mais recentes
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Mais assistidos
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Por professor
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <SearchInput
              placeholder="Buscar por título, tema ou professor..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              suggestions={searchSuggestions}
              onSuggestionClick={(suggestion) => setSearchTerm(suggestion)}
              onClear={() => setSearchTerm("")}
            />
          </form>

          <AnimatedTabs value={activeTab} onValueChange={setActiveTab}>
            <AnimatedTabsList className="mb-4 w-full">
              <AnimatedTabsTrigger value="playlists" className="flex-1">Playlists</AnimatedTabsTrigger>
              <AnimatedTabsTrigger value="videos" disabled={videos.length === 0} className="flex-1">Vídeos</AnimatedTabsTrigger>
            </AnimatedTabsList>
            
            <AnimatedTabsContent value="playlists" slideDirection="left">
              {loading ? (
                <LoadingSkeleton variant="playlist" count={4} />
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredPlaylists.map((playlist, index) => (
                    <motion.div key={playlist.id} variants={itemVariants} custom={index}>
                      <MotionCard 
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => handlePlaylistClick(playlist.id)}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                          <motion.img 
                            src={playlist.thumbnail || "/placeholder.svg"} 
                            alt={playlist.title} 
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <CardHeader>
                          <CardTitle className="text-base">{playlist.title}</CardTitle>
                          <CardDescription>
                            {playlist.channelTitle} • {playlist.videoCount} vídeos
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
                            <Button variant="outline" className="w-full">
                              Ver Playlist
                            </Button>
                          </motion.div>
                        </CardFooter>
                      </MotionCard>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              
              {!loading && filteredPlaylists.length === 0 && (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-muted-foreground">Nenhuma playlist encontrada para "{searchTerm}"</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => setSearchTerm("")}
                  >
                    Limpar filtro
                  </Button>
                </motion.div>
              )}
            </AnimatedTabsContent>
            
            <AnimatedTabsContent value="videos" slideDirection="right">
              <AnimatePresence mode="wait">
                {selectedVideo && (
                  <motion.div 
                    className="space-y-4 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <VideoPlayer videoId={selectedVideo.id} />
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      <h2 className="text-xl font-bold">{selectedVideo.title}</h2>
                      <p className="text-muted-foreground">
                        {selectedVideo.channelTitle} • {selectedVideo.publishedAt?.split('T')[0]}
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      className="grid grid-cols-2 md:grid-cols-4 gap-2"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => generateAIResponse("resumo")}
                          className="w-full"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Gerar Resumo
                        </Button>
                      </motion.div>
                      <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => generateAIResponse("mapa")}
                          className="w-full"
                        >
                          <Brain className="mr-2 h-4 w-4" />
                          Mapa Mental
                        </Button>
                      </motion.div>
                      <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => generateAIResponse("anotações")}
                          className="w-full"
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Anotações
                        </Button>
                      </motion.div>
                      <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => generateAIResponse("dúvidas")}
                          className="w-full"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Tirar Dúvidas
                        </Button>
                      </motion.div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      <p className="whitespace-pre-line">{selectedVideo.description}</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <h3 className="font-semibold mb-3">Mais vídeos desta playlist</h3>
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredVideos.map((video, index) => (
                  <motion.div 
                    key={video.id} 
                    variants={itemVariants}
                    custom={index}
                  >
                    <MotionCard 
                      className={`cursor-pointer transition-all duration-300 ${selectedVideo?.id === video.id ? 'border-primary shadow-[0_0_10px_rgba(155,135,245,0.5)]' : 'hover:border-primary'}`}
                      onClick={() => handleVideoSelect(video)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative">
                        <div className="aspect-video w-full overflow-hidden">
                          <motion.img 
                            src={video.thumbnail || "/placeholder.svg"} 
                            alt={video.title} 
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
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
                    </MotionCard>
                  </motion.div>
                ))}
              </motion.div>
              
              {filteredVideos.length === 0 && (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-muted-foreground">Nenhum vídeo encontrado para "{searchTerm}"</p>
                  <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                    Limpar filtro
                  </Button>
                </motion.div>
              )}
            </AnimatedTabsContent>
          </AnimatedTabs>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoAulas;
