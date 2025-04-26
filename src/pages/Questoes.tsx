import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuestionCard } from "@/components/questoes/QuestionCard";
import { QuestionStats } from "@/components/questoes/QuestionStats";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Questoes = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 1;

  const { data: questions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questoes")
        .select("*");
      
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

  if (isLoadingQuestions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentQuestion = questions?.[currentPage];

  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Banco de Questões</h1>
        <p>Nenhuma questão disponível no momento.</p>
      </div>
    );
  }

  const respostas = {
    'A': currentQuestion.AnswerA,
    'B': currentQuestion.AnswerB,
    'C': currentQuestion.AnswerC,
    'D': currentQuestion.AnswerD,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Banco de Questões</h1>
      
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <QuestionCard
            id={currentQuestion.id}
            area={currentQuestion.Area}
            tema={currentQuestion.Tema}
            pergunta={currentQuestion.QuestionType || ""}
            respostas={respostas}
            respostaCorreta={currentQuestion.CorrectAnswers}
            onAnswer={handleAnswer}
          />
          
          <div className="flex justify-between">
            <Button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              Anterior
            </Button>
            <Button
              onClick={() => setCurrentPage(p => Math.min((questions?.length || 0) - 1, p + 1))}
              disabled={currentPage === (questions?.length || 0) - 1}
            >
              Próxima
            </Button>
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
