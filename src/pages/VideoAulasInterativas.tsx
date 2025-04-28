import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { InteractiveVideoPlayer } from "@/components/videoaulas/InteractiveVideoPlayer";

interface VideoAula {
  id: string;
  title: string;
  description: string;
  video_id: string;
  area: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export function VideoAulasInterativas() {
  const [videoAulas, setVideoAulas] = useState<VideoAula[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoAula | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadVideoAulas();
  }, []);

  const loadVideoAulas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('video_aulas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setVideoAulas(data || []);
    } catch (error) {
      console.error("Error loading video aulas:", error);
      toast.error("Erro ao carregar aulas interativas. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video: VideoAula) => {
    setSelectedVideo(video);
    setActiveTab("player");
  };

  const handleBackToList = () => {
    setSelectedVideo(null);
    setActiveTab("list");
  };

  const handleQuestionAppear = (question: any) => {
    setCurrentQuestion(question);
  };

  const handleCloseQuestion = () => {
    setCurrentQuestion(null);
  };

  const filteredVideoAulas = videoAulas.filter(video => {
    const matchesSearch = !searchTerm ||
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Lista de Aulas</TabsTrigger>
          {selectedVideo && (
            <TabsTrigger value="player">
              Assistir Aula
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="relative">
            <Input
              type="search"
              placeholder="Buscar por título, descrição ou área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredVideoAulas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideoAulas.map(video => (
                <Card
                  key={video.id}
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleVideoClick(video)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-2">{video.title}</CardTitle>
                    <CardDescription>
                      {video.area}
                      {video.tags && video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {video.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                          {video.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{video.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {video.description.substring(0, 150)}...
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhuma aula encontrada para sua busca." : "Nenhuma aula disponível."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="player">
          {selectedVideo ? (
            <div className="space-y-4">
              <Button onClick={handleBackToList}>Voltar para a lista</Button>
              <Card>
                <CardHeader>
                  <CardTitle>{selectedVideo.title}</CardTitle>
                  <CardDescription>{selectedVideo.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <InteractiveVideoPlayer
                    videoId={selectedVideo.video_id}
                    onQuestionAppear={handleQuestionAppear}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Selecione uma aula para assistir.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {currentQuestion && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Pergunta Interativa</CardTitle>
              <CardDescription>{currentQuestion.question}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Aqui você pode adicionar a lógica para exibir as opções de resposta */}
              <p>Opções de resposta aqui...</p>
            </CardContent>
            <Button onClick={handleCloseQuestion}>Fechar</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
