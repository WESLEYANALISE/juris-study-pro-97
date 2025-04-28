
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InteractiveVideoPlayer } from "@/components/videoaulas/InteractiveVideoPlayer";
import { QuestionModal } from "@/components/videoaulas/QuestionModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function VideoAulasInterativas() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
      if (!id) {
        navigate("/videoaulas");
        return;
      }
      setVideoId(id);
      await ensureQuestionsExist(id);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o vídeo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const ensureQuestionsExist = async (videoId: string) => {
    const { data: existing } = await supabase
      .from("video_questions")
      .select("id")
      .eq("video_id", videoId)
      .limit(1);

    if (!existing?.length) {
      await generateQuestions(videoId);
    }
  };

  const generateQuestions = async (videoId: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-video-questions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate questions");
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
    });

    toast({
      title: isCorrect ? "Correto!" : "Incorreto",
      description: currentQuestion.explanation,
      variant: isCorrect ? "default" : "destructive",
    });

    setCurrentQuestion(null);
  };

  if (loading) {
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

      {videoId && (
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
