
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuestionCard } from "@/components/questoes/QuestionCard";
import { QuestionStats } from "@/components/questoes/QuestionStats";
import { QuestionSetup } from "@/components/questoes/QuestionSetup";
import { Loader2, BookOpen, Target, ChevronLeft, ChevronRight, ArrowUp, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTouchGestures } from "@/hooks/use-touch-gestures";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface QuestionConfig {
  area: string;
  temas: string[];
  quantidade: number;
}

interface CompletionStatus {
  answered: number;
  total: number;
  percentage: number;
}

// Add this CSS for mobile navigation hiding during questions
const addQuestionsStyleToHead = () => {
  const styleId = 'questoes-mobile-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      body.questions-active .fixed.bottom-4 { 
        display: none !important; 
      }
      body.questions-active .fixed.bottom-0 {
        display: none !important;
      }
      @keyframes answer-correct {
        0% { background-color: rgba(34, 197, 94, 0.1); }
        50% { background-color: rgba(34, 197, 94, 0.3); }
        100% { background-color: rgba(34, 197, 94, 0.2); }
      }
      @keyframes answer-incorrect {
        0% { background-color: rgba(239, 68, 68, 0.1); }
        50% { background-color: rgba(239, 68, 68, 0.3); }
        100% { background-color: rgba(239, 68, 68, 0.2); }
      }
      .answer-correct {
        animation: answer-correct 0.8s ease;
      }
      .answer-incorrect {
        animation: answer-incorrect 0.8s ease;
      }
    `;
    document.head.appendChild(style);
  }
};

const Questoes = () => {
  const [config, setConfig] = useState<QuestionConfig | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Add styles for hiding mobile navigation
  useEffect(() => {
    addQuestionsStyleToHead();
    
    // Add body class to hide mobile navigation when in question mode
    if (config) {
      document.body.classList.add('questions-active');
    } else {
      document.body.classList.remove('questions-active');
    }
    
    return () => {
      document.body.classList.remove('questions-active');
    };
  }, [config]);

  // Handle touch swipe gestures for mobile
  useTouchGestures({
    onSwipeLeft: () => {
      if (questions && currentQuestionIndex < questions.length - 1 && 
         questions[currentQuestionIndex].respondida) {
        handleNext();
      }
    },
    onSwipeRight: () => {
      if (currentQuestionIndex > 0) {
        handlePrevious();
      }
    },
    swipeThreshold: 80
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
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  
  const {
    data: questions,
    isLoading: isLoadingQuestions
  } = useQuery({
    queryKey: ["questions", config],
    enabled: !!config,
    queryFn: async () => {
      let query = supabase.from("questoes").select("*, questao_estatisticas(total_tentativas, total_acertos)").eq("Area", config?.area);
      if (config?.temas.length) {
        query = query.in("Tema", config.temas);
      }
      const { data, error } = await query.limit(config?.quantidade || 10);
      if (error) throw error;
      
      // Add respondida field to track answer submission
      return data.map(q => ({...q, respondida: false}));
    }
  });
  
  const {
    data: stats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ["question-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_questoes_stats").select("*").maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  
  const answerMutation = useMutation({
    mutationFn: async ({
      questionId,
      answer,
      correct
    }: {
      questionId: number;
      answer: string;
      correct: boolean;
    }) => {
      try {
        const { error } = await supabase.from("user_questoes").insert({
          questao_id: questionId,
          resposta_selecionada: answer,
          acertou: correct
        });
        
        if (error) throw error;
        return { success: true };
      } catch (error) {
        console.error("Error submitting answer:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["question-stats"]
      });

      // Update the question as answered
      if (questions) {
        const updatedQuestions = [...questions];
        const questionIndex = updatedQuestions.findIndex(q => q.id === variables.questionId);
        if (questionIndex !== -1) {
          updatedQuestions[questionIndex].respondida = true;
          queryClient.setQueryData(["questions", config], updatedQuestions);
        }
      }

      // Show confetti on correct answer
      if (variables.correct) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: {
            y: 0.6
          }
        });
      }
    },
    onError: () => {
      toast.error("Erro ao registrar resposta. Tente novamente.");
    }
  });
  
  const handleAnswer = async (questionId: number, answer: string, correct: boolean): Promise<boolean> => {
    try {
      await answerMutation.mutateAsync({
        questionId,
        answer,
        correct
      });
      return true;
    } catch (error) {
      console.error("Erro ao registrar resposta:", error);
      throw error;
    }
  };
  
  const handleNext = () => {
    if (!questions) return;
    
    // Only allow navigation if current question is answered
    if (currentQuestionIndex < questions.length - 1 && questions[currentQuestionIndex].respondida) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }, 100);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }, 100);
    }
  };
  
  const handleReset = () => {
    setShowExitDialog(false);
    setConfig(null);
    setCurrentQuestionIndex(0);
  };

  const getCompletionStatus = (): CompletionStatus => {
    if (!questions || !questions.length) {
      return {
        answered: 0,
        total: 0,
        percentage: 0
      };
    }
    
    const answeredCount = questions.filter(q => q.respondida).length;
    return {
      answered: answeredCount,
      total: questions.length,
      percentage: (answeredCount / questions.length) * 100
    };
  };

  if (!config) {
    return <div className="container mx-auto px-4 py-8">
        <motion.h1 className="text-2xl font-bold mb-6 flex items-center" initial={{
        opacity: 0,
        y: -10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3
      }}>
          <BookOpen className="mr-2 h-6 w-6 text-primary" />
          Banco de Questões
        </motion.h1>
        <QuestionSetup onStart={setConfig} />
      </div>;
  }
  
  if (isLoadingQuestions) {
    return <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-center">Carregando questões...</p>
      </div>;
  }
  
  if (!questions?.length) {
    return <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          <BookOpen className="mr-2 h-6 w-6 text-primary" />
          Banco de Questões
        </h1>
        <Card className="border-primary/10 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">Nenhuma questão disponível</h2>
            <p className="text-muted-foreground text-center mb-6">
              Não foram encontradas questões para os filtros selecionados.
            </p>
            <Button onClick={handleReset} className="bg-primary hover:bg-primary/90">
              Voltar aos filtros
            </Button>
          </CardContent>
        </Card>
      </div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const questionStats = currentQuestion.questao_estatisticas?.[0];
  const percentualAcertos = questionStats?.total_tentativas ? (questionStats.total_acertos / questionStats.total_tentativas * 100).toFixed(1) : null;
  const respostas = {
    'A': currentQuestion.AnswerA,
    'B': currentQuestion.AnswerB,
    'C': currentQuestion.AnswerC,
    'D': currentQuestion.AnswerD
  };
  const completion = getCompletionStatus();
  const progress = (currentQuestionIndex + 1) / questions.length * 100;

  return <div className="container mx-auto py-5 md:py-8 md:px-6 px-3">
      <motion.div className="flex items-center justify-between mb-4 md:mb-6" initial={{
      opacity: 0,
      y: -10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.3
    }}>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowExitDialog(true)}
            className="mr-2 hover:bg-primary/5"
          >
            <X className="h-5 w-5" />
          </Button>
          <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold flex items-center`}>
            <BookOpen className={`mr-2 ${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
            Banco de Questões
          </h1>
        </div>

        <Badge variant="outline" className={`${isMobile ? 'text-xs' : 'text-sm'} bg-primary/10`}>
          {completion.answered}/{completion.total} respondidas
        </Badge>
      </motion.div>
      
      <div className={cn("grid gap-4 md:gap-6", isMobile ? "grid-cols-1" : "md:grid-cols-[1fr_300px]")}>
        <div className="space-y-4 md:space-y-6">
          {/* We add a key prop to force component re-mount when question changes */}
          <QuestionCard 
            key={`question-${currentQuestion.id}-${currentQuestionIndex}`} 
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
              size={isMobile ? "sm" : "default"}
              className={`flex items-center ${isMobile ? "text-xs" : ""} bg-card hover:bg-card/80 border-primary/20`}
            >
              <ChevronLeft className={`mr-1 ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} /> 
              {isMobile ? "Anterior" : "Anterior"}
            </Button>
            
            <div className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground text-center`}>
              {currentQuestionIndex + 1} / {questions.length}
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleNext} 
              disabled={currentQuestionIndex === questions.length - 1 || !currentQuestion.respondida} 
              size={isMobile ? "sm" : "default"}
              className={`flex items-center ${isMobile ? "text-xs" : ""} ${currentQuestion.respondida ? "border-primary/20 bg-card hover:bg-card/80" : "border-muted/20 bg-muted/20 text-muted-foreground"}`}
            >
              {isMobile ? "Próxima" : "Próxima"} <ChevronRight className={`ml-1 ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
            </Button>
          </div>
        </div>
        
        {!isMobile && <div className="space-y-6">
            <QuestionStats stats={stats} isLoading={isLoadingStats} />
            
            {/* Study Session Card */}
            <motion.div initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.2
        }}>
              <Card className="border-primary/10 shadow-lg bg-card/95 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-muted/20">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-primary" />
                    Sessão de Estudo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out" style={{
                    width: `${progress}%`
                  }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Respondidas:</span>
                      <span className="font-medium">
                        <Badge variant="outline" className="bg-primary/10">{completion.answered}</Badge> de {completion.total}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Área:</span>
                      <span className="font-medium">{config.area}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Temas:</span>
                      <span className="font-medium">{config.temas.length} selecionados</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full text-sm mt-2 border-primary/20"
                    onClick={() => setShowExitDialog(true)}
                  >
                    Encerrar Estudo
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>}
        
        {isMobile && <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3,
        delay: 0.2
      }}>
            <Card className="border-primary/10 shadow-sm bg-card/95 backdrop-blur-sm">
              <CardContent className="py-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Progresso</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-in-out" style={{
                  width: `${progress}%`
                }} />
                  </div>
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-muted-foreground">Respondidas: {completion.answered}/{completion.total}</span>
                    <span className="text-muted-foreground">{currentQuestion.respondida ? "✓" : "Aguardando resposta"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>}
      </div>
      
      {/* Back to top button */}
      <AnimatePresence>
        {showBackToTop && <motion.div className="fixed right-4 bottom-20 z-50" initial={{
        opacity: 0,
        scale: 0.8
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.8
      }} transition={{
        duration: 0.2
      }}>
            <Button size="icon" className="rounded-full shadow-lg bg-primary" onClick={scrollToTop}>
              <ArrowUp className="h-5 w-5" />
            </Button>
          </motion.div>}
      </AnimatePresence>

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar Sessão de Estudo?</AlertDialogTitle>
            <AlertDialogDescription>
              Você respondeu {completion.answered} de {completion.total} questões. 
              Tem certeza que deseja sair?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-primary/20">Continuar Estudando</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-primary">Encerrar Sessão</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};

export default Questoes;
