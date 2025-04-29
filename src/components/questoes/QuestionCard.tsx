
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { CheckCircle2, XCircle, Bookmark, BookmarkCheck, Timer, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface QuestionCardProps {
  id: number;
  area: string | null;
  tema: string | null;
  pergunta: string;
  respostas: { [key: string]: string | null };
  respostaCorreta: string | null;
  comentario?: string;
  percentualAcertos: string | null;
  onAnswer: (questionId: number, answer: string, correct: boolean) => void;
  onNext?: () => void;
}

export const QuestionCard = ({
  id,
  area,
  tema,
  pergunta,
  respostas,
  respostaCorreta,
  comentario,
  percentualAcertos,
  onAnswer,
  onNext,
}: QuestionCardProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const { toast } = useToast();

  // Timer effect
  useState(() => {
    if (!hasAnswered) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  });

  const handleSubmit = () => {
    if (!selectedAnswer || hasAnswered) return;
    const isCorrect = selectedAnswer === respostaCorreta;
    setHasAnswered(true);
    onAnswer(id, selectedAnswer, isCorrect);
    
    // Show success/error toast
    if (isCorrect) {
      toast({
        title: "Resposta correta!",
        description: `Você acertou em ${formatTime(timeSpent)}`,
        variant: "success",
      });
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Questão removida dos favoritos" : "Questão adicionada aos favoritos",
      variant: "default",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnswerStyle = (answer: string) => {
    if (!hasAnswered) return "";
    if (answer === respostaCorreta) return "border-success text-success";
    if (answer === selectedAnswer) return "border-destructive text-destructive";
    return "";
  };

  // Calculate animation variants for the card
  const cardVariants = {
    answered: {
      scale: [1, 1.02, 1],
      transition: { duration: 0.3 }
    },
    initial: {
      scale: 1
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="w-full"
        as={motion.div}
        variants={cardVariants}
        animate={hasAnswered ? "answered" : "initial"}
      >
        <CardHeader>
          <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-2">
              {area && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">{area}</span>}
              {tema && (
                <>
                  <span>•</span>
                  <span>{tema}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {percentualAcertos && (
                <div className="text-sm text-muted-foreground">
                  Taxa de acerto: {percentualAcertos}%
                </div>
              )}
              <div className="flex items-center text-xs bg-muted/50 px-2 py-1 rounded-full">
                <Timer className="h-3 w-3 mr-1" />
                {formatTime(timeSpent)}
              </div>
            </div>
          </div>
          <CardTitle className="text-lg font-medium">{pergunta}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            className="space-y-3"
            disabled={hasAnswered}
          >
            {Object.entries(respostas)
              .filter(([_, value]) => value !== null)
              .map(([key, value]) => (
                <motion.div
                  key={key}
                  className={cn(
                    "flex items-center space-x-2 rounded-lg border p-4 transition-colors",
                    getAnswerStyle(key)
                  )}
                  whileHover={!hasAnswered ? { scale: 1.01 } : {}}
                  whileTap={!hasAnswered ? { scale: 0.99 } : {}}
                >
                  <RadioGroupItem value={key} id={`answer-${key}`} />
                  <Label htmlFor={`answer-${key}`} className="flex-grow cursor-pointer">
                    {value}
                  </Label>
                  {hasAnswered && key === respostaCorreta && (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  )}
                  {hasAnswered && key === selectedAnswer && key !== respostaCorreta && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </motion.div>
              ))}
          </RadioGroup>

          {hasAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <Alert className={cn(
                selectedAnswer === respostaCorreta 
                ? "bg-success/10 text-success border-success/20" 
                : "bg-destructive/10 text-destructive border-destructive/20"
              )}>
                <AlertTitle className="flex items-center gap-2">
                  {selectedAnswer === respostaCorreta ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Parabéns! Você acertou!
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5" />
                      Não foi dessa vez...
                    </>
                  )}
                </AlertTitle>
                {comentario && (
                  <AlertDescription className="mt-2 text-foreground">
                    {comentario}
                  </AlertDescription>
                )}
              </Alert>
            </motion.div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer || hasAnswered}
            className="flex-1"
            variant={!hasAnswered ? "default" : undefined}
          >
            Responder
          </Button>
          
          {hasAnswered && onNext && (
            <Button onClick={onNext} variant="outline" className="flex-1">
              Próxima
            </Button>
          )}
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleBookmark}
            title={isBookmarked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              toast({
                title: "Link copiado!",
                description: "Link para esta questão copiado para a área de transferência",
              });
            }}
            title="Compartilhar esta questão"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
