
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuestionCard } from "@/components/questoes/QuestionCard";
import { QuestionStats } from "@/components/questoes/QuestionStats";
import { QuestionSetup } from "@/components/questoes/QuestionSetup";
import { Loader2, BookOpen, Target, ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTouchGestures } from "@/hooks/use-touch-gestures";

interface QuestionConfig {
  area: string;
  temas: string[];
  quantidade: number;
}

const Questoes = () => {
  const [config, setConfig] = useState<QuestionConfig | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Handle touch swipe gestures for mobile
  useTouchGestures({
    onSwipeLeft: () => {
      if (questions && currentQuestionIndex < questions.length - 1) {
        handleNext();
      }
    },
    onSwipeRight: () => {
      if (currentQuestionIndex > 0) {
        handlePrevious();
      }
    },
    swipeThreshold: 80,
  });

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const { data: stats, isLoading: isLoadingStats } = useQuery({
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["question-stats"] });
      
      // Show confetti on correct answer
      if (variables.correct) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
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
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  };

  const handleReset = () => {
    setConfig(null);
    setCurrentQuestionIndex(0);
  };

  if (!config) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <BookOpen className="mr-2 h-6 w-6 text-primary" />
          Banco de Questões
        </h1>
        <QuestionSetup onStart={setConfig} />
      </div>
    );
  }

  if (isLoadingQuestions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!questions?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <BookOpen className="mr-2 h-6 w-6 text-primary" />
          Banco de Questões
        </h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">Nenhuma questão disponível</h2>
            <p className="text-muted-foreground text-center mb-6">
              Não foram encontradas questões para os filtros selecionados.
            </p>
            <Button onClick={handleReset}>
              Voltar aos filtros
            </Button>
          </CardContent>
        </Card>
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

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold flex items-center">
          <BookOpen className="mr-2 h-6 w-6 text-primary" />
          Banco de Questões
        </h1>
        <Button variant="outline" onClick={handleReset}>
          Voltar ao Menu
        </Button>
      </motion.div>
      
      <div className={cn("grid gap-6", isMobile ? "grid-cols-1" : "md:grid-cols-[1fr_300px]")}>
        <div className="space-y-6">
          {/* We add a key prop to force component re-mount when question changes */}
          <QuestionCard
            key={`question-${currentQuestion.id}`}
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
          
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={currentQuestionIndex === 0}
              className="flex items-center"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
            </Button>
            
            <div className="text-sm text-muted-foreground text-center">
              Questão {currentQuestionIndex + 1} de {questions.length}
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
              className="flex items-center"
            >
              Próxima <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {!isMobile && (
          <div className="space-y-6">
            <QuestionStats stats={stats} isLoading={isLoadingStats} />
            
            {/* Study Session Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Sessão de Estudo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Área:</span>
                      <span className="font-medium">{config.area}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Temas:</span>
                      <span className="font-medium">{config.temas.length} selecionados</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Questões:</span>
                      <span className="font-medium">{questions.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
        
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent className="py-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-2">
                    Deslize para o lado para navegar entre as questões
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      
      {/* Only show back to top button, not the full floating controls */}
      <AnimatePresence>
        {showBackToTop && 
          <motion.div 
            className="fixed right-4 bottom-20 z-50" 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.8 }} 
            transition={{ duration: 0.2 }}
          >
            <Button 
              variant="purple" 
              size="icon" 
              className="rounded-full h-12 w-12 shadow-lg" 
              onClick={scrollToTop} 
              title="Voltar ao topo"
            >
              <ArrowUp size={20} />
            </Button>
          </motion.div>
        }
      </AnimatePresence>
    </div>
  );
};

export default Questoes;
