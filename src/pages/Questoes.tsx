import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuestionCard } from "@/components/questoes/QuestionCard";
import { QuestionStats } from "@/components/questoes/QuestionStats";
import { QuestionSetup } from "@/components/questoes/QuestionSetup";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QuestionConfig {
  area: string;
  temas: string[];
  quantidade: number;
}

const Questoes = () => {
  const [config, setConfig] = useState<{
    area: string;
    temas: string[];
    quantidade: number;
  } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { data: questions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["questions", config],
    enabled: !!config,
    queryFn: async () => {
      let query = supabase
        .from("questoes")
        .select("*, questao_estatisticas(total_tentativas, total_acertos)")
        .eq("Area", config?.area);

      if (config?.temas.length) {
        query = query.in("Tema", config.temas);
      }

      const { data, error } = await query
        .limit(config?.quantidade || 10);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ["question-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_questoes_stats")
        .select("*")
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  const queryClient = useQueryClient();
  const answerMutation = useMutation({
    mutationFn: async ({ questionId, answer, correct }: { questionId: number, answer: string, correct: boolean }) => {
      const { error } = await supabase
        .from("user_questoes")
        .insert({
          questao_id: questionId,
          resposta_selecionada: answer,
          acertou: correct
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-stats"] });
      toast.success("Resposta registrada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao registrar resposta. Tente novamente.");
    }
  });

  const handleAnswer = (questionId: number, answer: string, correct: boolean) => {
    answerMutation.mutate({ questionId, answer, correct });
  };

  const handleNext = () => {
    if (!questions) return;
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setConfig(null);
    setCurrentQuestionIndex(0);
  };

  if (!config) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Banco de Questões</h1>
        <QuestionSetup onStart={setConfig} />
      </div>
    );
  }

  if (isLoadingQuestions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!questions?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Banco de Questões</h1>
        <p>Nenhuma questão disponível para os filtros selecionados.</p>
        <Button onClick={handleReset} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const questionStats = currentQuestion.questao_estatisticas?.[0];
  const percentualAcertos = questionStats?.total_tentativas 
    ? (questionStats.total_acertos / questionStats.total_tentativas * 100).toFixed(1)
    : null;

  const respostas = {
    'A': currentQuestion.AnswerA,
    'B': currentQuestion.AnswerB,
    'C': currentQuestion.AnswerC,
    'D': currentQuestion.AnswerD,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Banco de Questões</h1>
        <Button variant="outline" onClick={handleReset}>
          Voltar ao Menu
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <QuestionCard
            id={currentQuestion.id}
            area={currentQuestion.Area}
            tema={currentQuestion.Tema}
            pergunta={currentQuestion.QuestionText || ""}
            respostas={respostas}
            respostaCorreta={currentQuestion.CorrectAnswers}
            comentario={currentQuestion.CorrectAnswerInfo}
            percentualAcertos={percentualAcertos}
            onAnswer={handleAnswer}
            onNext={currentQuestionIndex < questions.length - 1 ? handleNext : undefined}
          />
          
          <div className="text-sm text-muted-foreground text-center">
            Questão {currentQuestionIndex + 1} de {questions.length}
          </div>
        </div>
        
        <div className="space-y-6">
          <QuestionStats stats={stats} />
        </div>
      </div>
    </div>
  );
};

export default Questoes;
