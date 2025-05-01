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
import { supabase } from "@/integrations/supabase/client";

// Type guard to check if an object is a valid question
const isValidQuestion = (item: any): item is Questao => {
  return (
    item &&
    typeof item === 'object' &&
    'id' in item &&
    'questao' in item &&
    'alternativa_a' in item &&
    'alternativa_b' in item &&
    'alternativa_c' in item &&
    'alternativa_d' in item &&
    'alternativa_correta' in item
  );
};

const SimuladoSessao = () => {
  const { categoria, sessaoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [questionTimer, setQuestionTimer] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [animationDirection, setAnimationDirection] = useState<"next" | "prev">("next");
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<{
    id: string;
    categoria: SimuladoCategoria;
    total_questoes: number;
  } | null>(null);
  
  const categoriaUpper = categoria?.toUpperCase() as SimuladoCategoria || "OAB";
  const { useSubmitResposta } = useSimulado(categoriaUpper);
  const submitResposta = useSubmitResposta();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Fetch session and questions
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessaoId || !categoria) return;
      
      try {
        // Fetch session details
        const { data: sessionData, error: sessionError } = await supabase
          .from('simulado_sessoes')
          .select('*')
          .eq('id', sessaoId)
          .single();
          
        if (sessionError) throw sessionError;
        if (!sessionData) {
          toast({
            title: "Sessão não encontrada",
            description: "A sessão de simulado solicitada não foi encontrada.",
            variant: "destructive"
          });
          navigate("/simulados");
          return;
        }
        
        // Type assertion to ensure data conforms to expected type
        setSessionInfo({
          id: sessionData.id,
          categoria: sessionData.categoria as SimuladoCategoria,
          total_questoes: sessionData.total_questoes
        });
        
        // Now fetch questions from the appropriate table based on categoria
        let tableName;
        switch(categoriaUpper) {
          case 'OAB': tableName = 'simulados_oab'; break;
          case 'PRF': tableName = 'simulados_prf'; break;
          case 'PF': tableName = 'simulados_pf'; break;
          case 'TJSP': tableName = 'simulados_tjsp'; break;
          case 'JUIZ': tableName = 'simulados_juiz'; break;
          case 'PROMOTOR': tableName = 'simulados_promotor'; break;
          case 'DELEGADO': tableName = 'simulados_delegado'; break;
          default: tableName = 'simulados_oab';
        }
        
        // Fetch random questions from the table
        const { data: questoesData, error: questoesError } = await supabase
          .from(tableName)
          .select('*')
          .limit(sessionData.total_questoes);
        
        if (questoesError) throw questoesError;
        
        if (questoesData && Array.isArray(questoesData)) {
          // Filter and map valid questions with proper type checking
          const validQuestoes = questoesData
            .filter(q => isValidQuestion(q))
            .map(q => ({
              id: q.id || '', 
              ano: q.ano || '',
              banca: q.banca || '',
              numero_questao: q.numero_questao || '',
              questao: q.questao || '',
              alternativa_a: q.alternativa_a || '',
              alternativa_b: q.alternativa_b || '',
              alternativa_c: q.alternativa_c || '',
              alternativa_d: q.alternativa_d || '',
              alternativa_correta: (q.alternativa_correta as 'A' | 'B' | 'C' | 'D') || 'A',
              imagem_url: q.imagem_url,
              area: q.area,
              explicacao: q.explicacao
            })) as Questao[];
          
          setQuestoes(validQuestoes);
        } else {
          setQuestoes([]);
        }
        
        // Fetch existing answers
        const { data: respostasData, error: respostasError } = await supabase
          .from('simulado_respostas')
          .select('questao_id, resposta_selecionada')
          .eq('sessao_id', sessaoId);
          
        if (respostasError) throw respostasError;
        
        // Map existing answers to state
        if (respostasData && respostasData.length) {
          const answersMap: Record<string, 'A' | 'B' | 'C' | 'D'> = {};
          respostasData.forEach(resp => {
            if (resp.resposta_selecionada) {
              answersMap[resp.questao_id] = resp.resposta_selecionada as 'A' | 'B' | 'C' | 'D';
            }
          });
          setAnswers(answersMap);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do simulado:", error);
        toast({
          title: "Erro ao carregar simulado",
          description: "Ocorreu um erro ao carregar os dados do simulado.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessionData();
  }, [sessaoId, categoria, categoriaUpper, navigate, toast, user]);

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
        <Button onClick={() => navigate(`/simulados/${categoria}`)}>Voltar para Simulados</Button>
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
      sessao_id: sessaoId!,
      questao_id: currentQuestionData.id,
      resposta_selecionada: answers[currentQuestionData.id],
      acertou: answers[currentQuestionData.id] === currentQuestionData.alternativa_correta,
      tempo_resposta: questionTimer
    });

    if (currentQuestion < questoes.length - 1) {
      setAnimationDirection("next");
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Update session as complete
      if (sessaoId) {
        await supabase
          .from('simulado_sessoes')
          .update({ 
            completo: true,
            data_fim: new Date().toISOString()
          })
          .eq('id', sessaoId);
      }
      navigate(`/simulados/resultado/${sessaoId}`);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Simulado {sessionInfo?.categoria}</h1>
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
                  Área: {currentQuestionData.area} • Ano: {currentQuestionData.ano} • Banca: {currentQuestionData.banca}
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
