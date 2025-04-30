import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { InteractiveVideoPlayer } from "@/components/videoaulas/InteractiveVideoPlayer";
import Layout from "@/components/Layout";
import { 
  Dialog,
  DialogContent, 
  DialogDescription, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface VideoAula {
  id: string;
  title: string;
  description: string;
  video_id: string;
  area: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
}

interface VideoQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  timestamp: number;
  video_id: string;
}

export function VideoAulasInterativas() {
  const [videoAulas, setVideoAulas] = useState<VideoAula[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoAula | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [currentQuestion, setCurrentQuestion] = useState<VideoQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStats, setQuestionStats] = useState({
    total: 0,
    correct: 0,
    percentage: 0
  });
  const [areaFilter, setAreaFilter] = useState<string | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  
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

      // Map to VideoAula interface
      const mappedAulas: VideoAula[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        video_id: item.url.split('v=')[1] || item.url,
        area: item.area,
        tags: item.tags || [],
        created_at: item.created_at,
        updated_at: item.created_at,
        thumbnail_url: item.thumbnail_url || `https://img.youtube.com/vi/${item.url.split('v=')[1] || item.url}/hqdefault.jpg`
      }));

      setVideoAulas(mappedAulas);
      
      // Extract unique areas
      const uniqueAreas = Array.from(new Set(mappedAulas.map(aula => aula.area)))
        .filter(Boolean) as string[];
      setAreas(uniqueAreas);
      
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
    // Reset question stats
    setQuestionStats({
      total: 0,
      correct: 0,
      percentage: 0
    });
  };

  const handleBackToList = () => {
    setSelectedVideo(null);
    setActiveTab("list");
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setHasAnswered(false);
  };

  const handleQuestionAppear = (question: any) => {
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setIsCorrect(false);
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    setHasAnswered(true);
    const correct = selectedAnswer === currentQuestion.correct_answer;
    setIsCorrect(correct);
    
    // Update stats
    setQuestionStats(prev => {
      const newCorrect = prev.correct + (correct ? 1 : 0);
      const newTotal = prev.total + 1;
      return {
        total: newTotal,
        correct: newCorrect,
        percentage: Math.round((newCorrect / newTotal) * 100)
      };
    });
    
    // Save user response to database
    if (supabase.auth.getUser()) {
      try {
        const { error } = await supabase
          .from('user_question_responses')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            question_id: currentQuestion.id,
            answer: selectedAnswer,
            is_correct: correct
          });
          
        if (error) throw error;
        
      } catch (err) {
        console.error("Error saving question response:", err);
      }
    }
  };

  const handleContinueVideo = () => {
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setHasAnswered(false);
  };

  const handleAreaFilter = (area: string) => {
    setAreaFilter(area === areaFilter ? null : area);
  };

  const filteredVideoAulas = videoAulas.filter(video => {
    const matchesSearch = !searchTerm ||
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesArea = !areaFilter || video.area === areaFilter;
    
    return matchesSearch && matchesArea;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Vídeo-aulas Interativas</h1>
          <p className="text-muted-foreground">
            Assista aulas com perguntas interativas que testam seu conhecimento em tempo real
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="list" className="flex-1 sm:flex-none">Lista de Aulas</TabsTrigger>
            {selectedVideo && (
              <TabsTrigger value="player" className="flex-1 sm:flex-none">
                Assistir Aula
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Buscar por título, descrição ou área..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {areas.length > 0 && (
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
            )}

            {filteredVideoAulas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVideoAulas.map(video => (
                  <Card
                    key={video.id}
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-all"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="aspect-video w-full relative overflow-hidden">
                      <img
                        src={video.thumbnail_url || `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="bg-black/70 text-white">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Interativo
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-2">{video.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Badge variant="outline">{video.area}</Badge>
                        {video.tags && video.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {video.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
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
                  {searchTerm || areaFilter ? "Nenhuma aula encontrada para sua busca." : "Nenhuma aula disponível."}
                </p>
                {(searchTerm || areaFilter) && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setAreaFilter(null);
                    }}
                    className="mt-2"
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="player">
            {selectedVideo ? (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <Button variant="outline" onClick={handleBackToList} className="mr-auto">
                    Voltar para a lista
                  </Button>
                  
                  {questionStats.total > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant={questionStats.percentage >= 70 ? "default" : 
                                    questionStats.percentage >= 40 ? "secondary" : "destructive"}>
                        <Trophy className="h-3 w-3 mr-1" />
                        {questionStats.correct}/{questionStats.total} ({questionStats.percentage}%)
                      </Badge>
                    </div>
                  )}
                </div>
                
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

        <Dialog open={!!currentQuestion} onOpenChange={(open) => !open && handleContinueVideo()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Pergunta Interativa</DialogTitle>
              <DialogDescription className="text-base">
                {currentQuestion?.question}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {currentQuestion?.options && (
                <RadioGroup
                  value={selectedAnswer || ""}
                  onValueChange={setSelectedAnswer}
                  disabled={hasAnswered}
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className={`flex items-center space-x-2 p-2 rounded-md ${
                      hasAnswered && option === currentQuestion.correct_answer 
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : hasAnswered && option === selectedAnswer 
                          ? 'bg-red-50 dark:bg-red-900/20' 
                          : ''
                    }`}>
                      <RadioGroupItem 
                        value={option} 
                        id={`option-${index}`} 
                        disabled={hasAnswered}
                      />
                      <Label 
                        htmlFor={`option-${index}`}
                        className="w-full cursor-pointer"
                      >
                        {option}
                      </Label>
                      {hasAnswered && option === currentQuestion.correct_answer && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {hasAnswered && option === selectedAnswer && option !== currentQuestion.correct_answer && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              {hasAnswered && (
                <div className={`mt-4 p-3 ${isCorrect ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'} rounded-md`}>
                  <p className="font-semibold mb-1">{isCorrect ? 'Resposta correta!' : 'Resposta incorreta'}</p>
                  <p className="text-sm">{currentQuestion?.explanation}</p>
                </div>
              )}
            </div>
            
            <DialogFooter className="sm:justify-between flex gap-2">
              <div className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {Math.floor(currentQuestion?.timestamp || 0 / 60)}:{String(Math.floor(currentQuestion?.timestamp || 0 % 60)).padStart(2, '0')}
              </div>
              
              {!hasAnswered ? (
                <Button 
                  onClick={handleAnswerSubmit} 
                  disabled={!selectedAnswer}
                >
                  Responder
                </Button>
              ) : (
                <Button onClick={handleContinueVideo}>
                  Continuar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

export default VideoAulasInterativas;
