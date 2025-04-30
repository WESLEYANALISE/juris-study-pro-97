
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Sparkles,
  Search,
  User,
  BookmarkCheck,
  Play,
  Shield
} from "lucide-react";
import { YouTubeVideo, YouTubePlaylist, searchVideos } from "@/lib/youtube-service";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const RECOMMENDED_TOPICS = [
  "Direito Constitucional - Fundamentos",
  "Contratos Civis",
  "Direito Penal",
  "Direito Administrativo Essencial",
  "Processo Civil Básico",
  "Direito do Trabalho",
  "Direito Tributário",
  "Direito Empresarial Introdução"
];

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
  "Consumidor",
  "Internacional",
  "Previdenciário",
  "Eleitoral"
];

export function VideoAulasRecomendacoes() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [trendingVideos, setTrendingVideos] = useState<YouTubeVideo[]>([]);
  const [recommendedVideos, setRecommendedVideos] = useState<YouTubeVideo[]>([]);
  const [recentVideos, setRecentVideos] = useState<YouTubeVideo[]>([]);
  const [activeTab, setActiveTab] = useState("recomendados");
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [searching, setSearching] = useState(false);
  const [preferredAreas, setPreferredAreas] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      // Fetch user preferences if logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Try to get user preferences
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
          
        if (profileData) {
          // Get preferred areas from plano_estudos
          const { data: planData } = await supabase
            .from('plano_estudos')
            .select('area_interesse')
            .eq('user_id', user.id)
            .single();
            
          if (planData && planData.area_interesse && planData.area_interesse.length > 0) {
            setPreferredAreas(planData.area_interesse);
          } else {
            // Default to some common areas
            setPreferredAreas(['Constitucional', 'Civil', 'Penal']);
          }
        }
      }
      
      // Fetch trending videos
      const trendingPromises = RECOMMENDED_TOPICS.slice(0, 3).map(topic => searchVideos(topic));
      const trendingResults = await Promise.all(trendingPromises);
      setTrendingVideos(trendingResults.flat().slice(0, 6));
      
      // Fetch recommended videos based on preferred areas
      let areas = preferredAreas.length > 0 ? preferredAreas : ['Constitucional', 'Civil', 'Penal'];
      const recommendPromises = areas.slice(0, 3).map(area => searchVideos(`Direito ${area}`));
      const recommendResults = await Promise.all(recommendPromises);
      setRecommendedVideos(recommendResults.flat().slice(0, 6));
      
      // Fetch recent videos
      const recentPromises = ['novidades direito', 'atualidades jurídicas'].map(query => searchVideos(query));
      const recentResults = await Promise.all(recentPromises);
      setRecentVideos(recentResults.flat().slice(0, 6));
      
    } catch (error) {
      console.error("Error loading recommendations:", error);
      toast.error("Erro ao carregar recomendações. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearching(true);
    try {
      const results = await searchVideos(searchTerm);
      setSearchResults(results);
      setActiveTab("search");
    } catch (error) {
      console.error("Error searching videos:", error);
      toast.error("Erro na pesquisa. Por favor, tente novamente.");
    } finally {
      setSearching(false);
    }
  };

  const handleVideoClick = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    
    // Log view in database if user is logged in
    const logVideoView = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await supabase
            .from('user_video_progress')
            .upsert({
              user_id: user.id,
              video_id: video.id,
              watched_seconds: 0,
              last_watched_at: new Date().toISOString()
            });
        }
      } catch (error) {
        console.error("Error logging video view:", error);
      }
    };
    
    logVideoView();
  };

  const renderVideoCard = (video: YouTubeVideo) => (
    <Card
      key={video.id}
      className="overflow-hidden cursor-pointer hover:shadow-md transition-all"
      onClick={() => handleVideoClick(video)}
    >
      <div className="aspect-video w-full relative overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute bottom-2 right-2">
          <Badge variant="secondary" className="bg-black/70 text-white">
            {video.duration || "Video"}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 mb-1">{video.title}</h3>
        <p className="text-sm text-muted-foreground">{video.channelTitle}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(video.publishedAt).toLocaleDateString('pt-BR')}
        </p>
      </CardContent>
    </Card>
  );

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Recomendações de Vídeos</h1>
        <p className="text-muted-foreground">
          Vídeos selecionados para complementar seus estudos
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-6">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Buscar vídeos jurídicos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={searching || !searchTerm.trim()}
              className="shrink-0"
            >
              {searching ? (
                <span className="flex items-center">
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full"></div>
                  Buscando
                </span>
              ) : (
                <span className="flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </span>
              )}
            </Button>
          </div>
          
          {selectedVideo ? (
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <Button 
                  variant="ghost"
                  className="p-0 h-auto mb-2"
                  onClick={() => setSelectedVideo(null)}
                >
                  ← Voltar para a lista
                </Button>
                <CardTitle>{selectedVideo.title}</CardTitle>
                <CardDescription>{selectedVideo.channelTitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full">
                  <VideoPlayer videoId={selectedVideo.id} />
                </div>
                <div className="mt-4">
                  <p className="whitespace-pre-line text-sm">{selectedVideo.description}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="recomendados" className="flex gap-1 items-center">
                  <User className="h-4 w-4" />
                  <span>Para você</span>
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex gap-1 items-center">
                  <TrendingUp className="h-4 w-4" />
                  <span>Tendências</span>
                </TabsTrigger>
                <TabsTrigger value="recentes" className="flex gap-1 items-center">
                  <Clock className="h-4 w-4" />
                  <span>Recentes</span>
                </TabsTrigger>
                {searchResults.length > 0 && (
                  <TabsTrigger value="search" className="flex gap-1 items-center">
                    <Search className="h-4 w-4" />
                    <span>Resultados</span>
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="recomendados" className="mt-4">
                <h2 className="text-xl font-semibold mb-4">Recomendações para você</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedVideos.map(video => renderVideoCard(video))}
                </div>
              </TabsContent>
              
              <TabsContent value="trending" className="mt-4">
                <h2 className="text-xl font-semibold mb-4">Tendências em Direito</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingVideos.map(video => renderVideoCard(video))}
                </div>
              </TabsContent>
              
              <TabsContent value="recentes" className="mt-4">
                <h2 className="text-xl font-semibold mb-4">Adicionados recentemente</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentVideos.map(video => renderVideoCard(video))}
                </div>
              </TabsContent>
              
              <TabsContent value="search" className="mt-4">
                <h2 className="text-xl font-semibold mb-4">Resultados da busca</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map(video => renderVideoCard(video))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
        
        <div className="md:w-1/3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Áreas Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {LEGAL_AREAS.map(area => (
                  <Badge 
                    key={area} 
                    variant="outline"
                    className={preferredAreas.includes(area) ? "border-primary" : ""}
                  >
                    {preferredAreas.includes(area) && (
                      <BookmarkCheck className="h-3 w-3 mr-1 text-primary" />
                    )}
                    {area}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/perfil')}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Personalizar recomendações
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Certificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Complete aulas e ganhe certificados para comprovar seus conhecimentos.
              </p>
              <Button
                className="w-full"
                variant="default"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar certificação
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Tópicos em Alta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {RECOMMENDED_TOPICS.slice(0, 5).map((topic, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{index + 1}.</span>
                  <span className="text-sm">{topic}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default VideoAulasRecomendacoes;
