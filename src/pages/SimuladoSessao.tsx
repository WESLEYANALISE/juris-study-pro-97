
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useSimulado } from "@/hooks/use-simulado";
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
  
  const categoria = location.state?.categoria as SimuladoCategoria;
  const { useQuestoes, useSubmitResposta } = useSimulado(categoria);
  const { data: questoes } = useQuestoes();
  const submitResposta = useSubmitResposta();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);
  
  if (!questoes?.length) {
    return <div>Carregando questões...</div>;
  }

  const currentQuestionData = questoes[currentQuestion];
  const progress = (currentQuestion + 1) / questoes.length * 100;

  const handleAnswer = (value: 'A' | 'B' | 'C' | 'D') => {
    setAnswers({ ...answers, [currentQuestionData.id]: value });
  };

  const handleNext = async () => {
    if (!answers[currentQuestionData.id]) {
      toast({
        title: "Selecione uma resposta",
        description: "Você precisa selecionar uma resposta antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    await submitResposta.mutateAsync({
      sessao_id: id!,
      questao_id: currentQuestionData.id,
      resposta_selecionada: answers[currentQuestionData.id],
      acertou: answers[currentQuestionData.id] === currentQuestionData.alternativa_correta,
      tempo_resposta: 0, // TODO: Implement timer
    });

    if (currentQuestion < questoes.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      navigate(`/simulados/resultado/${id}`);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Progress value={progress} className="mb-6" />
      
      <Card>
        <CardHeader>
          <CardTitle>
            Questão {currentQuestion + 1} de {questoes.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg">{currentQuestionData.questao}</div>
          
          <RadioGroup
            value={answers[currentQuestionData.id]}
            onValueChange={handleAnswer}
          >
            <div className="space-y-4">
              {['A', 'B', 'C', 'D'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${option}`} />
                  <Label htmlFor={`option-${option}`}>
                    {currentQuestionData[`alternativa_${option.toLowerCase()}`]}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Anterior
          </Button>
          <Button onClick={handleNext}>
            {currentQuestion < questoes.length - 1 ? "Próxima" : "Finalizar"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SimuladoSessao;
