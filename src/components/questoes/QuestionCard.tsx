
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Bookmark, BookmarkCheck, Timer, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  // Fix: Using useEffect instead of useState for the timer
  useEffect(() => {
    if (!hasAnswered) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [hasAnswered]);

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
      <Card className="w-full">
        <motion.div
          variants={cardVariants}
          animate={hasAnswered ? "answered" : "initial"}
        >
          <CardHeader>
            <div className={cn("flex items-center justify-between gap-2 text-sm text-muted-foreground mb-2", 
              isMobile && "flex-col items-start gap-1"
            )}>
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
                {percentualAcertos && !isMobile && (
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
                      "flex items-center space-x-3 rounded-lg border p-4 transition-colors",
                      isMobile && "p-3 items-start",
                      getAnswerStyle(key)
                    )}
                    whileHover={!hasAnswered ? { scale: 1.01 } : {}}
                    whileTap={!hasAnswered ? { scale: 0.99 } : {}}
                  >
                    <div className={cn(
                      "flex items-center justify-center min-w-8 h-8 rounded-full border",
                      isMobile && "bg-muted/30",
                      selectedAnswer === key && !hasAnswered && "bg-primary/10 border-primary",
                      hasAnswered && key === respostaCorreta && "bg-success/10 border-success",
                      hasAnswered && key === selectedAnswer && key !== respostaCorreta && "bg-destructive/10 border-destructive"
                    )}>
                      <RadioGroupItem value={key} id={`answer-${key}`} className="mt-0" />
                    </div>
                    <Label 
                      htmlFor={`answer-${key}`} 
                      className={cn(
                        "flex-grow cursor-pointer",
                        isMobile && "text-sm pt-1"
                      )}
                    >
                      <div className="flex items-start">
                        <span className="font-semibold mr-2">{key}.</span>
                        <span>{value}</span>
                      </div>
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
          <CardFooter className={cn("flex flex-wrap gap-2", 
            isMobile && "flex-col"
          )}>
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer || hasAnswered}
              className={cn("flex-1", isMobile && "w-full")}
              variant={!hasAnswered ? "default" : undefined}
            >
              Responder
            </Button>
            
            {hasAnswered && onNext && (
              <Button 
                onClick={onNext} 
                variant="outline" 
                className={cn("flex-1", isMobile && "w-full")}
              >
                Próxima
              </Button>
            )}
            
            {!isMobile && (
              <>
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
              </>
            )}
            
            {isMobile && (
              <div className="flex justify-between w-full">
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
              </div>
            )}
          </CardFooter>
        </motion.div>
      </Card>
    </motion.div>
  );
};
