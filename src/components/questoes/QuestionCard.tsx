
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect, useRef } from "react";
import { CheckCircle2, XCircle, Bookmark, BookmarkCheck, Timer, Share2, Award, ChevronRight } from "lucide-react";
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
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Corrigido: usando window.setInterval ao invés de NodeJS.Timeout
  useEffect(() => {
    if (!hasAnswered) {
      // Limpa o timer anterior se existir
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      // Cria um novo timer
      timerRef.current = window.setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [hasAnswered]);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer("");
    setHasAnswered(false);
    setTimeSpent(0);
    
    // Clear any existing timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Start new timer
    timerRef.current = window.setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [id]);

  const handleSubmit = () => {
    if (!selectedAnswer || hasAnswered) return;
    
    // Stop timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const isCorrect = selectedAnswer === respostaCorreta;
    setHasAnswered(true);
    onAnswer(id, selectedAnswer, isCorrect);
    
    // Show success/error toast with animation
    if (isCorrect) {
      toast({
        title: "Resposta correta!",
        description: `Você acertou em ${formatTime(timeSpent)}`,
        variant: "success",
      });
    } else {
      toast({
        title: "Resposta incorreta",
        description: "Verifique a explicação para entender o tema.",
        variant: "destructive",
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

  // Variante para a entrada de novas questões
  const questionEntryVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  // Variantes para o feedback
  const feedbackVariants = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto", transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      key={`question-${id}`}
      variants={questionEntryVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
    >
      <Card className="w-full gradient-card shadow-purple border-primary/30">
        <motion.div
          variants={cardVariants}
          animate={hasAnswered ? "answered" : "initial"}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <CardHeader>
            <div className={cn("flex items-center justify-between gap-2 text-sm text-muted-foreground mb-2", 
              isMobile && "flex-col items-start gap-1"
            )}>
              <div className="flex items-center gap-2">
                {area && (
                  <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs backdrop-blur-sm">
                    {area}
                  </span>
                )}
                {tema && (
                  <>
                    <span>•</span>
                    <span>{tema}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {percentualAcertos && !isMobile && (
                  <div className="flex items-center text-sm text-muted-foreground bg-card/50 px-2 py-1 rounded-full backdrop-blur-sm">
                    <Award className="h-3 w-3 mr-1 text-secondary" />
                    Taxa de acerto: {percentualAcertos}%
                  </div>
                )}
                <div className="flex items-center text-xs bg-muted/50 px-2 py-1 rounded-full backdrop-blur-sm">
                  <Timer className="h-3 w-3 mr-1" />
                  {formatTime(timeSpent)}
                </div>
              </div>
            </div>
            <CardTitle className="text-lg md:text-xl font-medium leading-relaxed">
              <motion.div 
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-primary/5 p-3 rounded-lg border border-primary/10"
              >
                {pergunta}
              </motion.div>
            </CardTitle>
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
                      "flex items-center space-x-3 rounded-lg border p-4 transition-colors shadow-sm",
                      isMobile && "p-3 items-start",
                      selectedAnswer === key && !hasAnswered && "bg-primary/10 border-primary/30",
                      getAnswerStyle(key),
                      hasAnswered && key === respostaCorreta && "bg-success/10 border-success",
                      hasAnswered && key === selectedAnswer && key !== respostaCorreta && "bg-destructive/10 border-destructive"
                    )}
                    whileHover={!hasAnswered ? { scale: 1.01, backgroundColor: "rgba(139, 92, 246, 0.05)" } : {}}
                    whileTap={!hasAnswered ? { scale: 0.99 } : {}}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: parseInt(key.charCodeAt(0).toString()) * 0.1 }}
                  >
                    <div className={cn(
                      "relative flex items-center justify-center min-w-8 h-8 rounded-full border transition-all",
                      isMobile && "bg-muted/30",
                      selectedAnswer === key && !hasAnswered && "bg-primary/20 border-primary",
                      hasAnswered && key === respostaCorreta && "bg-success/20 border-success",
                      hasAnswered && key === selectedAnswer && key !== respostaCorreta && "bg-destructive/20 border-destructive"
                    )}>
                      <RadioGroupItem 
                        value={key} 
                        id={`answer-${key}`} 
                        className={cn(
                          "mt-0 transition-transform duration-200",
                          selectedAnswer === key && "scale-[0.9]",
                          hasAnswered && key === respostaCorreta && "animate-pulse-subtle"
                        )}
                      />
                    </div>
                    <Label 
                      htmlFor={`answer-${key}`} 
                      className={cn(
                        "flex-grow cursor-pointer transition-colors",
                        isMobile && "text-sm pt-1"
                      )}
                    >
                      <div className="flex items-start">
                        <span className="font-semibold mr-2">{key}.</span>
                        <span>{value}</span>
                      </div>
                    </Label>
                    {hasAnswered && key === respostaCorreta && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </motion.div>
                    )}
                    {hasAnswered && key === selectedAnswer && key !== respostaCorreta && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <XCircle className="h-5 w-5 text-destructive" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
            </RadioGroup>

            <AnimatePresence>
              {hasAnswered && (
                <motion.div
                  variants={feedbackVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Alert className={cn(
                    selectedAnswer === respostaCorreta 
                    ? "bg-success/10 text-success-foreground border-success/30" 
                    : "bg-destructive/10 text-destructive-foreground border-destructive/30",
                    "backdrop-blur-sm"
                  )}>
                    <AlertTitle className="flex items-center gap-2">
                      {selectedAnswer === respostaCorreta ? (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            Parabéns! Você acertou!
                          </motion.span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5" />
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            Não foi dessa vez...
                          </motion.span>
                        </>
                      )}
                    </AlertTitle>
                    {comentario && (
                      <AlertDescription className="mt-3 text-foreground">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          className="prose prose-sm dark:prose-invert"
                        >
                          {comentario}
                        </motion.div>
                      </AlertDescription>
                    )}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
          <CardFooter className={cn("flex flex-wrap gap-2", 
            isMobile && "flex-col"
          )}>
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer || hasAnswered}
              className={cn(
                "flex-1 transition-all duration-300", 
                isMobile && "w-full", 
                !hasAnswered && "gradient-button"
              )}
              variant={!hasAnswered ? "default" : undefined}
            >
              <motion.div
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Responder
              </motion.div>
            </Button>
            
            {hasAnswered && onNext && (
              <Button 
                onClick={onNext} 
                variant="outline" 
                className={cn("flex-1 hover:bg-primary/10", isMobile && "w-full")}
              >
                <motion.div 
                  className="flex items-center"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Próxima
                  <ChevronRight className="ml-1 h-4 w-4" />
                </motion.div>
              </Button>
            )}
            
            {!isMobile && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleBookmark}
                  title={isBookmarked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  className="hover-glow"
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </motion.div>
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link copiado!",
                      description: "Link para esta questão copiado para a área de transferência",
                    });
                  }}
                  title="Compartilhar esta questão"
                  className="hover-glow"
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: isBookmarked ? [0, -15, 15, -10, 10, 0] : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Share2 className="h-4 w-4" />
                  </motion.div>
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
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </motion.div>
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link copiado!",
                      description: "Link para esta questão copiado para a área de transferência",
                    });
                  }}
                  title="Compartilhar esta questão"
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    <Share2 className="h-4 w-4" />
                  </motion.div>
                </Button>
              </div>
            )}
          </CardFooter>
        </motion.div>
      </Card>
    </motion.div>
  );
};
