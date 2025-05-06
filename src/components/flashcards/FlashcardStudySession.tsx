
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  RotateCcw, 
  BookmarkPlus, 
  Volume2,
  Flag,
  PenLine,
  Share2,
  Clock
} from "lucide-react";
import { FlashcardView } from "./FlashcardView";
import { FlashcardRating } from "./FlashcardRating";
import { useToast } from "@/hooks/use-toast";
import { useFlashcardProgress } from "@/hooks/useFlashcardProgress";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export type FlashCard = {
  id: string | number;
  area: string;
  tema: string;
  pergunta: string;
  resposta: string;
  explicacao: string | null;
};

interface FlashcardStudySessionProps {
  cards: FlashCard[];
  initialIndex?: number;
  showAnswers?: boolean;
  studyMode?: "manual" | "auto";
  autoNarrate?: boolean;
  autoSpeed?: number;
  onComplete?: () => void;
  onExit?: () => void;
}

export function FlashcardStudySession({
  cards,
  initialIndex = 0,
  showAnswers = false,
  studyMode = "manual",
  autoNarrate = false,
  autoSpeed = 3500,
  onComplete,
  onExit
}: FlashcardStudySessionProps) {
  const [index, setIndex] = useState(initialIndex);
  const [showingAnswer, setShowingAnswer] = useState(showAnswers);
  const [isRating, setIsRating] = useState(false);
  const [annotation, setAnnotation] = useState("");
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [cardNotes, setCardNotes] = useState<Record<string | number, string>>({});
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { updateProgress } = useFlashcardProgress();
  
  // For auto mode
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (studyMode === "auto" && cards.length > 0 && !isRating && !showAnnotationDialog) {
      intervalId = setInterval(() => {
        if (!showingAnswer) {
          setShowingAnswer(true);
        } else {
          setIndex((current) => {
            if (current >= cards.length - 1) {
              clearInterval(intervalId!);
              onComplete?.();
              return current;
            }
            return current + 1;
          });
          setShowingAnswer(showAnswers);
        }
      }, autoSpeed);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [studyMode, cards.length, autoSpeed, isRating, showingAnswer, showAnswers, onComplete, showAnnotationDialog]);
  
  // Reset showingAnswer when index changes
  useEffect(() => {
    setShowingAnswer(showAnswers);
    setIsRating(false);
  }, [index, showAnswers]);
  
  if (cards.length === 0) {
    return (
      <Card className="p-6 text-center bg-gradient-to-br from-[#1A1633] via-[#262051] to-[#1A1633]">
        <p className="text-muted-foreground mb-4">
          Nenhum flashcard disponível com os filtros selecionados.
        </p>
        <Button 
          onClick={onExit}
          className="bg-gradient-to-r from-primary/90 to-purple-600/90 shadow-lg hover:shadow-purple/20 border border-primary/20 transition-all duration-300"
        >Voltar</Button>
      </Card>
    );
  }

  const currentCard = cards[index];
  const progress = ((index + 1) / cards.length) * 100;
  
  const handleNext = () => {
    if (index < cards.length - 1) {
      setIndex(index + 1);
    } else {
      onComplete?.();
    }
  };
  
  const handlePrevious = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };
  
  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * cards.length);
    setIndex(randomIndex);
  };
  
  const handleRate = async (level: 0 | 1 | 2 | 3 | 4 | 5) => {
    await updateProgress(currentCard.id, level);
    setIsRating(false);
    toast({
      title: "Progresso atualizado",
      description: "Seu conhecimento deste flashcard foi atualizado."
    });
    
    // Move to next card after rating
    setTimeout(handleNext, 500);
  };
  
  const handleSaveAnnotation = () => {
    setCardNotes(prev => ({
      ...prev,
      [currentCard.id]: annotation
    }));
    
    setShowAnnotationDialog(false);
    
    toast({
      title: "Anotação salva",
      description: "Sua anotação para este flashcard foi salva."
    });
  };
  
  const handleOpenAnnotation = () => {
    setAnnotation(cardNotes[currentCard.id] || "");
    setShowAnnotationDialog(true);
  };
  
  const handleShare = () => {
    // Copy to clipboard functionality
    navigator.clipboard.writeText(`${currentCard.pergunta}\n\nResposta: ${currentCard.resposta}`);
    
    toast({
      title: "Copiado para a área de transferência",
      description: "O conteúdo do flashcard foi copiado para a área de transferência."
    });
  };

  return (
    <div className="flex flex-col w-full">
      {/* Progress bar and info */}
      <div className="w-full mb-4 space-y-1">
        <div className="flex justify-between text-sm">
          <span>Cartão {index + 1} de {cards.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1 bg-[#1A1633] border border-primary/10">
          <div className="h-full bg-gradient-to-r from-primary/90 to-purple-600/90" style={{ width: `${progress}%` }} />
        </Progress>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentCard.id}-${showingAnswer ? 'answer' : 'question'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {isRating ? (
            <motion.div 
              className="flex flex-col items-center p-6 bg-gradient-to-br from-[#1A1633] via-[#262051] to-[#1A1633] rounded-lg shadow-md border border-primary/20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-medium mb-6">Como você avalia seu conhecimento?</h3>
              <FlashcardRating onRate={handleRate} className="max-w-lg" />
            </motion.div>
          ) : (
            <FlashcardView
              question={currentCard.pergunta}
              answer={currentCard.resposta}
              explanation={currentCard.explicacao}
              showAnswer={showingAnswer}
              onShowAnswer={() => setShowingAnswer(true)}
            />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Control buttons */}
      {studyMode === "manual" && !isRating && (
        <div className="flex flex-wrap gap-2 mt-6 justify-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={index === 0}
            size={isMobile ? "default" : "lg"}
            className="bg-[#1A1633]/50 border-primary/10 hover:bg-primary/20"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Anterior
          </Button>
          
          {showingAnswer ? (
            <Button
              variant="default"
              onClick={() => setIsRating(true)}
              size={isMobile ? "default" : "lg"}
              className="bg-gradient-to-r from-primary/90 to-purple-600/90 shadow-lg hover:shadow-purple/20 border border-primary/20 transition-all duration-300"
            >
              Avaliar Conhecimento
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleRandom}
              size={isMobile ? "default" : "lg"}
              className="bg-[#1A1633]/50 border-primary/10 hover:bg-primary/20"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Aleatório
            </Button>
          )}
          
          {index < cards.length - 1 && (
            <Button
              variant="outline"
              onClick={handleNext}
              size={isMobile ? "default" : "lg"}
              className="bg-[#1A1633]/50 border-primary/10 hover:bg-primary/20"
            >
              Próximo
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          )}
          
          {index === cards.length - 1 && showingAnswer && (
            <Button
              variant="default"
              onClick={onComplete}
              size={isMobile ? "default" : "lg"}
              className="bg-gradient-to-r from-primary/90 to-purple-600/90 shadow-lg hover:shadow-purple/20 border border-primary/20 transition-all duration-300"
            >
              Finalizar Estudo
            </Button>
          )}
        </div>
      )}
      
      {/* Secondary actions */}
      <div className="flex justify-between mt-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onExit} 
          title="Sair do estudo"
          className="hover:bg-primary/10"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-primary/10"
                title="Tempo de revisão"
              >
                <Clock className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1A1633] border-primary/20">
              <DialogHeader>
                <DialogTitle>Intervalo de revisão</DialogTitle>
                <DialogDescription>
                  Este flashcard está programado para revisão conforme seu nível de conhecimento.
                </DialogDescription>
              </DialogHeader>
              <div className="py-2">
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span>Nível atual:</span>
                  <span className="font-medium text-primary">Iniciante</span>
                </div>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span>Próxima revisão:</span>
                  <span className="font-medium">Amanhã</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Intervalo:</span>
                  <span className="font-medium">1 dia</span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-primary/10"
            title="Fazer anotação"
            onClick={handleOpenAnnotation}
          >
            <PenLine className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-primary/10"
            title="Compartilhar"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-primary/10" 
            title="Salvar para revisão"
            onClick={() => {
              toast({
                title: "Cartão salvo",
                description: "Cartão adicionado à sua lista de favoritos."
              });
          }}>
            <BookmarkPlus className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-primary/10"
            title="Reportar problema" 
            onClick={() => {
              toast({
                title: "Flashcard reportado",
                description: "Obrigado por nos ajudar a melhorar o conteúdo."
              });
          }}>
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Annotation Dialog */}
      <Dialog open={showAnnotationDialog} onOpenChange={setShowAnnotationDialog}>
        <DialogContent className="bg-[#1A1633] border-primary/20">
          <DialogHeader>
            <DialogTitle>Anotações</DialogTitle>
            <DialogDescription>
              Adicione suas anotações pessoais sobre este flashcard.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Escreva suas anotações aqui..."
            className="min-h-[150px] bg-[#262051] border-primary/20"
            value={annotation}
            onChange={(e) => setAnnotation(e.target.value)}
          />
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAnnotationDialog(false)}
              className="bg-[#1A1633]/80 border-primary/20"
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveAnnotation}>Salvar anotação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
