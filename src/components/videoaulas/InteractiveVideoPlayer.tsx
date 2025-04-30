
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VideoPlayer } from "@/components/VideoPlayer";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, Book, Play } from "lucide-react";
import { getVideoTranscript, generateQuestionsForVideo } from "@/lib/youtube-service";

interface InteractiveVideoPlayerProps {
  videoId: string;
  onQuestionAppear: (question: any) => void;
}

export function InteractiveVideoPlayer({ videoId, onQuestionAppear }: InteractiveVideoPlayerProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [playerRef, setPlayerRef] = useState<YT.Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoTitle, setVideoTitle] = useState("");
  const [userResponses, setUserResponses] = useState<{[key: string]: boolean}>({});
  const [videoEnded, setVideoEnded] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const questionsShown = useRef<{[key: string]: boolean}>({});

  useEffect(() => {
    loadQuestions();
    setVideoEnded(false);
    questionsShown.current = {};
  }, [videoId]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("video_questions")
        .select("*")
        .eq("video_id", videoId)
        .order("timestamp");

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        // No questions found, check if we should generate some
        setLoadingQuestions(true);
        try {
          // First get transcript
          const videoTranscript = await getVideoTranscript(videoId);
          setTranscript(videoTranscript);
          
          // Generate questions
          const generatedData = await generateQuestionsForVideo(videoId, videoTranscript);
          
          if (generatedData?.questions) {
            toast.success(`Criamos ${generatedData.questions.length} perguntas para esta aula!`);
            
            // Fetch the questions that were just added to the database
            const { data: newQuestions } = await supabase
              .from("video_questions")
              .select("*")
              .eq("video_id", videoId)
              .order("timestamp");
              
            if (newQuestions) {
              setQuestions(newQuestions);
            }
          }
        } catch (genError) {
          console.error("Error generating questions:", genError);
          toast.error("Não foi possível gerar perguntas para este vídeo");
        } finally {
          setLoadingQuestions(false);
        }
      }

      if (supabase.auth.getUser()) {
        const { data: responseData } = await supabase
          .from("user_question_responses")
          .select("question_id, is_correct")
          .in(
            "question_id", 
            data ? data.map(q => q.id) : []
          );

        if (responseData) {
          const responses = responseData.reduce((acc: {[key: string]: boolean}, curr) => {
            acc[curr.question_id] = curr.is_correct;
            return acc;
          }, {});
          setUserResponses(responses);
        }
      }
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Erro ao carregar perguntas para este vídeo");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
    
    const question = questions.find(
      q => !questionsShown.current[q.id] && Math.abs(q.timestamp - time) < 2
    );

    if (question) {
      questionsShown.current[question.id] = true;
      
      if (playerRef) {
        playerRef.pauseVideo();
      }
      
      onQuestionAppear(question);
    }
  }, [questions, playerRef, onQuestionAppear]);

  const handleVideoStateChange = (event: YT.PlayerStateChangeEvent) => {
    if (event.data === 0) {
      setVideoEnded(true);
    }
  };

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=AIzaSyC_vdQ6MShNiZo60KK2sHO-lgMhUda1woE`
        );
        
        if (!response.ok) {
          throw new Error('Erro ao buscar informações do vídeo');
        }
        
        const data = await response.json();
        if (data.items && data.items[0]) {
          setVideoTitle(data.items[0].snippet.title);
        }
      } catch (error) {
        console.error('Error fetching video info:', error);
      }
    };

    if (videoId) {
      fetchVideoData();
    }
  }, [videoId]);

  const calculateStats = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(userResponses).length;
    const correctAnswers = Object.values(userResponses).filter(Boolean).length;
    
    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      percentageCorrect: totalQuestions > 0 ? 
        Math.round((correctAnswers / totalQuestions) * 100) : 0,
      percentageCompleted: totalQuestions > 0 ? 
        Math.round((answeredQuestions / totalQuestions) * 100) : 0
    };
  };

  const loadTranscript = async () => {
    if (transcript) {
      setShowTranscript(!showTranscript);
      return;
    }
    
    try {
      const videoTranscript = await getVideoTranscript(videoId);
      setTranscript(videoTranscript);
      setShowTranscript(true);
    } catch (error) {
      console.error("Error loading transcript:", error);
      toast.error("Não foi possível carregar a transcrição deste vídeo");
    }
  };

  const generateMoreQuestions = async () => {
    setLoadingQuestions(true);
    try {
      // Make sure we have a transcript
      const videoTranscript = transcript || await getVideoTranscript(videoId);
      if (!transcript) {
        setTranscript(videoTranscript);
      }
      
      // Generate questions
      const generatedData = await generateQuestionsForVideo(videoId, videoTranscript);
      
      if (generatedData?.questions) {
        toast.success(`Geramos ${generatedData.questions.length} perguntas adicionais!`);
        
        // Fetch all questions for this video
        const { data: allQuestions } = await supabase
          .from("video_questions")
          .select("*")
          .eq("video_id", videoId)
          .order("timestamp");
          
        if (allQuestions) {
          setQuestions(allQuestions);
        }
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Não foi possível gerar novas perguntas");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="aspect-video w-full">
          <VideoPlayer 
            videoId={videoId}
            onTimeUpdate={handleTimeUpdate}
            onStateChange={handleVideoStateChange}
            setPlayerRef={setPlayerRef}
          />
        </div>
        
        <CardFooter className="p-4 flex flex-col space-y-4">
          <div className="w-full flex flex-wrap justify-between items-center gap-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {questions.length} perguntas
              </Badge>
              <Badge variant="outline">
                {stats.answeredQuestions} respondidas
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadTranscript}
                className="flex items-center gap-1"
              >
                <Book className="h-4 w-4" />
                {showTranscript ? "Ocultar transcrição" : "Ver transcrição"}
              </Button>
            </div>
            <Badge 
              variant={stats.percentageCorrect >= 70 ? "default" : 
                    stats.percentageCorrect >= 40 ? "secondary" : "destructive"}
            >
              {stats.correctAnswers} corretas ({stats.percentageCorrect}%) 
            </Badge>
          </div>
          
          {!loading && questions.length > 0 && (
            <Progress 
              value={stats.percentageCompleted} 
              className="h-4"
              color={
                stats.percentageCorrect >= 70 ? "bg-green-500" :
                stats.percentageCorrect >= 40 ? "bg-yellow-500" :
                "bg-red-500"
              }
            />
          )}
          
          {loadingQuestions && (
            <div className="text-center py-2">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <span className="ml-2">Gerando perguntas...</span>
            </div>
          )}
        </CardFooter>
      </Card>
      
      {showTranscript && transcript && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Transcrição</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowTranscript(false)}
              >
                Fechar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] overflow-y-auto">
              <p className="whitespace-pre-line">{transcript}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {videoEnded && (
        <Card>
          <CardHeader>
            <CardTitle>Seu desempenho neste vídeo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span>Perguntas respondidas:</span>
                  <span className="font-semibold">{stats.answeredQuestions} de {stats.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Respostas corretas:</span>
                  <span className="font-semibold">{stats.correctAnswers} ({stats.percentageCorrect}%)</span>
                </div>
              </div>
              
              <Progress 
                value={stats.percentageCorrect} 
                className={cn("h-4", {
                  "bg-green-500": stats.percentageCorrect >= 70,
                  "bg-yellow-500": stats.percentageCorrect >= 40 && stats.percentageCorrect < 70,
                  "bg-red-500": stats.percentageCorrect < 40
                })}
              />
              
              <p className="text-center pt-2">
                {stats.percentageCorrect >= 70 
                  ? "Excelente! Você dominou bem o conteúdo deste vídeo." 
                  : stats.percentageCorrect >= 40 
                  ? "Bom trabalho! Continue estudando para melhorar." 
                  : "Continue estudando este tema para melhorar seu desempenho."}
              </p>
              
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={generateMoreQuestions}
                  disabled={loadingQuestions}
                >
                  {loadingQuestions ? (
                    <>
                      <span className="mr-2">Gerando...</span>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Gerar mais perguntas
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
