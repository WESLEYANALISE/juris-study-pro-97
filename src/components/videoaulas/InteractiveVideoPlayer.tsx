
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { VideoPlayer } from "@/components/VideoPlayer";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  const questionsShown = useRef<{[key: string]: boolean}>({});

  // Load questions when videoId changes
  useEffect(() => {
    loadQuestions();
    setVideoEnded(false);
    questionsShown.current = {};
  }, [videoId]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      // Get questions for this video
      const { data, error } = await supabase
        .from("video_questions")
        .select("*")
        .eq("video_id", videoId)
        .order("timestamp");

      if (error) {
        throw error;
      }

      if (data) {
        setQuestions(data);
      }

      // Also load existing user responses
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

  // Handle time updates from the video player
  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
    
    // Find if there's a question that should be shown at this time
    const question = questions.find(
      q => !questionsShown.current[q.id] && Math.abs(q.timestamp - time) < 2
    );

    if (question) {
      // Mark this question as shown so we don't show it again
      questionsShown.current[question.id] = true;
      
      // Pause the video
      if (playerRef) {
        playerRef.pauseVideo();
      }
      
      // Show the question
      onQuestionAppear(question);
    }
  }, [questions, playerRef, onQuestionAppear]);

  // Handle video state changes
  const handleVideoStateChange = (event: YT.PlayerStateChangeEvent) => {
    // YouTube states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (event.data === 0) { // Using 0 instead of YT.PlayerState.ENDED
      setVideoEnded(true);
    }
  };

  // Get YouTube video info
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=AIzaSyBCPCIV9jUxa4sD6TrlR74q3KTKqDZjoT8`
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

  // Calculate performance statistics
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
        
        {!loading && questions.length > 0 && (
          <CardFooter className="p-4 flex flex-col space-y-2">
            <div className="w-full flex justify-between items-center">
              <div className="flex gap-2">
                <Badge variant="outline">
                  {questions.length} perguntas
                </Badge>
                <Badge variant="outline">
                  {stats.answeredQuestions} respondidas
                </Badge>
              </div>
              <Badge 
                variant={stats.percentageCorrect >= 70 ? "default" : 
                       stats.percentageCorrect >= 40 ? "secondary" : "destructive"}
              >
                {stats.correctAnswers} corretas ({stats.percentageCorrect}%)
              </Badge>
            </div>
            <Progress 
              value={stats.percentageCompleted} 
              className="h-2" 
            />
          </CardFooter>
        )}
      </Card>

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
                className="h-4"
                // Fix the color attribute (we'll use className instead)
                className={`h-4 ${
                  stats.percentageCorrect >= 70 ? "bg-green-500" : 
                  stats.percentageCorrect >= 40 ? "bg-yellow-500" : "bg-red-500"
                }`}
              />
              
              <p className="text-center pt-2">
                {stats.percentageCorrect >= 70 
                  ? "Excelente! Você dominou bem o conteúdo deste vídeo." 
                  : stats.percentageCorrect >= 40 
                  ? "Bom trabalho! Continue estudando para melhorar." 
                  : "Continue estudando este tema para melhorar seu desempenho."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
