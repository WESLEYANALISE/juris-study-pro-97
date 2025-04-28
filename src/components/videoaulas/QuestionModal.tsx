
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface QuestionModalProps {
  question: any;
  onAnswer: (answer: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuestionModal({ question, onAnswer, open, onOpenChange }: QuestionModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");

  const handleSubmit = () => {
    if (selectedAnswer) {
      onAnswer(selectedAnswer);
      setSelectedAnswer("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pergunta do Vídeo</DialogTitle>
        </DialogHeader>
        
        {question && (
          <div className="space-y-4">
            <p className="text-lg">{question.question}</p>
            
            <div className="space-y-2">
              {question.options.map((option: string, index: number) => (
                <Button
                  key={index}
                  variant={selectedAnswer === option ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </div>

            <Button 
              className="w-full"
              onClick={handleSubmit}
              disabled={!selectedAnswer}
            >
              Responder
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
