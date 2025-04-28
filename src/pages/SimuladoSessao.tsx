
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useSimulado } from "@/hooks/use-simulado";
import { Clock, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SimuladoCategoria, Questao } from "@/types/simulados";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const SimuladoSessao = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [questionTimer, setQuestionTimer] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [animationDirection, setAnimationDirection] = useState<"next" | "prev">("next");
  
  const categoria = location.state?.categoria as SimuladoCategoria;
  const { useQuestoes, useSubmitResposta } = useSimulado(categoria);
  const { data: questoes, isLoading } = useQuestoes();
  const submitResposta = useSubmitResposta();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Timer effect
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setQuestionTimer(prev => prev + 1);
      setTotalTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, []);

  // Reset question timer when changing questions
  useEffect(() => {
    setQuestionTimer(0);
  }, [currentQuestion]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex flex-col items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Carregando questões...</p>
      </div>
    );
  }

  if (!questoes?.length) {
    return (
      <div className="container mx-auto py-12 flex flex-col items-center justify-center h-[60vh]">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Nenhuma questão encontrada</h2>
        <p className="text-muted-foreground mb-6">Não foi possível carregar as questões para este simulado.</p>
        <Button onClick={() => navigate("/simulados")}>Voltar para Simulados</Button>
      </div>
    );
  }

  const currentQuestionData = questoes[currentQuestion];
  const progress = ((currentQuestion + 1) / questoes.length) * 100;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (value: 'A' | 'B' | 'C' | 'D') => {
    setAnswers({
      ...answers,
      [currentQuestionData.id]: value
    });
  };

  const handleNext = async () => {
    if (!answers[currentQuestionData.id]) {
      toast({
        title: "Selecione uma resposta",
        description: "Você precisa selecionar uma resposta antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    await submitResposta.mutateAsync({
      sessao_id: id!,
      questao_id: currentQuestionData.id,
      resposta_selecionada: answers[currentQuestionData.id],
      acertou: answers[currentQuestionData.id] === currentQuestionData.alternativa_correta,
      tempo_resposta: questionTimer
    });

    if (currentQuestion < questoes.length - 1) {
      setAnimationDirection("next");
      setCurrentQuestion(currentQuestion + 1);
    } else {
      navigate(`/simulados/resultado/${id}`);
    }
  };

  const handlePrevious = () => {
    setAnimationDirection("prev");
    setCurrentQuestion(Math.max(0, currentQuestion - 1));
  };

  const variants = {
    enter: (direction: "next" | "prev") => {
      return {
        x: direction === "next" ? 300 : -300,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: "next" | "prev") => {
      return {
        zIndex: 0,
        x: direction === "next" ? -300 : 300,
        opacity: 0
      };
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl px-4">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Simulado {categoria}</h1>
          <div className="flex items-center gap-2 text-muted-foreground bg-card p-2 rounded-md border">
            <Clock className="h-5 w-5" />
            <span className="font-mono">{formatTime(totalTime)}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Questão {currentQuestion + 1} de {questoes.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
      
      <AnimatePresence custom={animationDirection} mode="wait">
        <motion.div
          key={currentQuestion}
          custom={animationDirection}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full"
        >
          <Card className="border bg-card/50 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  Questão {currentQuestion + 1}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-1 rounded-md">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{formatTime(questionTimer)}</span>
                </div>
              </div>
              {currentQuestionData.area && (
                <CardDescription className="text-sm">
                  Área: {currentQuestionData.area} • Ano: {currentQuestionData.ano}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-lg">{currentQuestionData.questao}</div>
              
              {currentQuestionData.imagem_url && (
                <div className="flex justify-center my-4">
                  <img
                    src={currentQuestionData.imagem_url}
                    alt="Questão"
                    className="max-h-64 rounded-md border"
                  />
                </div>
              )}
              
              <RadioGroup value={answers[currentQuestionData.id]} onValueChange={handleAnswer}>
                <div className="space-y-4">
                  {['A', 'B', 'C', 'D'].map(option => (
                    <motion.div
                      key={option}
                      className="flex items-start space-x-2 rounded-lg border p-3 hover:bg-accent/30 transition-all"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <RadioGroupItem value={option} id={`option-${option}`} className="mt-1" />
                      <Label htmlFor={`option-${option}`} className="flex-grow cursor-pointer">
                        <span className="font-semibold mr-2">{option})</span>
                        {currentQuestionData[`alternativa_${option.toLowerCase()}`]}
                      </Label>
                    </motion.div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <Button
                onClick={handleNext}
                className="flex items-center gap-2"
                disabled={!answers[currentQuestionData.id]}
              >
                {currentQuestion < questoes.length - 1 ? "Próxima" : "Finalizar"}
                {currentQuestion < questoes.length - 1 ? 
                  <ArrowRight className="h-4 w-4" /> : 
                  <Clock className="h-4 w-4" />
                }
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
      
      <div className="mt-6 flex justify-center">
        <div className="text-center text-sm text-muted-foreground">
          <p>Tempo total: {formatTime(totalTime)}</p>
          <p>Respostas: {Object.keys(answers).length}/{questoes.length}</p>
        </div>
      </div>
    </div>
  );
};

export default SimuladoSessao;
