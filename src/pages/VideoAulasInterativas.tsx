
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InteractiveVideoPlayer } from "@/components/videoaulas/InteractiveVideoPlayer";
import { QuestionModal } from "@/components/videoaulas/QuestionModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { VideoSelector } from "@/components/videoaulas/VideoSelector";
import { toast as sonnerToast } from "sonner";

export default function VideoAulasInterativas() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingVideo, setProcessingVideo] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    initializeVideo();
  }, []);

  const initializeVideo = async () => {
    try {
      const videoUrl = new URL(window.location.href);
      const id = videoUrl.searchParams.get("v");
      if (id) {
        setVideoId(id);
        await ensureQuestionsExist(id);
      } else {
        // No video ID in URL, let user select a video first
        setLoading(false);
      }
    } catch (error) {
      console.error("Error initializing video:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o vídeo",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleVideoSelect = async (selectedVideoId: string) => {
    try {
      setProcessingVideo(true);
      await ensureQuestionsExist(selectedVideoId);
      // Navigate to the same page but with the video ID in the URL
      navigate(`/videoaulas-interativas?v=${selectedVideoId}`);
      setVideoId(selectedVideoId);
    } catch (error) {
      console.error("Error processing video:", error);
      sonnerToast.error("Erro ao processar o vídeo. Tente novamente.");
    } finally {
      setProcessingVideo(false);
    }
  };

  const ensureQuestionsExist = async (videoId: string) => {
    // First check if we already have questions for this video
    const { data: existing, error: queryError } = await supabase
      .from("video_questions")
      .select("id")
      .eq("video_id", videoId)
      .limit(1);

    if (queryError) {
      console.error("Error checking for existing questions:", queryError);
      throw new Error("Erro ao verificar questões existentes");
    }

    // If we don't have questions yet, generate them
    if (!existing || existing.length === 0) {
      sonnerToast.info("Gerando perguntas para este vídeo...", {
        duration: 3000,
      });

      // First, check if we have the transcript
      const { data: transcriptData } = await supabase
        .from("video_transcripts")
        .select("transcript")
        .eq("video_id", videoId)
        .single();

      let transcript;
      
      // If no transcript, fetch it first
      if (!transcriptData) {
        const transcriptResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-video-transcript`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ videoId }),
          }
        );

        if (!transcriptResponse.ok) {
          throw new Error("Failed to fetch video transcript");
        }

        const transcriptResult = await transcriptResponse.json();
        transcript = transcriptResult.transcript;

        // Store transcript for future use
        await supabase.from("video_transcripts").insert({
          video_id: videoId,
          transcript: transcript
        });
      } else {
        transcript = transcriptData.transcript;
      }

      // Now generate questions based on the transcript
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-video-questions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ videoId, transcript }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }
    }
  };

  const handleQuestionAppear = (question: any) => {
    setCurrentQuestion(question);
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (!currentQuestion) return;

    const isCorrect = answer === currentQuestion.correct_answer;

    await supabase.from("user_question_responses").insert({
      question_id: currentQuestion.id,
      answer,
      is_correct: isCorrect,
      user_id: supabase.auth.getUser() ? (await supabase.auth.getUser()).data.user?.id : null
    });

    toast({
      title: isCorrect ? "Correto!" : "Incorreto",
      description: currentQuestion.explanation,
      variant: isCorrect ? "default" : "destructive",
    });

    setCurrentQuestion(null);
  };

  if (loading && videoId) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vídeo Aula Interativa</h1>
        <Button variant="outline" onClick={() => navigate("/videoaulas")}>
          Voltar
        </Button>
      </div>

      {!videoId ? (
        <Card>
          <CardHeader>
            <CardTitle>Selecione um vídeo</CardTitle>
            <CardDescription>
              Escolha um vídeo para começar a assistir à aula interativa com
              perguntas automáticas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoSelector
              onVideoSelect={handleVideoSelect} 
              isProcessing={processingVideo}
            />
          </CardContent>
        </Card>
      ) : (
        <InteractiveVideoPlayer
          videoId={videoId}
          onQuestionAppear={handleQuestionAppear}
        />
      )}

      <QuestionModal
        question={currentQuestion}
        onAnswer={handleAnswerSubmit}
        open={!!currentQuestion}
        onOpenChange={() => setCurrentQuestion(null)}
      />
    </div>
  );
}
